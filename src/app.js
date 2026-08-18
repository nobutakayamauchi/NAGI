import { addThing, checkpointCurrent, completeCurrent, createInitialState, getPlan, resumeFromCheckpoint, setIntent, setThingState, startThing, staleWaitingItems } from './core/engine.js';
import { STATES } from './core/model.js';
import { exportState, loadState, saveState } from './core/store.js';
import { advise } from './adapters/local-advisor.js';

let state = loadState();
const $ = id => document.getElementById(id);
const els = {
  advisor:$('advisor'), candidates:$('candidateList'), thingList:$('thingList'), checkpointList:$('checkpointList'),
  currentActions:$('currentActions'), stateBadge:$('stateBadge'), watchWarning:$('watchWarning'), checkpointCount:$('checkpointCount'),
  interruptStack:$('interruptStack'), interruptBtn:$('interruptBtn')
};
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const STATE_LABELS = Object.freeze({
  [STATES.READY]:'今できる',
  [STATES.RUNNING]:'いまやってる',
  [STATES.WAITING]:'待ち',
  [STATES.BLOCKED]:'止まってる',
  [STATES.DONE]:'完了',
  [STATES.CANCELLED]:'取り消し',
  [STATES.UNKNOWN]:'確認が必要'
});
const stateLabel = value => STATE_LABELS[value] || '確認が必要';
const INTENT_LABELS = Object.freeze({ work:'仕事・用事', rest:'休む', play:'遊ぶ', social:'人と過ごす' });
const intentLabel = value => INTENT_LABELS[value] || '目的未設定';
const checkpointMemory = cp => {
  const parts = [];
  if (cp.progress) parts.push(`最後に覚えた：${cp.progress}`);
  if (cp.nextAction) parts.push(`次にやる予定だった：${cp.nextAction}`);
  return parts.join(' / ');
};
function persist(){ saveState(state); render(); }

function currentThing(){ return state.things.find(t=>t.id===state.currentId) || null; }
function returnStackThings(){
  return [...(state.returnStack || [])].reverse().map(entry=>state.things.find(t=>t.id===entry.thingId)).filter(Boolean);
}
function showPlan({materialTrigger=false, message=null}={}){
  const available = Number($('availableInput').value || 60);
  const plan = getPlan(state,{availableMinutes:available,materialTrigger});
  const advice = advise(plan);
  els.advisor.textContent = message || advice.message;
  els.candidates.innerHTML = '';
  for (const c of plan.candidates){
    const div=document.createElement('div'); div.className='candidate';
    div.innerHTML=`<div><h3>${esc(c.thing.title)}</h3><p>${esc(c.reasons.join('・'))}</p></div><button data-start="${esc(c.thing.id)}">これやる</button>`;
    els.candidates.appendChild(div);
  }
  if(plan.candidates.length){
    const no=document.createElement('div'); no.className='candidate';
    no.innerHTML=`<div><h3>${esc(plan.noActionOption.title)}</h3><p>${esc(plan.noActionOption.reason)}</p></div><button data-noaction="1">選ぶ</button>`;
    els.candidates.appendChild(no);
  }
}

function showResumeCandidate(entry){
  const thing=state.things.find(t=>t.id===entry?.thingId);
  if(!thing)return;
  const cp=entry.checkpointId?state.checkpoints.find(c=>c.id===entry.checkpointId):null;
  const memory=cp?checkpointMemory(cp):'';
  const div=document.createElement('div'); div.className='candidate resume-candidate';
  const action=cp?`data-resume="${esc(cp.id)}"`:`data-start="${esc(thing.id)}"`;
  div.innerHTML=`<div><h3>中断前に戻る：${esc(thing.title)}</h3><p>${esc(memory || '割り込み前にやっていた作業')}</p></div><button ${action}>戻る</button>`;
  els.candidates.innerHTML='';
  els.candidates.appendChild(div);
}

