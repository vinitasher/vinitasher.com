const themeButton = document.querySelector('#theme');
let savedTheme;
try { savedTheme = localStorage.getItem('theme'); } catch {}
const systemDark = matchMedia('(prefers-color-scheme: dark)');
function setTheme(theme) {
 document.documentElement.dataset.theme=theme;
 themeButton.setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} mode`);
 document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#11151d':'#f8f9fc';
}
setTheme(savedTheme || (systemDark.matches?'dark':'light'));
systemDark.addEventListener('change',event=>{if(!savedTheme)setTheme(event.matches?'dark':'light');});
themeButton.addEventListener('click',()=>{savedTheme=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(savedTheme);try{localStorage.setItem('theme',savedTheme);}catch{}});
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('#print').addEventListener('click',()=>window.print());
const dialog=document.querySelector('#chat-dialog');
const launch=document.querySelector('#chat-launch');
const input=document.querySelector('#chat-input');
const messages=document.querySelector('#chat-messages');
const form=document.querySelector('#chat-form');
function openChat(){dialog.showModal();launch.setAttribute('aria-expanded','true');input.focus();}
launch.addEventListener('click',openChat);
document.querySelectorAll('[data-chat]').forEach(button=>button.addEventListener('click',openChat));
document.querySelector('#chat-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>launch.setAttribute('aria-expanded','false'));
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function addMessage(text,type){const el=document.createElement('div');el.className=`message ${type}`;el.textContent=text;messages.append(el);messages.scrollTop=messages.scrollHeight;return el;}
let busy=false;
async function ask(question){
 if(busy||!question.trim())return;
 busy=true; input.value='';
 addMessage(question,'user');
 const pending=addMessage('Thinking…','assistant');
 form.querySelector('button').disabled=true;
 document.querySelectorAll('[data-question]').forEach(b=>b.disabled=true);
 try{
  const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question}),signal:AbortSignal.timeout(30000)});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'The guide is unavailable. Please try again.');
  pending.textContent=data.answer;
 }catch(error){pending.textContent=error.name==='TimeoutError'?'The guide is taking longer than expected. Please try again.':error.message;pending.classList.add('error');}
 finally{busy=false;form.querySelector('button').disabled=false;document.querySelectorAll('[data-question]').forEach(b=>b.disabled=false);messages.scrollTop=messages.scrollHeight;if(dialog.open)input.focus();}
}
form.addEventListener('submit',event=>{event.preventDefault();ask(input.value.trim());});
document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.question)));
