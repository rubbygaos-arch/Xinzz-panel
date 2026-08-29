const KEY='xinzz_panel_api', LOGIN='xinzz_panel_login';
const DEFAULT_API='https://glorious-palm-tree-xrvvjqrqqpqrcxr-3000.app.github.dev';
const $=id=>document.getElementById(id);
let api=(localStorage.getItem(KEY)||DEFAULT_API).trim().replace(/\/+$/,'');
let polling=false;

$('api').value=api;

function login(){
  const u=$('user').value.trim(), p=$('pass').value;
  if(u==='admin'&&p==='admin123'){
    localStorage.setItem(LOGIN,'1');
    showApp();
  }else{
    $('err').textContent='Username/password demo salah.';
  }
}

function showApp(){
  $('login').classList.add('hidden');
  $('app').classList.remove('hidden');
  poll();
}

function logout(){
  localStorage.removeItem(LOGIN);
  location.reload();
}

function saveApi(){
  api=$('api').value.trim().replace(/\/+$/,'');
  if(!/^https?:\/\//i.test(api)){
    $('logs').textContent='API URL harus diawali http:// atau https://';
    return;
  }
  localStorage.setItem(KEY,api);
  $('logs').textContent='Menguji koneksi ke '+api+' ...';
  poll();
}

async function request(path,options={}){
  if(!api) throw new Error('API URL belum diisi');

  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10000);

  try{
    const headers={'Accept':'application/json',...(options.headers||{})};
    if(options.body!==undefined) headers['Content-Type']='application/json';

    const r=await fetch(api+path,{
      ...options,
      headers,
      signal:controller.signal,
      cache:'no-store',
      mode:'cors'
    });

    const text=await r.text();
    let data;
    try{ data=text ? JSON.parse(text) : {}; }
    catch{ data={message:text}; }

    if(!r.ok){
      throw new Error('HTTP '+r.status+(data.message?': '+data.message:''));
    }
    return data;
  }catch(e){
    if(e.name==='AbortError') throw new Error('Request timeout (10 detik)');
    if(e instanceof TypeError) {
      throw new Error('Gagal mengakses backend. Cek URL, CORS, dan akses port 3000.');
    }
    throw e;
  }finally{
    clearTimeout(timeout);
  }
}

function setConnected(on){
  $('status').textContent=on?'ONLINE':'BACKEND OFF';
  $('serverStatus').textContent=on?'Online':'Backend offline';
}

async function control(action){
  try{
    const d=await request('/control',{
      method:'POST',
      body:JSON.stringify({action})
    });
    $('logs').textContent=(d.message||'Perintah terkirim')+'\n'+$('logs').textContent;
    setTimeout(poll,500);
  }catch(e){
    $('logs').textContent='Gagal menjalankan '+action+': '+e.message+'\n'+$('logs').textContent;
  }
}

async function poll(){
  if(polling) return;
  if(!api){
    setConnected(false);
    $('logs').textContent='Isi API URL backend untuk mengaktifkan kontrol.';
    return;
  }

  polling=true;
  try{
    const d=await request('/status');
    setConnected(true);

    $('cpu').textContent=d.cpu ?? '—';
    $('ram').textContent=d.ram ?? '—';
    $('uptime').textContent=d.uptime ?? '—';

    if(d.qr) $('qr').src=d.qr;

    if(d.logs) $('logs').textContent=d.logs;
    else $('logs').textContent='Backend terhubung. Menunggu log...';
  }catch(e){
    setConnected(false);
    $('logs').textContent=
      'Tidak dapat terhubung ke backend.\n'+
      'URL: '+api+'\n'+
      'Error: '+e.message+'\n\n'+
      'Pastikan port 3000 Codespaces dapat diakses publik dan backend sedang berjalan.';
  }finally{
    polling=false;
  }
}

if(localStorage.getItem(LOGIN)==='1') showApp();
setInterval(poll,5000);
