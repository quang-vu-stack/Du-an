const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=path.join(__dirname,'..');
const context={window:{},globalThis:null,atob: s=>Buffer.from(s,'base64').toString('binary'),TextDecoder};
context.globalThis=context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(base,'assets/kenney/packed.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(base,'src/kenney-space.js'),'utf8'),context);
const kit=context.window.MEDIA_KENNEY_PACKED,reader=context.window.KenneySpaceKit.parseGlb;
const expected=['room-wide','room-wide-variation','template-floor-layer','gate'];
assert.deepEqual(Object.keys(kit.models).sort(),expected.sort());
for(const [name,b64] of Object.entries(kit.models)){
 const attr=reader(new Uint8Array(Buffer.from(b64,'base64')));
 assert(attr.position.count>100,`${name} insufficient vertices`);
 assert(attr.index.count%3===0,`${name} indices should define triangles`);
 assert.equal(attr.normal.count,attr.position.count);
 assert.equal(attr.uv.count,attr.position.count);
 console.log(`${name}: ${attr.position.count} vertices, ${attr.index.count/3} triangles`);
}
for(const name of ['violet','teal','amber'])assert(kit.textures[name].startsWith('data:image/png;base64,'));
const index=fs.readFileSync(path.join(base,'index.html'),'utf8');
assert(index.includes('media_agent_world_v05_offline'),'V0.5 save key should not change');
assert(index.includes('assets/kenney/packed.js'));
console.log('PASS: 4 Kenney GLB static meshes, 3 palettes, V0.5 save key preserved');
