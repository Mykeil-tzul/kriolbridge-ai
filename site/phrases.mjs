export const languages={bzj:"Belizean Kriol",en:"English",es:"Español"};
export const source="https://www.airuniversity.af.edu/AFCLC/Ready-Airman-Training/Field-Guides/";
export const phrases=[
 ["hello","Greetings","Heloa","Hello","Hola"],
 ["how","Greetings","Da how yu di du?","How are you?","¿Cómo está usted?"],
 ["well","Greetings","Aarait","I am well","Estoy bien"],
 ["morning","Greetings","Gud maanin","Good morning","Buenos días"],
 ["bye","Greetings","Gidbai","Goodbye","Adiós"],
 ["name","Greetings","Weh yuh naym?","What is your name?","¿Cómo se llama?"],
 ["from","Greetings","Wehyu fram?","Where are you from?","¿De dónde es usted?"],
 ["yes","Everyday","Yes","Yes","Sí"],
 ["no","Everyday","No","No","No"],
 ["please","Everyday","Pleez","Please","Por favor"],
 ["thanks","Everyday","Tenk yu","Thank you","Gracias"],
 ["welcome","Everyday","Welkom","You’re welcome","De nada"],
 ["sorry","Everyday","Ahsari","I’m sorry","Lo siento"],
 ["understand","Everyday","Mee noh andastan","I don’t understand","No entiendo"],
 ["know","Everyday","Mee noh know","I don’t know","No sé"],
 ["cost","Market & travel","Humoch dis kaas?","How much does this cost?","¿Cuánto cuesta esto?"],
 ["whereami","Market & travel","Weh I deh?","Where am I?","¿Dónde estoy?"],
 ["time","Market & travel","Weh taim yuh gat?","What time is it?","¿Qué hora es?"],
 ["who","Market & travel","Hoodi?","Who?","¿Quién?"],
 ["where","Market & travel","Weh-paat","Where?","¿Dónde?"],
 ["why","Market & travel","Wai?","Why?","¿Por qué?"]
].map(([id,topic,bzj,en,es])=>({id,topic,bzj,en,es}));
const aliases={
 how:{en:["how are you doing","how are you doing today","how's it going"],es:["cómo estás","qué tal"]},
 thanks:{en:["thanks","thank you very much"],es:["muchas gracias"]},
 cost:{en:["how much is it","how much is this","what does this cost"],es:["cuánto cuesta","cuál es el precio"]},
 hello:{en:["hi","hey"],es:["buenas"]},
 morning:{en:["morning"]},
 name:{es:["cuál es su nombre","cómo te llamas"]},
 from:{es:["de dónde eres"]}, understand:{en:["i do not understand"]},know:{en:["i do not know"]}
};
export const normalize=text=>text.toLowerCase().replace(/[’']/g,"").normalize("NFD").replace(/\p{M}/gu,"").replace(/[^\p{L}\p{N}]+/gu," ").trim();
function grams(s){const padded=" "+s+" ";return Array.from({length:s.length},(_,i)=>padded.slice(i,i+3));}
const vocab={};
for (const lang of Object.keys(languages)){
 const docs=phrases.map(p=>[p[lang],...(aliases[p.id]?.[lang]||[])].map(normalize));
 const df=new Map();
 for(const group of docs)for(const g of new Set(group.flatMap(grams)))df.set(g,(df.get(g)||0)+1);
 vocab[lang]={docs,df};
}
function vector(s,df){
 const v=new Map();
 for(const g of grams(s))v.set(g,(v.get(g)||0)+1);
 for(const [g,n] of v)v.set(g,n*Math.log(1+phrases.length/(1+(df.get(g)||0))));
 return v;
}
function similarity(a,b){
 let dot=0,aa=0,bb=0;
 for(const [g,n] of a){aa+=n*n;dot+=n*(b.get(g)||0);}
 for(const n of b.values())bb+=n*n;
 return aa*bb?dot/Math.sqrt(aa*bb):0;
}
export function lookup(input,lang){
 if(!vocab[lang])return [];
 const query=normalize(input);
 if(!query)return [];
 const {docs,df}=vocab[lang], q=vector(query,df);
 return docs.map((matches,i)=>({phrase:phrases[i],exact:matches.includes(query),
  score:Math.max(...matches.map(s=>similarity(q,vector(s,df))))}))
  .filter(x=>x.exact||x.score>=.43).sort((a,b)=>Number(b.exact)-Number(a.exact)||b.score-a.score).slice(0,3);
}
export const conversations=[
 {name:"Meet someone",steps:[["Start with a greeting","hello"],["Ask how they’re doing","how"],["Say you’re doing well","well"]]},
 {name:"At the market",steps:[["Greet the vendor in the morning","morning"],["Ask what the item costs","cost"],["Thank the vendor","thanks"]]},
 {name:"When you need help",steps:[["Politely get someone’s attention","please"],["Ask where you are","whereami"],["Say you didn’t understand","understand"]]}
];
