import test from 'node:test';
import assert from 'node:assert/strict';
import { addThing, checkpointCurrent, completeCurrent, createInitialState, getPlan, resumeFromCheckpoint, setThingState, startThing, staleWaitingItems } from '../src/core/engine.js';
import { applyObservation, createThing, ROUTING, STATES } from '../src/core/model.js';
import { confirmLearningCandidate, deleteRule, recordRoutingObservation, routingFor } from '../src/core/learning.js';

const at=s=>new Date(s);

test('SC-01/02 planner returns <=3 actionable candidates and excludes WAITING/BLOCKED',()=>{
  let s=createInitialState();
  for(let i=0;i<6;i++) s=addThing(s,{id:`t${i}`,title:`Task ${i}`,durationMinutes:20,priority:i%4},at('2026-08-18T00:00:00Z'));
  s=setThingState(s,'t1',STATES.WAITING,at('2026-08-18T00:01:00Z'));
  s=setThingState(s,'t2',STATES.BLOCKED,at('2026-08-18T00:01:00Z'));
  const p=getPlan(s,{now:at('2026-08-18T00:02:00Z'),availableMinutes:30});
  assert.ok(p.candidates.length<=3);
  assert.ok(p.candidates.every(c=>![STATES.WAITING,STATES.BLOCKED].includes(c.thing.state)));
});

test('SC-03 checkpoint persists enough last-known context and terminal state blocks resume',()=>{
  let s=createInitialState(); s=addThing(s,{id:'a',title:'Write',nextAction:'section 2'},at('2026-08-18T00:00:00Z')); s=startThing(s,'a',at('2026-08-18T00:01:00Z'));
  const out=checkpointCurrent(s,{progress:'section 1 done',nextAction:'section 2'},at('2026-08-18T00:02:00Z')); s=out.state;
  assert.equal(out.checkpoint.authority,'LAST_KNOWN_MEMORY'); assert.equal(out.checkpoint.nextAction,'section 2');
  s=setThingState(s,'a',STATES.DONE,at('2026-08-18T00:03:00Z'));
  const r=resumeFromCheckpoint(s,out.checkpoint.id,at('2026-08-18T00:04:00Z'));
  assert.equal(r.status,'LAST_KNOWN_NOT_ACTIONABLE');
});

test('SC-04 interrupt creates return checkpoint and completion exposes resume candidate',()=>{
  let s=createInitialState(); s=addThing(s,{id:'a',title:'A'},at('2026-08-18T00:00:00Z')); s=addThing(s,{id:'b',title:'B'},at('2026-08-18T00:00:00Z'));
  s=startThing(s,'a',at('2026-08-18T00:01:00Z')); s=startThing(s,'b',at('2026-08-18T00:02:00Z'),'interrupt');
  assert.equal(s.returnStack.length,1); assert.equal(s.things.find(x=>x.id==='a').state,STATES.READY);
  const done=completeCurrent(s,at('2026-08-18T00:03:00Z')); assert.equal(done.resumeCandidate.thingId,'a');
});

test('SC-05 plan stability keeps current task unless material trigger',()=>{
  let s=createInitialState(); s=addThing(s,{id:'cur',title:'Current',priority:1,durationMinutes:20},at('2026-08-18T00:00:00Z')); s=addThing(s,{id:'other',title:'Other',priority:2,durationMinutes:20},at('2026-08-18T00:00:00Z')); s=startThing(s,'cur',at('2026-08-18T00:01:00Z'));
  const stable=getPlan(s,{now:at('2026-08-18T00:02:00Z'),availableMinutes:30,materialTrigger:false}); assert.equal(stable.candidates[0].thing.id,'cur');
  const triggered=getPlan(s,{now:at('2026-08-18T00:02:00Z'),availableMinutes:30,materialTrigger:true}); assert.equal(triggered.candidates[0].thing.id,'other');
});

