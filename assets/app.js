// Simple client-side auth demo + reporting generator.
// Not secure — for demo / Cloudflare Pages static hosting only.

(function(){
  const path = location.pathname.split('/').pop() || 'index.html';

  // Utilities
  function qs(sel, root=document) { return root.querySelector(sel); }
  function qsa(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }
  function saveUsers(users){ localStorage.setItem('Guest_users', JSON.stringify(users)); }
  function loadUsers(){ try{ return JSON.parse(localStorage.getItem('Guest_users')||'{}'); }catch(e){return {};} }
  function setSession(email){ localStorage.setItem('Guest_session', email); }
  function getSession(){ return localStorage.getItem('Guest_session'); }
  function clearSession(){ localStorage.removeItem('Guest_session'); }

  // Demo user helper
  function ensureDemoUser(){
    const users = loadUsers();
    if(!users['demo@Guest.local']){
      users['demo@Guest.local'] = {name:'Guest', pass:'demo123'};
      saveUsers(users);
    }
  }

  // Random generators
  const NAMES = ["Aurelia","Basil","Cedar","Dawn","Eldon","Fern","Galen","Hira","Ivy","Jun","Koa","Lark","Mira","Nico","Orin","Pax","Quinn","Rook","Sage","Tala","Uma","Vera","Wren","Yara","Zion"];
  const CITIES = ["Baguio","Cebu","Davao","Manila","Iloilo","Bacolod","Cavite","Laguna","Zamboanga","Bohol","Palawan","Bataan"];
  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function randName(){ return NAMES[randInt(0,NAMES.length-1)] + ' ' + NAMES[randInt(0,NAMES.length-1)]; }
  function randAmount(){ return (Math.random()*5000 + 100).toFixed(2); }
  function randOrderId(){ return 'ORD-' + Math.random().toString(36).substr(2,8).toUpperCase(); }

  // ROUTES
  if(path === 'index.html' || path === '' || path === 'index'){
    // Login/register page
    ensureDemoUser();
    const tabLogin = qs('#tab-login'), tabReg = qs('#tab-register');
    const loginForm = qs('#login-form'), regForm = qs('#register-form');
    const demoBtn = qs('#demo-btn');

    tabLogin.addEventListener('click', ()=>{ tabLogin.classList.add('active'); tabReg.classList.remove('active'); loginForm.classList.remove('hidden'); regForm.classList.add('hidden');});
    tabReg.addEventListener('click', ()=>{ tabReg.classList.add('active'); tabLogin.classList.remove('active'); regForm.classList.remove('hidden'); loginForm.classList.add('hidden');});

    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = qs('#login-email').value.trim().toLowerCase();
      const pass = qs('#login-pass').value;
      const users = loadUsers();
      if(users[email] && users[email].pass === pass){
        setSession(email);
        location.href = 'dashboard.html';
      }else{
        alert('Invalid credentials. Try demo: Use Demo button or register.');
      }
    });

    demoBtn.addEventListener('click', ()=>{
      ensureDemoUser();
      setSession('demo@Guest.local');
      location.href = 'dashboard.html';
    });

    regForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = qs('#reg-name').value.trim();
      const email = qs('#reg-email').value.trim().toLowerCase();
      const pass = qs('#reg-pass').value;
      if(!name || !email || !pass){ alert('Fill all fields'); return; }
      const users = loadUsers();
      if(users[email]){ alert('User exists, please login.'); return; }
      users[email] = {name, pass};
      saveUsers(users);
      setSession(email);
      location.href = 'dashboard.html';
    });
  }

  if(path === 'dashboard.html'){
    const session = getSession();
    if(!session){ location.href = 'index.html'; return; }
    const users = loadUsers();
    const user = users[session] || {name:session};
    qs('#user-name').textContent = user.name || session;

    // sample counts
    qs('#visits-count').textContent = randInt(50, 500);
    qs('#sales-count').textContent = '₱ ' + (randInt(2000, 200000)/100).toFixed(2);

    qs('#logout').addEventListener('click', ()=>{
      clearSession();
      location.href = 'index.html';
    });
    qs('#to-reporting').addEventListener('click', ()=> location.href = 'reporting.html');
  }

  if(path === 'reporting.html'){
    const session = getSession();
    if(!session){ location.href = 'index.html'; return; }
    const users = loadUsers();
    const user = users[session] || {name:session};
    qs('#logout').addEventListener('click', ()=>{ clearSession(); location.href='index.html'; });
    qs('#to-dashboard').addEventListener('click', ()=> location.href='dashboard.html');

    function generateTables(n){
      const vt = qs('#visitors-table tbody'); vt.innerHTML = '';
      const st = qs('#sales-table tbody'); st.innerHTML = '';
      for(let i=0;i<n;i++){
        const name = randName();
        const city = CITIES[randInt(0,CITIES.length-1)];
        const time = new Date(Date.now() - randInt(0,1000*60*60*24*30)).toLocaleString();
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${name}</td><td>${city}</td><td>${time}</td>`;
        vt.appendChild(tr);

        const order = randOrderId();
        const cust = name.split(' ')[0];
        const amount = randAmount();
        const tr2 = document.createElement('tr');
        tr2.innerHTML = `<td>${i+1}</td><td>${order}</td><td>${cust}</td><td>${amount}</td>`;
        st.appendChild(tr2);
      }
    }

    const rowCount = qs('#row-count');
    const regen = qs('#regen');
    regen.addEventListener('click', ()=> generateTables(Number(rowCount.value || 12)));
    // generate on load
    generateTables(Number(rowCount.value || 12));
  }

})();
