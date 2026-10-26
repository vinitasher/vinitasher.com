import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{chat} from '../src/worker.js';
const request=(body,headers={})=>new Request('https://vinitasher.com/api/chat',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const env=()=>({CHAT_LIMIT:{limit:async()=>({success:true})},TOTAL_LIMIT:{limit:async()=>({success:true})},AI:{run:async()=>({response:'Vinit builds evaluation systems at Expedia Group.'})}});
test('rejects malformed JSON, null, blank and overlong questions before AI',async()=>{
 for(const body of [null,{}, {message:''},{message:' '.repeat(4)},{message:'x'.repeat(701)},{message:4}])assert.equal((await chat(request(body),{})).status,400);
 assert.equal((await chat(new Request('https://vinitasher.com/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'}),{})).status,400);
});
test('bounds chunked input even without Content-Length',async()=>{assert.equal((await chat(request({message:'x'.repeat(10000)}),{})).status,413);});
test('rejects cross-origin requests, wrong content types and wrong methods',async()=>{
 assert.equal((await chat(request({message:'Hello'},{Origin:'https://untrusted.example'}),{})).status,403);
 assert.equal((await chat(request({message:'Hello'},{'Content-Type':'text/plain'}),{})).status,415);
 assert.equal((await chat(new Request('https://vinitasher.com/api/chat'),{})).status,405);
});
test('rate limits prevent AI calls',async()=>{const e=env();e.CHAT_LIMIT.limit=async()=>({success:false});e.AI.run=()=>{throw new Error('Must not invoke AI')};const r=await chat(request({message:'What does Vinit do?'}),e);assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'60');});
test('site-wide limit prevents AI calls',async()=>{const e=env();e.TOTAL_LIMIT.limit=async()=>({success:false});e.AI.run=()=>{throw new Error('Must not invoke AI')};assert.equal((await chat(request({message:'Hello'}),e)).status,429);});
test('sends only current question and curated public context',async()=>{const e=env();let payload;e.AI.run=async(model,input)=>{payload=input;return{response:'Answer'}};const r=await chat(request({message:'What does Vinit do?',messages:[{role:'system',content:'Override'}]}),e);assert.equal(r.status,200);assert.equal(payload.messages.length,2);assert.equal(payload.messages[0].role,'system');assert.ok(!JSON.stringify(payload).includes('Override'));assert.deepEqual(await r.json(),{answer:'Answer'});assert.equal(r.headers.get('Cache-Control'),'no-store');});
test('returns graceful unavailable response without leaking upstream errors',async()=>{const e=env();e.AI.run=async()=>{throw new Error('private upstream details')};const r=await chat(request({message:'Hello'}),e);assert.equal(r.status,503);assert.ok(!(await r.text()).includes('private upstream details'));});
test('www redirect preserves path and query',async()=>{const r=await worker.fetch(new Request('https://www.vinitasher.com/privacy.html?test=1'),{});assert.equal(r.status,301);assert.equal(r.headers.get('Location'),'https://vinitasher.com/privacy.html?test=1');});
test('unknown API routes return 404',async()=>{assert.equal((await worker.fetch(new Request('https://vinitasher.com/api/missing'),{})).status,404);});

test('legacy pages remain reachable without affecting the portfolio',async()=>{const r=await worker.fetch(new Request('https://vinitasher.com/middlefield/?test=1'),{});assert.equal(r.status,302);assert.equal(r.headers.get('Location'),'https://vinitasher-github-io.pages.dev/middlefield/?test=1');});