function addFromForm({interrupt=false}={}){
  const form=$('thingForm');
  if(!form.reportValidity())return null;
  const prior=currentThing();
  state=addThing(state,{title:$('titleInput').value,durationMinutes:Number($('durationInput').value),intent:$('thingIntent').value});
  const added=state.things.at(-1);
  $('titleInput').value='';
  if(interrupt && added){
    state=startThing(state,added.id,new Date(),'urgent interrupt');
    persist();
    els.advisor.textContent=prior
      ? `「${added.title}」を緊急で割り込ませた。中断前の「${prior.title}」は戻る順に積んである。`
      : `「${added.title}」を始めた。`;
  } else {
    persist();
    showPlan();
  }
  return added;
}

function urgentFromQuick(){
  const raw=prompt('急ぎは何？','');
  const title=String(raw ?? '').trim();
  if(!title)return null;
  const prior=currentThing();
  state=addThing(state,{title,durationMinutes:25,intent:'work'});
  const added=state.things.at(-1);
  state=startThing(state,added.id,new Date(),'urgent quick interrupt');
  persist();
  els.advisor.textContent=prior
    ? `「${added.title}」を今すぐ始めた。中断前の「${prior.title}」は戻る順に積んである。`
    : `「${added.title}」を今すぐ始めた。`;
  return added;
}

function render(){
  $('intentSelect').value=state.intent || 'work';
  const cur=currentThing();
  els.stateBadge.textContent=cur?stateLabel(cur.state):'今は作業なし';
  els.currentActions.classList.toggle('hidden',!cur);
  els.interruptBtn.classList.toggle('hidden',!cur);
  if(cur) els.advisor.textContent=`いま「${cur.title}」をやってる。途中で飛んでも、戻る場所は残せるよ。`;

  const stacked=returnStackThings();
  els.interruptStack.classList.toggle('hidden',!stacked.length);
  els.interruptStack.textContent=stacked.length?`中断中 ${stacked.length}件 · 戻る順：${stacked.map(t=>t.title).join(' → ')}`:'';

  els.thingList.innerHTML='';
  for(const t of [...state.things].reverse()){
    const row=document.createElement('div'); row.className='thing';
    row.innerHTML=`<div class="thing-main"><div class="thing-title">${esc(t.title)}</div><div class="meta">${esc(t.durationMinutes)}分 · ${esc(intentLabel(t.intent))}</div></div><span class="thing-state">${esc(stateLabel(t.state))}</span>${t.state===STATES.READY?`<button data-start="${esc(t.id)}">開始</button>`:''}${[STATES.WAITING,STATES.BLOCKED].includes(t.state)?`<button data-ready="${esc(t.id)}">戻す</button>`:''}`;
    els.thingList.appendChild(row);
  }

  els.checkpointList.innerHTML='';
  const cps=[...state.checkpoints].reverse().slice(0,5); els.checkpointCount.textContent=`${state.checkpoints.length}件`;
  for(const cp of cps){
    const row=document.createElement('div'); row.className='checkpoint';
    const memory=checkpointMemory(cp);
    row.innerHTML=`<div class="thing-main"><div class="thing-title">${esc(cp.title)}</div><div class="meta">最後に覚えた場所 · ${new Date(cp.createdAt).toLocaleString('ja-JP')}${memory?`<br>${esc(memory)}`:''}</div></div><button data-resume="${esc(cp.id)}">戻る</button>`;
    els.checkpointList.appendChild(row);
  }

  const stale=staleWaitingItems(state);
  els.watchWarning.classList.toggle('hidden',!stale.length);
  els.watchWarning.textContent=stale.length?`待ち状態のうち ${stale.length}件は監視の鮮度を確認できない。NAGIは「忘れて大丈夫」とは扱わない。`:'';
}

