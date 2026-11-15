export const cases = [
  ["en","How are you doing this morning?","how"], ["en","Good morning!","morning"],
  ["en","Many thanks","thanks"], ["en","How much does it cost?","cost"],
  ["en","I dont understand.","understand"], ["en","What time is it now?","time"],
  ["bzj","Da how yu di du","how"], ["bzj","Tenk yu!","thanks"],
  ["bzj","Gud manin","morning"], ["bzj","Humoch dis kaas","cost"],
  ["bzj","Weh-paat?","where"], ["bzj","Mee noh andastan","understand"],
  ["es","Buenos dias","morning"], ["es","Te agradezco, muchas gracias","thanks"],
  ["es","Cuanto cuesta esto","cost"], ["es","Como se llama","name"],
  ["es","No entiendo esto","understand"], ["es","Donde estoy","whereami"],
  ["en","Can I charge my phone here?",null], ["en","My suitcase is missing",null],
  ["en","What time does the bus leave?",null], ["en","How many seats are available?",null],
  ["bzj","blue laptop airport",null], ["bzj","zzqzz",null],
  ["es","Necesito un taxi",null], ["es","Quiero pagar con tarjeta",null],
  ["es","Dónde está el aeropuerto",null], ["es","Qué hora sale el bus",null],
];
export function evaluate(lookup){
  const passes=cases.map(([lang,input,expected])=>({lang,input,expected,actual:lookup(input,lang)[0]?.phrase.id??null}));
  const matching=passes.filter(item=>item.expected!==null);
  const out=passes.filter(item=>item.expected===null);
  return {matches:matching.filter(item=>item.actual===item.expected).length,matchTotal:matching.length,
    abstentions:out.filter(item=>item.actual===null).length,abstentionTotal:out.length,passes};
}
