import test from "node:test";
import assert from "node:assert/strict";
import {phrases,lookup,conversations,normalize} from "../site/phrases.mjs";
test("every phrase resolves from all three languages",()=>{
 for (const p of phrases)for(const lang of ["bzj","en","es"]){
  const result=lookup(p[lang],lang)[0];
  assert.equal(result.phrase.id,p.id);
  assert.equal(result.exact,true);
 }
});
test("handles accent, punctuation and common intent aliases",()=>{
 assert.equal(normalize("¿CUÁNTO cuesta esto?"),"cuanto cuesta esto");
 assert.equal(lookup("how are you doing today","en")[0].phrase.id,"how");
 assert.equal(lookup("Muchas gracias","es")[0].phrase.id,"thanks");
});
test("typo retrieval is approximate and unrelated input can abstain",()=>{
 const r=lookup("tenk yuu","bzj")[0];assert.equal(r.phrase.id,"thanks");assert.equal(r.exact,false);
 assert.deepEqual(lookup("quantum entanglement experiments","en"),[]);
});
test("every scene uses known phrases",()=>{
 for(const scene of conversations)for(const [,id] of scene.steps)assert.ok(phrases.some(p=>p.id===id));
});

test("sourced phrase lookup handles the published multilingual checks", async () => {
 const {evaluate} = await import("../site/lookup-cases.mjs");
 const {matches,matchTotal,abstentions,abstentionTotal} = evaluate(lookup);
 assert.equal(matches,matchTotal);
 assert.equal(abstentions,abstentionTotal);
});
