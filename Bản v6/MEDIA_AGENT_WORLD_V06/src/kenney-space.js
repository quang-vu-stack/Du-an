/* MEDIA Agent World V0.6 - Kenney Modular Space Kit 1.0 scene integration.
   Kenney asset license: CC0. No paid API, Three.js, network calls or build tools.
   GLB 2.0 parser intentionally limited to the verified, unskinned static Kenney models
   shipped in this package (POSITION, NORMAL, TEXCOORD_0, indexed triangles).
   For new GLB model families, extend the parser or use a complete glTF loader. */
(function (root) {
  'use strict';
  const base=root.MEDIA_KENNEY_PACKED;
  function must(v,message){if(!v)throw Error(message);return v;}
  function compile(gl,kind,src){const sh=gl.createShader(kind);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
  function makeProgram(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
  const vertex=`attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV;
  uniform mat4 uModel; uniform mat4 uVP; varying vec2 vUV;varying vec3 vNormal; varying vec3 vWorld;
  void main(){vec4 w=uModel*vec4(aPosition,1.0);vWorld=w.xyz;vNormal=mat3(uModel)*aNormal;vUV=aUV;gl_Position=uVP*w;}`;
  const fragment=`precision mediump float; varying vec2 vUV;varying vec3 vNormal;varying vec3 vWorld;
  uniform sampler2D uAtlas;uniform vec3 uCamera;
  void main(){vec4 tex=texture2D(uAtlas,vUV);if(tex.a<0.16)discard;
  float lighting=.60+.48*max(dot(normalize(vNormal),normalize(vec3(-.45,.86,.43))),0.0);
  vec3 col=tex.rgb*lighting;float fog=smoothstep(30.,85.,distance(vWorld,uCamera));
  col=mix(col,vec3(.045,.092,.145),fog*.58);gl_FragColor=vec4(col,1.0);}`;
  function binaryFromBase64(b64){const bin=atob(b64),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);return u8;}
  function parseGlb(input){
    const data=input instanceof Uint8Array?input:new Uint8Array(input);
    const dv=new DataView(data.buffer,data.byteOffset,data.byteLength);
    must(dv.getUint32(0,true)===0x46546c67,'Không phải GLB hợp lệ');
    must(dv.getUint32(4,true)===2,'Chỉ hỗ trợ GLB 2.0');
    const length=dv.getUint32(8,true);must(length<=data.byteLength,'GLB bị cắt');
    let offset=12,meta=null,binOffset=-1;
    while(offset+8<=length){const count=dv.getUint32(offset,true),tag=dv.getUint32(offset+4,true);offset+=8;
      must(offset+count<=length,'GLB chunk bị hỏng');
      if(tag===0x4e4f534a)meta=JSON.parse(new TextDecoder().decode(data.subarray(offset,offset+count)));
      if(tag===0x004e4942)binOffset=offset;
      offset+=count;
    }
    must(meta&&binOffset>=0,'Thiếu JSON hoặc BIN trong GLB');
    must(meta.meshes?.length===1&&meta.meshes[0].primitives.length===1,'GLB có cấu trúc khác bộ Kenney được hỗ trợ');
    const prim=meta.meshes[0].primitives[0];
    for(const attr of ['POSITION','NORMAL','TEXCOORD_0'])must(prim.attributes[attr]!==undefined,'Thiếu '+attr);
    must(prim.indices!==undefined,'Model thiếu chỉ mục tam giác');
    const attrs={};
    for(const [key,ix] of [['position',prim.attributes.POSITION],['normal',prim.attributes.NORMAL],['uv',prim.attributes.TEXCOORD_0],['index',prim.indices]]){
      const a=meta.accessors[ix],view=meta.bufferViews[a.bufferView];
      must(a.componentType===(key==='index'?5123:5126),'GLB componentType không được hỗ trợ: '+key);
      must(view.buffer===0,'Chỉ hỗ trợ một GLB BIN buffer');
      const bytes=new Uint8Array(data.buffer,data.byteOffset+binOffset+(view.byteOffset||0),view.byteLength);
      attrs[key]={bytes,offset:a.byteOffset||0,stride:view.byteStride||0,count:a.count};
    }
    return attrs;
  }
  function modelMatrix(x,y,z,sx,sy,sz,rotation=0){const c=Math.cos(rotation),s=Math.sin(rotation);
    return new Float32Array([c*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,c*sz,0,x,y,z,1]);
  }
  class KenneySpaceKit{
    constructor(gl){this.gl=gl;this.ready=false;this.palette='violet';this.models=new Map();this.textures=new Map();
      this.program=makeProgram(gl,vertex,fragment);const p=this.program;
      this.loc={position:gl.getAttribLocation(p,'aPosition'),normal:gl.getAttribLocation(p,'aNormal'),uv:gl.getAttribLocation(p,'aUV'),vp:gl.getUniformLocation(p,'uVP'),model:gl.getUniformLocation(p,'uModel'),atlas:gl.getUniformLocation(p,'uAtlas'),camera:gl.getUniformLocation(p,'uCamera')};
    }
    async load(){must(base?.models&&base?.textures,'Không tìm thấy gói assets/kenney/packed.js');
      const gl=this.gl;
      for(const [name,encoded] of Object.entries(base.models)){
        const geometry=parseGlb(binaryFromBase64(encoded));
        const gpu={};
        for(const key of ['position','normal','uv','index']){
          const a=geometry[key],buffer=gl.createBuffer();const target=key==='index'?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER;
          gl.bindBuffer(target,buffer);gl.bufferData(target,a.bytes,gl.STATIC_DRAW);
          gpu[key]={buffer,offset:a.offset,stride:a.stride};
        }
        gpu.count=geometry.index.count;this.models.set(name,gpu);
      }
      await Promise.all(Object.entries(base.textures).map(([name,uri])=>new Promise((resolve,reject)=>{
        const image=new Image();image.onload=()=>{
          try{const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);this.textures.set(name,texture);resolve();
          }catch(e){reject(e);}
        };image.onerror=()=>reject(Error('Không nạp được texture: '+name));image.src=uri;
      })));
      this.ready=true;return true;
    }
    setPalette(palette){if(this.textures.has(palette))this.palette=palette;}
    render(vp,eye,rooms){if(!this.ready)return;const gl=this.gl,l=this.loc;
      gl.useProgram(this.program);gl.uniformMatrix4fv(l.vp,false,vp);gl.uniform3fv(l.camera,eye);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.textures.get(this.palette));gl.uniform1i(l.atlas,0);
      gl.disable(gl.CULL_FACE); // Kenney materials have doubleSided=true.
      const draw=(name,x,y,z,sx,sy,sz,rot=0)=>{
        const geo=this.models.get(name);if(!geo)return;
        for(const [a,key,size] of [[l.position,'position',3],[l.normal,'normal',3],[l.uv,'uv',2]]){
          const g=geo[key];gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);gl.vertexAttribPointer(a,size,gl.FLOAT,false,g.stride,g.offset);gl.enableVertexAttribArray(a);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,geo.index.buffer);
        gl.uniformMatrix4fv(l.model,false,modelMatrix(x,y,z,sx,sy,sz,rot));
        gl.drawElements(gl.TRIANGLES,geo.count,gl.UNSIGNED_SHORT,geo.index.offset);
      };
      // Floor layer spans the central shared corridor; only a tiny vertical offset.
      for(const x of [-12,0,12])draw('template-floor-layer',x,-.03,0,2.82,.23,.53);
      // Room model floors/walls align to existing V0.5 department dimensions;
      // keep the original A* door locations and agents intact.
      rooms.forEach((d,i)=>draw(i%2?'room-wide-variation':'room-wide',d.x,-.018,d.z,d.w/20,.47,d.h/12));
      // Large entrance frame at the near edge of the building.
      draw('gate',0,-.02,11.72,.88,.55,1);
      gl.enable(gl.CULL_FACE);
    }
  }
  KenneySpaceKit.parseGlb=parseGlb;
  root.KenneySpaceKit=KenneySpaceKit;
})(typeof globalThis!=='undefined'?globalThis:window);