$('thingForm').addEventListener('submit',e=>{e.preventDefault();addFromForm();});
els.interruptBtn.addEventListener('click',()=>addFromForm({interrupt:true}));
$('intentSelect').addEventListener('change',e=>{state=setIntent(state,e.target.value);persist();showPlan({materialTrigger:true});});
$('quickGrid').addEventListener('click',e=>{
  const a=e.target.dataset.action;if(!a)return;
  if(a==='urgent'){urgentFromQuick();return;}
  if(a==='next')showPlan();
  if(a==='replan')showPlan({materialTrigger:true,message:'予定が崩れたなら、今の現実から最小限だけ組み直そう。'});
  if(a==='free')showPlan({materialTrigger:true,message:'予定が空いたね。今の目的と空き時間から、無理のない候補だけ出す。'});
  if(a==='resume'){
    const cp=[...state.checkpoints].reverse().find(cp=>{const t=state.things.find(x=>x.id===cp.thingId);return t&&[STATES.READY,STATES.RUNNING].includes(t.state)});
    if(!cp){els.advisor.textContent='戻れる場所がまだない。途中で止める時に「ここまで覚えといて」を使えるよ。';els.candidates.innerHTML='';return;}
    const r=resumeFromCheckpoint(state,cp.id); state=r.state; persist();
    const memory=checkpointMemory(cp);
    els.advisor.textContent=r.status==='RESUMED'
      ? `「${cp.title}」へ戻した。${memory?`${memory}。`:''}これは最後に覚えた内容なので、今の状態も確認しながら再開しよう。`
      : `「${cp.title}」は最後に覚えた場所はあるけど、今も実行可能とは確認できない。`;
  }
});

document.addEventListener('click',e=>{
  const start=e.target.dataset.start;if(start){const prior=currentThing();state=startThing(state,start);persist();const now=currentThing();if(prior&&now&&prior.id!==now.id)els.advisor.textContent=`「${now.title}」へ切り替えた。中断前の「${prior.title}」は戻る順に積んである。`;return;}
  const ready=e.target.dataset.ready;if(ready){state=setThingState(state,ready,STATES.READY);persist();showPlan({materialTrigger:true});return;}
  const resume=e.target.dataset.resume;if(resume){const cp=state.checkpoints.find(c=>c.id===resume);const r=resumeFromCheckpoint(state,resume);state=r.state;persist();const memory=cp?checkpointMemory(cp):'';els.advisor.textContent=r.status==='RESUMED'?`最後に覚えた場所から再開した。${memory?`${memory}。`:''}今の状態も確認しながら進めよう。`:'この「戻れる場所」は最後の記憶として残ってるけど、今はそのまま再開できない。';return;}
  if(e.target.dataset.noaction){els.advisor.textContent='今は決めない、でOK。必要になったらまた呼んで。';els.candidates.innerHTML='';}
});

$('checkpointBtn').addEventListener('click',()=>{const next=prompt('次にやることを一言だけ残すなら？','');const progress=prompt('どこまでやった？（空でもOK）','');const out=checkpointCurrent(state,{nextAction:next||'',progress:progress||'',stopReason:'explicit user checkpoint'});state=out.state;persist();els.advisor.textContent='覚えた。忘れても、ここから戻れる。';});
$('waitBtn').addEventListener('click',()=>{if(!state.currentId)return;const id=state.currentId;state=setThingState(state,id,STATES.WAITING);const t=state.things.find(x=>x.id===id);t.watch={leaseUntil:null,source:'manual-unmonitored'};state.currentId=null;persist();showPlan({materialTrigger:true,message:'これは待ちに置いた。ただしv0には外部監視がまだないので「忘れて大丈夫」とは扱わない。'});});
$('doneBtn').addEventListener('click',()=>{const out=completeCurrent(state);state=out.state;persist();if(out.resumeCandidate){const cp=state.checkpoints.find(c=>c.id===out.resumeCandidate.checkpointId);const thing=state.things.find(t=>t.id===out.resumeCandidate.thingId);els.advisor.textContent=thing?`終わった。中断前の「${thing.title}」へ戻れる。`:'終わった。中断前の作業へ戻れる。';showResumeCandidate(out.resumeCandidate);}else showPlan({materialTrigger:true,message:'終わった。次をひとつだけ見よう。'});});
$('exportBtn').addEventListener('click',()=>{const blob=new Blob([exportState(state)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nagi-state.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
