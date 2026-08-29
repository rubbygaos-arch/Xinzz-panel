const KEY='xinzz_panel_api', LOGIN='xinzz_panel_login', TOKEN='xinzz_panel_token';
const $=id=>document.getElementById(id);
let api=(localStorage.getItem(KEY)||'').trim().replace(/\/+$/,'');
let token=localStorage.getItem(TOKEN)||'';
let polling=false;
$('api').value=api; $('token').value=token;

function login(){
  const u=$('user').value.trim(), p=$('pass').value;
  if(u==='admin'&&p==='admin123'){ localStorage.setItem(LOGIN,'1'); showApp(); }
  else $('err').textContent='Username/password salah.';
}
function showApp(){ $('login').classList.add('hidden'); $('app').classList.remove('hidden'); poll(); }
function logout(){ localStorage.removeItem(LOGIN); location.reload(); }

function saveApi(){
  api=$('api').value.trim().replace(/\/+$/,''); token=$('token').value.trim();
  if(!/^https?:\/\//i.test(api)){ $('logs').textContent='API URL harus diawali https://'; return; }
  localStorage.setItem(KEY,api); localStorage.setItem(TOKEN,token);
  $('logs').textContent='Menghubungkan ke backend...'; poll();
}
async function request(path, options={}){
  if(!api) throw new Error('Isi API URL backend terlebih dahulu');
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),30000);
  try{
    const headers={Accept:'application/json',...(options.headers||{})};
    if(token) headers['x-panel-token']=token;
    const r=await fetch(api+path,{...options,headers,signal:controller.signal,cache:'no-store'});
    const text=await r.text(); let data={};
    try{data=text?JSON.parse(text):{}}catch{data={message:text}}
    if(!r.ok) throw new Error(data.message||('HTTP '+r.status));
    return data;
  }catch(e){ if(e.name==='AbortError') throw new Error('Request timeout'); throw e; }
  finally{clearTimeout(timer)}
}
function setMsg(msg){ $('logs').textContent=msg+'\n'+$('logs').textContent; }
async function uploadSC(){
  const file=$('scFile').files[0];
  if(!file){ alert('Pilih ZIP SC terlebih dahulu'); return; }
  try{
    const fd=new FormData(); fd.append('script',file);
    $('logs').textContent='Mengupload '+file.name+' ...';
    const d=await request('/upload',{method:'POST',body:fd});
    setMsg(d.message||'Upload berhasil');
    await poll();
  }catch(e){setMsg('UPLOAD GAGAL: '+e.message)}
}
async function installSC(){
  try{const d=await request('/install',{method:'POST'});setMsg(d.message||'Install dimulai');}
  catch(e){setMsg('INSTALL GAGAL: '+e.message)}
}
async function control(action){
  try{const d=await request('/control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});setMsg(d.message||'OK');setTimeout(poll,700);}
  catch(e){setMsg('CONTROL GAGAL: '+e.message)}
}
async function poll(){
  if(polling||!api) return; polling=true;
  try{
    const d=await request('/status');
    $('status').textContent=d.backend?'BACKEND ONLINE':'BACKEND OFF';
    $('serverStatus').textContent=d.running?'Running':(d.scriptInstalled?'Ready':'Belum siap');
    $('cpu').textContent=d.cpu??'—'; $('ram').textContent=d.ram??'—'; $('uptime').textContent=d.uptime??'—';
    $('scriptName').textContent=d.script?`${d.script.name} v${d.script.version}`:'Belum ada SC yang diupload.';
    if(d.logs) $('logs').textContent=d.logs;
    if(d.qr) $('qr').src=d.qr;
  }catch(e){$('status').textContent='BACKEND OFF';$('serverStatus').textContent='Offline';$('logs').textContent='Tidak dapat terhubung: '+e.message;}
  finally{polling=false}
}
if(localStorage.getItem(LOGIN)==='1') showApp();
setInterval(poll,4000);