test('MUST-13 stale WAITING watch is surfaced instead of silently forgotten',()=>{
  let s=createInitialState(); s=addThing(s,{id:'w',title:'Reply',state:STATES.WAITING,watch:{leaseUntil:'2026-08-18T01:00:00Z'}},at('2026-08-18T00:00:00Z'));
  assert.equal(staleWaitingItems(s,at('2026-08-18T02:00:00Z')).length,1);
});

test('MUST-17 older observation cannot overwrite newer evidence',()=>{
  let t=createThing({id:'x',title:'X',state:STATES.WAITING,latestEvidenceAt:'2026-08-18T02:00:00Z'});
  const r=applyObservation(t,{state:STATES.READY,observedAt:'2026-08-18T01:00:00Z',source:'watch'});
  assert.equal(r.applied,false); assert.equal(r.thing.state,STATES.WAITING);
});

test('SC-07/08 behavior needs confirmation before rule and rule can be deleted',()=>{
  let s=createInitialState();
  for(let i=0;i<3;i++) s=recordRoutingObservation(s,{category:'replan',context:'work',requestedLevel:ROUTING.AUTO});
  assert.equal(s.routingRules.length,0); assert.equal(s.learningCandidates.at(-1).status,'PENDING_CONFIRMATION');
  s=confirmLearningCandidate(s,s.learningCandidates.at(-1).id); assert.equal(s.routingRules.length,1);
  const ruleId=s.routingRules[0].id; s=deleteRule(s,ruleId); assert.equal(s.routingRules.length,0);
});

test('MUST-16 ambiguous context lowers autonomy',()=>{
  let s=createInitialState(); s.routingRules=[{id:'r',category:'priority',context:'default',level:ROUTING.AUTO,enabled:true}];
  assert.equal(routingFor(s,'priority','date').level,ROUTING.SUGGEST);
});

test('SC-11 rest intent can choose rest work rather than productivity by default',()=>{
  let s=createInitialState(); s.intent='rest';
  s=addThing(s,{id:'work',title:'Work',intent:'work',priority:2,durationMinutes:20},at('2026-08-18T00:00:00Z'));
  s=addThing(s,{id:'rest',title:'Sit quietly',intent:'rest',priority:0,durationMinutes:20},at('2026-08-18T00:00:00Z'));
  const p=getPlan(s,{now:at('2026-08-18T00:10:00Z'),availableMinutes:30}); assert.equal(p.candidates[0].thing.id,'rest');
});

test('external observation cannot resurrect terminal DONE state',()=>{
  let t=createThing({id:'z',title:'Z',state:STATES.DONE,latestEvidenceAt:'2026-08-18T01:00:00Z'});
  const r=applyObservation(t,{state:STATES.READY,observedAt:'2026-08-18T02:00:00Z',source:'watch'});
  assert.equal(r.applied,false); assert.equal(r.reason,'TERMINAL_STATE_PROTECTED'); assert.equal(r.thing.state,STATES.DONE);
});

test('RUNNING can only be entered through startThing invariant path',()=>{
  let s=createInitialState(); s=addThing(s,{id:'a',title:'A'});
  assert.throws(()=>setThingState(s,'a',STATES.RUNNING),/Use startThing/);
  s=startThing(s,'a');
  assert.equal(s.currentId,'a'); assert.equal(s.things.filter(t=>t.state===STATES.RUNNING).length,1);
});

test('random switching preserves at most one RUNNING thing and currentId consistency',()=>{
  let s=createInitialState();
  for(let i=0;i<8;i++) s=addThing(s,{id:`r${i}`,title:`R${i}`});
  for(let i=0;i<400;i++){
    const ready=s.things.filter(t=>t.state===STATES.READY);
    if(ready.length && Math.random()<0.65){ s=startThing(s,ready[Math.floor(Math.random()*ready.length)].id); }
    else if(s.currentId && Math.random()<0.5){ const out=completeCurrent(s); s=out.state; }
    const running=s.things.filter(t=>t.state===STATES.RUNNING);
    assert.ok(running.length<=1);
    assert.equal(s.currentId ?? null,running[0]?.id ?? null);
    if(s.things.every(t=>[STATES.DONE,STATES.CANCELLED].includes(t.state))) break;
  }
});
