import {languages,phrases,lookup,conversations,source} from "./phrases.mjs";
const $=id=>document.getElementById(id);
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn)=>{const b=el("button",text);b.type="button";b.onclick=fn;return b;};
const get=id=>phrases.find(p=>p.id===id);
let focus=get("how"),step=0,solved=false,session=null,url=null,requesting=false;
for(const id of ["from","to","practice-language"])$(id).replaceChildren(...Object.entries(languages).map(([k,v])=>new Option(v,k)));
$("from").value="en";$("to").value="bzj";$("practice-language").value="es";
$("scene").replaceChildren(...conversations.map((p,i)=>new Option(p.name,i)));
const topics=[...new Set(phrases.map(p=>p.topic))];
$("topic").replaceChildren(new Option("All topics",""),...topics.map(topic=>new Option(topic)));
function choose(phrase,go=false){
 focus=phrase;
 $("voice-phrase").textContent="Practice phrase · "+phrase.bzj+" / "+phrase.en+" / "+phrase.es;
 if(go)$("voice").scrollIntoView();
}
function sourceLink(){
 const a=el("a","Published phrase source ↗");a.href=source;a.target="_blank";a.rel="noopener noreferrer";return a;
}
function find(){
 const from=$("from").value,to=$("to").value;
 if(from===to){$("results").textContent="Choose a different target language.";return;}
 const matches=lookup($("query").value,from);
 if(!matches.length){$("results").textContent="No reliable phrase match. Browse the phrasebook or try a shorter phrase.";return;}
 const cards=matches.map(({phrase,exact})=>{
  const card=el("article");card.className="result";
  card.append(el("p",exact?"Phrasebook match":"Related phrase · verify the meaning"),el("strong",phrase[to]),el("p",phrase[from]),
   button("Practice this phrase",()=>choose(phrase,true)),document.createTextNode(" "),sourceLink());
  return card;
 });
 $("results").replaceChildren(...cards);
 choose(matches[0].phrase);
}
$("search").onsubmit=e=>{e.preventDefault();find();};
$("swap").onclick=()=>{
 const old=$("from").value;
 $("from").value=$("to").value;$("to").value=old;
 $("query").value=focus[$("from").value];
 find();
};
$("from").onchange=$("to").onchange=()=>{$("results").replaceChildren();};
function library(){
 const topic=$("topic").value;
 $("entries").replaceChildren(...phrases.filter(p=>!topic||p.topic===topic).map(phrase=>{
  const row=el("tr"),action=el("td");
  action.append(button("Practice",()=>choose(phrase,true)));
  row.append(...["bzj","en","es"].map(lang=>el("td",phrase[lang])),action);return row;
 }));
}
$("topic").onchange=library;
function practice(){
 const scene=conversations[Number($("scene").value)],lang=$("practice-language").value;
 const container=$("challenge");
 if(step===scene.steps.length){
  container.replaceChildren(el("strong","Conversation complete!"),el("p","Try again in another language."),button("Start again",reset));
  return;
 }
 const [prompt,id]=scene.steps[step],right=get(id);
 const options=[right,...phrases.filter(p=>p.id!==id&&p.topic===right.topic).slice(0,2)];
 const shift=(step+Number($("scene").value)+1)%options.length;
 const feedback=el("p");feedback.setAttribute("role","status");
 const answers=el("div");answers.className="actions";
 const next=button("Next line",()=>{step++;solved=false;practice();});next.hidden=true;
 for(const p of [...options.slice(shift),...options.slice(0,shift)]){
  const answer=button(p[lang],()=>{
   if(solved)return;
   if(p.id===id){
    solved=true;feedback.textContent="Correct · "+right.bzj+" / "+right.en+" / "+right.es;
    choose(right);next.hidden=false;
   }else{
    feedback.textContent="Try again. Look for the phrase that fits the prompt.";answer.disabled=true;
   }
  });
  answers.append(answer);
 }
 container.replaceChildren(el("p","Line "+(step+1)+" of "+scene.steps.length),el("strong",prompt),answers,feedback,next);
}
function reset(){step=0;solved=false;practice();}
$("scene").onchange=$("practice-language").onchange=reset;
function hear(lang){
 if(!window.speechSynthesis){$("voice-status").textContent="Playback isn’t available in this browser.";return;}
 const voice=speechSynthesis.getVoices().find(v=>v.localService&&v.lang.toLowerCase().startsWith(lang));
 if(!voice){$("voice-status").textContent="No local "+languages[lang]+" voice available.";return;}
 const utterance=new SpeechSynthesisUtterance(focus[lang]);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.85;
 speechSynthesis.cancel();speechSynthesis.speak(utterance);
 $("voice-status").textContent="Playing a local synthetic "+languages[lang]+" voice.";
}
$("hear-en").onclick=()=>hear("en");$("hear-es").onclick=()=>hear("es");
function discard(){
 const audio=$("playback");audio.pause();audio.removeAttribute("src");audio.hidden=true;
 if(url)URL.revokeObjectURL(url);url=null;$("discard").disabled=true;
}
$("discard").onclick=()=>{discard();$("voice-status").textContent="Recording discarded.";};
$("record").onclick=async()=>{
 if(requesting||session)return;
 requesting=true;$("record").disabled=true;
 let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const recorder=new MediaRecorder(stream),chunks=[];
  session={recorder,stream};
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onstop=()=>{
   clearTimeout(session?.timer);stream.getTracks().forEach(t=>t.stop());session=null;
   $("record").disabled=false;$("stop").disabled=true;
   if(!chunks.length){$("voice-status").textContent="No audio was recorded.";return;}
   discard();url=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));
   $("playback").src=url;$("playback").hidden=false;$("discard").disabled=false;
   $("voice-status").textContent="Recording ready. It stays in this tab.";
  };
  recorder.start();session.timer=setTimeout(()=>$("stop").click(),20000);
  $("stop").disabled=false;$("voice-status").textContent="Recording locally · up to 20 seconds.";
 }catch{
  stream?.getTracks().forEach(t=>t.stop());session=null;$("record").disabled=false;
  $("voice-status").textContent="Recording unavailable. Check browser support and microphone permission.";
 }finally{requesting=false;}
};
$("stop").onclick=()=>{
 if(session?.recorder.state==="recording"){session.recorder.stop();$("stop").disabled=true;}
};
window.addEventListener("pagehide",()=>session?.stream.getTracks().forEach(track=>track.stop()));
$("draft").onclick=()=>{
 const note=$("note").value.trim();if(!note)return;
 const data={phrase:focus.id,suggestion:note,status:"unreviewed private draft"};
 const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
 const link=el("a");link.href=u;link.download="kriolbridge-review-draft.json";link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
};
$("query").value="How are you doing today?";
library();practice();find();
