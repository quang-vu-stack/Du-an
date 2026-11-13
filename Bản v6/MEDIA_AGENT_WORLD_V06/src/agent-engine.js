/* MEDIA AGENT WORLD V0.5 - deterministic-rule agent simulation; no API/LLM requests.
   Deliberately independent of DOM, canvas, storage and external services. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.MediaAgentEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
  const number=(v,d)=>Number.isFinite(v)?v:d;
  const STATUS={working:'Đang làm việc',walking:'Đang di chuyển',resting:'Đang nghỉ',meeting:'Đang họp',collaborating:'Hỗ trợ đồng nghiệp',socializing:'Đang trò chuyện',reporting:'Báo cáo trưởng phòng',idle:'Chờ nhiệm vụ'};
  const MAX_SHORT=10, MAX_LONG=14,MAX_HISTORY=18;
  const ROOMS={
    content:{x:-10.6,z:-5.5,w:10,h:8.1},pr:{x:0,z:-5.5,w:10,h:8.1},video:{x:10.6,z:-5.5,w:10,h:8.1},
    digital:{x:-7.8,z:5.25,w:14.5,h:8.2},data:{x:7.8,z:5.25,w:14.5,h:8.2}
  };
  const DESK_SLOTS=[[-2.85,-1.35],[0,-1.35],[2.85,-1.35],[-1.4,1.78],[1.4,1.78]];
  const grid={step:.6,minX:-16.8,minZ:-11.7,nx:57,nz:40};
  const cell=(x,z)=>({i:clamp(Math.round((x-grid.minX)/grid.step),0,grid.nx-1),j:clamp(Math.round((z-grid.minZ)/grid.step),0,grid.nz-1)});
  const point=(i,j)=>({x:grid.minX+i*grid.step,z:grid.minZ+j*grid.step});
  const walls=[];
  Object.values(ROOMS).forEach(room=>{
    const entryZ=room.z<0?room.z+room.h/2-.35:room.z-room.h/2+.35;
    // Door gap across each room frontage: prevents agents walking through solid wall.
    walls.push({x:room.x,z:entryZ,w:room.w-.5,h:.15,doorX:room.x,doorW:2.25});
    for(const side of [-1,1])walls.push({x:room.x+side*(room.w/2-.26),z:room.z,w:.12,h:room.h-.2});
  });
  function blocked(x,z){
    if(x < -16.6||x>16.6||z < -11.15||z>11.4)return true;
    for(const wall of walls){
      if(Math.abs(z-wall.z)<wall.h/2+.16&&Math.abs(x-wall.x)<wall.w/2+.14){
        if(!('doorX' in wall)||Math.abs(x-wall.doorX)>wall.doorW/2)return true;
      }
    }
    for(const room of Object.values(ROOMS)){
      for(const [dx,dz] of DESK_SLOTS){
        const tx=room.x+dx,tz=room.z+dz;
        if(Math.abs(x-tx)<.83 && Math.abs(z-tz)<.51)return true;
      }
    }
    // Meeting table, couches and reception counter. Positions are matched to renderer.
    if(Math.abs(x)<1.94 && Math.abs(z-.05)<.62)return true;
    if(Math.abs(x+4.4)<.91&&Math.abs(z)<.9)return true;
    if(Math.abs(x-4.4)<.91&&Math.abs(z)<.9)return true;
    if(Math.abs(x+15)<1.15&&Math.abs(z)<.6)return true;
    if(Math.abs(x-15)<.8&&Math.abs(z)<.7)return true;
    return false;
  }
  function findPath(from,to){
    const s=cell(from.x,from.z),e=cell(to.x,to.z);
    // Small-grid A*. Every node represents a safe walkable region of the office.
    const key=(i,j)=>j*grid.nx+i,start=key(s.i,s.j),goal=key(e.i,e.j);
    const open=[start],came=new Map(),g=new Map([[start,0]]),f=new Map([[start,Math.hypot(e.i-s.i,e.j-s.j)]]),seen=new Set();
    let expanded=0,final=null;
    while(open.length&&expanded++<2600){
      let best=0;for(let i=1;i<open.length;i++)if((f.get(open[i])??Infinity)<(f.get(open[best])??Infinity))best=i;
      const cur=open.splice(best,1)[0];if(cur===goal){final=cur;break;}if(seen.has(cur))continue;seen.add(cur);
      const ci=cur%grid.nx,cj=Math.floor(cur/grid.nx);
      for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const i=ci+di,j=cj+dj;if(i<0||j<0||i>=grid.nx||j>=grid.nz)continue;
        const p=point(i,j),k=key(i,j);
        if(k!==goal&&k!==start&&blocked(p.x,p.z))continue;
        if(k===goal&&blocked(p.x,p.z))continue;
        const next=g.get(cur)+1;if(next<(g.get(k)??Infinity)){
          came.set(k,cur);g.set(k,next);f.set(k,next+Math.hypot(e.i-i,e.j-j));
          if(!seen.has(k)&&!open.includes(k))open.push(k);
        }
      }
    }
    if(final===null)return [];
    const rev=[];let cur=final;while(cur!==start&&rev.length<2600){const i=cur%grid.nx,j=Math.floor(cur/grid.nx);rev.push(point(i,j));cur=came.get(cur);if(cur===undefined)return [];}
    rev.reverse();const waypoints=[];
    for(let k=0;k<rev.length;k++){
      const a=rev[k],b=rev[k+1],c=rev[k+2];
      if(b&&c&&(Math.abs(a.x-b.x)<.01&&Math.abs(b.x-c.x)<.01||Math.abs(a.z-b.z)<.01&&Math.abs(b.z-c.z)<.01))continue;
      waypoints.push(a);
    }
    waypoints.push({x:to.x,z:to.z});return waypoints;
  }
  function memory(agent,content,kind='short'){
    if(!agent.ai)return;
    const item={day:agent.ai.day||1,text:String(content).slice(0,160)};
    const list=kind==='long'?agent.ai.longTerm:agent.ai.shortTerm;
    if(list.at(-1)?.text!==item.text)list.push(item);
    while(list.length>(kind==='long'?MAX_LONG:MAX_SHORT))list.shift();
  }
  function behavior(agent,mode,goal=null,minutes=0){
    const ai=agent.ai;
    ai.mode=mode;ai.left=Math.max(0,minutes);ai.goal=goal;
    ai.route=goal?findPath({x:agent.x,z:agent.z},goal):[];
    ai.phase=goal&&ai.route.length?'travel':'active';
    ai.stuck=0;ai.cooldown=0;
    return ai.phase!=='travel' || ai.route.length>0;
  }
  function initAgent(agent,day=1){
    agent.stress=clamp(number(agent.stress,Math.round(12+(100-agent.mood)*.28)),0,100);
    agent.socialNeed=clamp(number(agent.socialNeed,Math.round(32+agent.id%5*8)),0,100);
    agent.history=Array.isArray(agent.history)?agent.history.slice(-MAX_HISTORY):[];
    // Validate user-imported legacy task values; prevent zero-duration/infinite completion loops.
    if(agent.task&&typeof agent.task==='object'){
      agent.task.duration=clamp(number(agent.task.duration,30),8,240);
      agent.task.progress=clamp(number(agent.task.progress,0),0,99.9);
    }else agent.task=null;
    agent.relationships=agent.relationships&&typeof agent.relationships==='object'&&!Array.isArray(agent.relationships)?agent.relationships:{};
    const old=agent.ai&&typeof agent.ai==='object'?agent.ai:{};
    agent.ai={mode:STATUS[old.mode]?old.mode:'working',phase:old.phase==='travel'?'travel':'active',left:Math.max(0,number(old.left,0)),goal:old.goal||null,route:Array.isArray(old.route)?old.route.filter(p=>Number.isFinite(p?.x)&&Number.isFinite(p?.z)).slice(0,200):[],day,
      shortTerm:Array.isArray(old.shortTerm)?old.shortTerm.slice(-MAX_SHORT):[],longTerm:Array.isArray(old.longTerm)?old.longTerm.slice(-MAX_LONG):[],
      cooldown:Math.max(0,number(old.cooldown,agent.id%4)),stuck:0,partner:old.partner,reportedAtCompleted:old.reportedAtCompleted};
    if(agent.ai.phase==='travel'&&!agent.ai.route.length)agent.ai.phase='active';
    agent.isWalking=false;
    return agent;
  }
  function upgrade(state){
    if(!Array.isArray(state.agents)||state.agents.length!==25)throw Error('Phải có đủ 25 nhân viên.');
    for(const a of state.agents)initAgent(a,state.day);
    state.auto=state.auto!==false;
    state.agentEvents=Array.isArray(state.agentEvents)?state.agentEvents.slice(-80):[];
    state.meeting=state.meeting&&typeof state.meeting==='object'&&state.meeting.active?state.meeting:null;
    state.ledger=Array.isArray(state.ledger)?state.ledger.slice(-90):[];
    state.ledgerOpening=number(state.ledgerOpening,state.cash-state.earned+state.spent);
    state.version=3;
    return state;
  }
  function status(agent){return agent.ai?.phase==='travel'?'Đang di chuyển · '+(STATUS[agent.ai.mode]??''):STATUS[agent.ai?.mode]??'Đang làm việc';}
  function targetFor(agent,kind){
    const room=ROOMS[agent.dept];
    if(kind==='desk')return {x:agent.homeX,z:agent.homeZ};
    if(kind==='rest'){
      // Per-room corner clear of desks and wide of walls.
      return {x:room.x+(agent.id%2?-1:1)*(room.w/2-1.35),z:room.z+(room.z<0?1.95:-1.75)};
    }
    if(kind==='lead'){
      const leaderId=Math.floor(agent.id/5)*5;
      const lead=room;
      return {x:lead.x-.05,z:lead.z-.45};
    }
    if(kind==='water')return {x:agent.id%2?7.5:-7.5,z:-.1};
    return {x:agent.homeX,z:agent.homeZ};
  }
  function meetingSlot(agent){
    // Two corridor bands; keep clear of central meeting table and lounge seating.
    const x=-12+agent.id;
    return {x, z: Math.abs(x)<2.1?-.86:(agent.id%2===0?.6:-.7)};
  }
  function sendEvent(state,ctx,text,type='chat'){
    state.agentEvents.push({day:state.day,minute:state.minutes,text,type});state.agentEvents=state.agentEvents.slice(-80);
    ctx.log?.(text,type);
  }
  function relationship(a,b,delta){
    a.relationships[b.id]=clamp(number(a.relationships[b.id],50)+delta,0,100);
    b.relationships[a.id]=clamp(number(b.relationships[a.id],50)+delta,0,100);
  }
  function dialogue(state,ctx,a,b,kind){
    const p=state.projects.find(p=>p.id===a.task?.projectId&&!p.completed);
    const client=p?.client||'studio';
    const templates={
      help:[`Mình đang xử lý ${a.task?.label||'kế hoạch'}. ${b.name}, bạn hỗ trợ ${client} nhé?`,`Mình sẽ đối chiếu dữ liệu ${client} và phản hồi ${a.name}.`],
      social:[`Hôm nay ${b.name} có ổn không? Mình vừa kết thúc một lượt làm việc.`,`Ổn nhé ${a.name}, nghỉ ngắn rồi mình tiếp tục dự án!`],
      report:[`Báo cáo ${b.name}: ${a.task?.label||'đầu việc'} đang ở ${Math.round(a.task?.progress||0)}%.`,`Đã nhận báo cáo ${a.name}. Tiếp tục ưu tiên tiến độ khách hàng ${client}.`],
      meeting:[`Mình đề xuất kiểm tra tiến độ khách hàng ${client} trước.`,`Đồng ý! Mình sẽ ghi lại việc cần xử lý và phân công cho đội.`]
    };
    const [say,reply]=templates[kind]||templates.social;
    if(state.conversationMode!=='off')for(const [speaker,other,msg] of [[a,b,say],[b,a,reply]]){
      speaker.chats.push({from:'agent',text:`[${kind==='social'?'Giờ nghỉ':'Phối hợp'} với ${other.name}] ${msg}`,day:state.day,minute:state.minutes});
      speaker.chats=speaker.chats.slice(-20);memory(speaker,`${kind}: ${other.name} — ${msg}`);
    }
    if(state.conversationMode!=='off'){ctx.speak?.(a,say);ctx.speak?.(b,reply);}
    relationship(a,b,kind==='help'?2:1);
    a.socialNeed=clamp(a.socialNeed-26,0,100);b.socialNeed=clamp(b.socialNeed-16,0,100);
    a.mood=clamp(a.mood+1,0,100);b.mood=clamp(b.mood+.8,0,100);
    if(kind==='help'&&a.task){a.task.progress=Math.min(99,a.task.progress+1.8);b.skill=clamp(b.skill+.03,0,99);}
    sendEvent(state,ctx,`${a.name} ↔ ${b.name}: ${kind==='help'?'hỗ trợ dự án':kind==='report'?'báo cáo tiến độ':kind==='meeting'?'thảo luận cuộc họp':'trò chuyện giờ nghỉ'}.`,'chat');
  }
  function requestMeeting(state,ctx,forced=true){
    if(state.meeting?.active)return false;
    const expires=state.day*1440+state.minutes+16;
    state.meeting={active:true,until:expires,initiator:forced?'CEO':'Agent',topic:'Tiến độ chiến dịch',discussed:false};
    for(const a of state.agents){behavior(a,'meeting',meetingSlot(a),16);a.ai.cooldown=20;}
    sendEvent(state,ctx,`Cuộc họp ${forced?'CEO':'nội bộ'} bắt đầu: 25 Agent di chuyển tới khu vực hội nghị.`,'office');
    memory(state.agents[0],'CEO triệu tập cuộc họp về tiến độ chiến dịch');
    return true;
  }
  function concludeMeeting(state,ctx){
    if(!state.meeting?.active)return;
    state.meeting=null;
    for(const a of state.agents){
      a.mood=clamp(a.mood+2,0,100);a.stress=clamp(a.stress-4,0,100);
      memory(a,'Cuộc họp đã thống nhất ưu tiên tiến độ hợp đồng','long');
      behavior(a,'working',targetFor(a,'desk'),0);a.ai.cooldown=3;
    }
    sendEvent(state,ctx,'Cuộc họp kết thúc: nhân viên trở lại bàn làm việc.','office');
  }
  function choose(state,ctx,a){
    const ai=a.ai;if(state.meeting?.active)return;
    if(a.rest>0 || a.energy<21||a.stress>84){
      a.rest=Math.max(a.rest,16);behavior(a,'resting',targetFor(a,'rest'),Math.max(a.rest,16));
      ctx.speak?.(a,'Mình cần nghỉ để phục hồi năng lượng.');return;
    }
    if(!state.auto){if(ai.mode!=='working')behavior(a,'working',targetFor(a,'desk'));return;}
    const coworker=state.agents.find(b=>b.id!==a.id&&b.dept===a.dept&&b.ai?.mode==='working');
    if(state.conversationMode!=='off'&&a.socialNeed>(state.conversationMode==='frequent'?52:68)&&coworker&&ai.cooldown<=0){
      behavior(a,'socializing',{x:coworker.homeX-.4,z:coworker.homeZ-.65},6);
      ai.partner=coworker.id;ai.cooldown=16;return;
    }
    if(a.task?.progress>45 && a.task?.progress<80 && a.stress>46 && coworker&&ai.cooldown<=0){
      behavior(a,'collaborating',{x:coworker.homeX-.35,z:coworker.homeZ-.7},5);
      ai.partner=coworker.id;ai.cooldown=13;return;
    }
    if(a.completed>0&&a.completed%4===0&&ai.reportedAtCompleted!==a.completed&&a.id%5!==0){
      const leader=state.agents[Math.floor(a.id/5)*5];behavior(a,'reporting',{x:leader.homeX+.3,z:leader.homeZ-.75},4);
      ai.partner=leader.id;ai.reportedAtCompleted=a.completed;return;
    }
    if(!a.task){a.task=ctx.newTask?.(a)||null; if(!a.task){behavior(a,'idle',targetFor(a,'desk'),8);return;}}
    behavior(a,'working',targetFor(a,'desk'));ai.cooldown=6+(a.id%6)*1.3;
  }
  function advanceMovement(a,minutes){
    const ai=a.ai;a.isWalking=false;
    if(ai.phase!=='travel'||!ai.route.length)return;
    let available=Math.max(0,minutes)*1.18;
    while(available>0&&ai.route.length){
      const dest=ai.route[0],dist=Math.hypot(dest.x-a.x,dest.z-a.z);
      if(dist<.035){a.x=dest.x;a.z=dest.z;ai.route.shift();continue;}
      const move=Math.min(dist,available);a.x+=((dest.x-a.x)/dist)*move;a.z+=((dest.z-a.z)/dist)*move;available-=move;a.isWalking=true;
      if(move>=dist-.02)ai.route.shift();
    }
    if(!ai.route.length){ai.phase='active';a.isWalking=false;}
  }
  function tick(state,gameMinutes,ctx={}){
    if(!(gameMinutes>0))return;
    const current=state.day*1440+state.minutes;
    if(state.meeting?.active&&current>=state.meeting.until)concludeMeeting(state,ctx);
    if(state.meeting?.active&&!state.meeting.discussed&&current>=state.meeting.until-11){
      state.meeting.discussed=true;
      dialogue(state,ctx,state.agents[0],state.agents[20],'meeting');
    }
    for(const a of state.agents){
      const ai=a.ai;ai.day=state.day;advanceMovement(a,gameMinutes);
      ai.cooldown=Math.max(0,ai.cooldown-gameMinutes);
      if(state.meeting?.active){a.stress=clamp(a.stress-gameMinutes*.12,0,100);continue;}
      if(a.rest>0){
        a.rest=Math.max(0,a.rest-gameMinutes);
        a.energy=clamp(a.energy+gameMinutes*.94,0,100);
        a.stress=clamp(a.stress-gameMinutes*.7,0,100);
        a.mood=clamp(a.mood+gameMinutes*.08,0,100);
        if(ai.mode!=='resting')behavior(a,'resting',targetFor(a,'rest'),a.rest);
        if(a.rest<=0){a.task=a.task||ctx.newTask?.(a)||null;behavior(a,'working',targetFor(a,'desk'));}
        continue;
      }
      a.socialNeed=clamp(a.socialNeed+gameMinutes*.17,0,100);
      ai.left=Math.max(0,ai.left-gameMinutes);
      if(ai.mode==='working'){
        a.stress=clamp(a.stress+gameMinutes*.028,0,100);
        a.energy=clamp(a.energy-gameMinutes*.023,0,100);
      }
      if(['socializing','collaborating','reporting'].includes(ai.mode)&&ai.left<=0&&ai.phase==='active'){
        const partner=state.agents.find(b=>b.id===ai.partner);
        if(partner)dialogue(state,ctx,a,partner,ai.mode==='socializing'?'social':ai.mode==='collaborating'?'help':'report');
        behavior(a,'working',targetFor(a,'desk'));ai.cooldown=Math.max(ai.cooldown,12);
        continue;
      }
      if(ai.mode==='idle'&&ai.left<=0)choose(state,ctx,a);
      if(ai.mode==='working'&&ai.phase==='active'&&ai.cooldown<=0)choose(state,ctx,a);
      if(ai.mode!=='working'&&ai.mode!=='idle'&&ai.phase==='active'&&ai.left<=0)choose(state,ctx,a);
    }
  }
  function onTaskCompleted(state,agent,task,ctx={}){
    agent.history.push({day:state.day,task:task.label,projectId:task.projectId});agent.history=agent.history.slice(-MAX_HISTORY);
    memory(agent,`Hoàn thành: ${task.label}`);if(agent.completed%5===0)memory(agent,`Đã hoàn thành ${agent.completed} công việc chuyên môn`,'long');
    agent.stress=clamp(agent.stress-1.5,0,100);
    if(agent.ai)agent.ai.cooldown=0;
  }
  function addLedger(state,kind,amount,note){
    state.ledger.push({day:state.day,minute:state.minutes,kind,amount,note});state.ledger=state.ledger.slice(-90);
  }
  return Object.freeze({VERSION:3,STATUS,upgrade,initAgent,status,findPath,blocked,tick,requestMeeting,concludeMeeting,onTaskCompleted,addLedger,memory,targetFor,behavior});
});
