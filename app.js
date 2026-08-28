const KEY='xinzz_panel_api', LOGIN='xinzz_panel_login';
const $=id=>document.getElementById(id);
let api=localStorage.getItem(KEY)||'';
$('api').value=api;
function login(){
 const u=$('user').value.trim(), p=$('pass').value;
 if(u==='admin'&&p==='admin123'){localStorage.setItem(LOGIN,'1');showApp()}else $('err').textContent='Username/password demo salah.';
}
function showApp(){$('login').classList.add('hidden');$('app').classList.remove('hidden');poll()}
function logout(){localStorage.removeItem(LOGIN);location.reload()}
function saveApi(){api=$('api').value.trim().replace(/\/$/,'');localStorage.setItem(KEY,api);poll()}
async function request(path,options={}){
 if(!api)return null;
 const r=await fetch(api+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
 if(!r.ok)throw Error('HTTP '+r.status); return r.json();
}
async function control(action){
 try{const d=await request('/control',{method:'POST',body:JSON.stringify({action})}); $('logs').textContent=(d.message||'Perintah terkirim')+'\n'+$('logs').textContent}
 catch(e){$('logs').textContent='Backend belum terhubung: '+e.message+'\n'+$('logs').textContent}
}
async function poll(){
 if(!api){$('logs').textContent='Isi API URL backend VPS untuk mengaktifkan kontrol.';return}
 try{
  const d=await request('/status');
  const on=!!d.online;
  $('status').textContent=on?'ONLINE':'OFFLINE';$('serverStatus').textContent=on?'Online':'Offline';
  $('cpu').textContent=d.cpu??'—';$('ram').textContent=d.ram??'—';$('uptime').textContent=d.uptime??'—';
  if(d.qr)$('qr').src=d.qr;
  if(d.logs)$('logs').textContent=d.logs;
 }catch(e){$('status').textContent='BACKEND OFF';$('serverStatus').textContent='Backend offline'}
}
if(localStorage.getItem(LOGIN)==='1')showApp();
setInterval(poll,5000);