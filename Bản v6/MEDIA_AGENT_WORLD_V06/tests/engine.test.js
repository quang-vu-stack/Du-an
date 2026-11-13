const assert = require('node:assert/strict');
const engine=require('../src/agent-engine.js');
const rooms={content:{x:-10.6,z:-5.5},pr:{x:0,z:-5.5},video:{x:10.6,z:-5.5},digital:{x:-7.8,z:5.25},data:{x:7.8,z:5.25}};
const slots=[[-2.85,-1.35],[0,-1.35],[2.85,-1.35],[-1.4,1.78],[1.4,1.78]];
const state={version:2,day:1,minutes:540,cash:1e10,earned:0,spent:0,agents:[],projects:[{id:1,name:'Pilot',client:'Test Client',pay:30e6,progress:0,completed:false}],activities:[],auto:true};
for(const [dept,room] of Object.entries(rooms)) for(let i=0;i<5;i++){
 const n=state.agents.length,[dx,dz]=slots[i];
 state.agents.push({id:n,name:'Agent '+n,dept,role:'Team',energy:85,mood:75,skill:85,completed:0,rest:0,task:{label:'Test',projectId:1,progress:15,duration:20},x:room.x+dx,z:room.z+dz-.58,homeX:room.x+dx,homeZ:room.z+dz-.58,chats:[],memo:[]});
}
engine.upgrade(state);
assert.equal(state.agents.length,25);assert.equal(state.version,3);
assert.ok(state.agents.every(a=>a.ai && a.stress>=0 && a.socialNeed>=0));
const results=[];
for(const a of state.agents){
 const rest=engine.targetFor(a,'rest');const path=engine.findPath(a,rest);
 const meet=engine.findPath(a,{x:-12+a.id,z:Math.abs(-12+a.id)<2.1?-.86:(a.id%2===0?.6:-.7)});
 results.push({id:a.id,room:a.dept,rest:rest,pathLength:path.length,meetingLength:meet.length,goalWalkable:!engine.blocked(rest.x,rest.z)});
}
const noRest=results.filter(r=>!r.pathLength),noMeeting=results.filter(r=>!r.meetingLength);
console.log('NAVIGATION:',JSON.stringify({restPaths:25-noRest.length,meetingPaths:25-noMeeting.length,missingRest:noRest,missingMeeting:noMeeting}));
assert.equal(noMeeting.length,0,'Meeting routes should exist for all 25 agents');
assert.equal(noRest.length,0,'Rest routes should exist for all 25 agents');
let events=[],spoken=[];
const ctx={log:(text,type)=>events.push([text,type]),speak:(a,txt)=>spoken.push([a.id,txt]),newTask:(a)=>({label:'New work',projectId:1,progress:0,duration:25})};
assert.equal(engine.requestMeeting(state,ctx),true);
assert.equal(engine.requestMeeting(state,ctx),false,'Meeting cannot be charged twice');
assert.equal(state.agents.filter(a=>a.ai.mode==='meeting').length,25);
for(let i=0;i<10;i++){state.minutes+=2;engine.tick(state,2,ctx)}
assert.equal(state.meeting,null);assert.equal(state.agents.filter(a=>a.ai.mode==='meeting').length,0);
const a=state.agents[0];for(let i=0;i<150;i++){state.minutes+=.5;engine.tick(state,.5,ctx)}
assert.ok(a.ai.mode,'Agent has active FSM mode');
engine.onTaskCompleted(state,a,a.task);assert.equal(a.history.length,1);assert.ok(a.ai.shortTerm.some(m=>m.text.includes('Hoàn thành:')));
engine.memory(a,'Long-term relationship','long');assert.ok(a.ai.longTerm.some(m=>m.text.includes('Long-term relationship')));
const clone=JSON.parse(JSON.stringify(state));engine.upgrade(clone);
assert.equal(clone.agents[0].history.length,1,'Legacy upgraded state retains history');
assert.ok(clone.agents[0].ai.longTerm.some(m=>m.text.includes('Long-term relationship')),'Legacy upgraded state retains long-term memory');
engine.addLedger(clone,'contract',10e6,'Sample');assert.equal(clone.ledger.at(-1).amount,10e6);
console.log('PASS: migration, FSM, navigation, meeting, memory, relationships, ledger');
