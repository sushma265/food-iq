/* ══════════════════════════════════════════════════════
   FoodIQ  —  Auth + BMI + Food Log + Stats  (frontend)
   ══════════════════════════════════════════════════════ */
const API = 'http://localhost:3000/api';

/* ── Token / user helpers ── */
const getToken  = ()    => localStorage.getItem('fiq_token');
const setToken  = t     => localStorage.setItem('fiq_token', t);
const clearToken= ()    => localStorage.removeItem('fiq_token');
const getUser   = ()    => { try { return JSON.parse(localStorage.getItem('fiq_user')); } catch { return null; } };
const setUser   = u     => localStorage.setItem('fiq_user', JSON.stringify(u));
const clearUser = ()    => localStorage.removeItem('fiq_user');

/* ── Auth header ── */
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

/* ════════════════════════════════════════════
   NAVBAR STATE
   ════════════════════════════════════════════ */
function refreshNav() {
  const user     = getUser();
  const authBtns = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  const greeting = document.getElementById('userGreeting');
  if (user) {
    authBtns.style.display = 'none';
    userMenu.style.display = 'flex';
    greeting.textContent   = `Hi, ${user.name.split(' ')[0]} 👋`;
  } else {
    authBtns.style.display = 'flex';
    userMenu.style.display = 'none';
    document.getElementById('tdeeBanner').style.display = 'none';
    document.getElementById('logPanel').style.display   = 'none';
  }
  // Show/hide log section in modal based on login state
  const logSec = document.getElementById('modalLogSection');
  if (logSec) logSec.style.display = user ? '' : 'none';
}

/* ════════════════════════════════════════════
   AUTH MODAL
   ════════════════════════════════════════════ */
function openAuth(tab = 'login') {
  document.getElementById('authModal').classList.add('active');
  switchTab(tab);
  // clear errors
  ['loginError','regError'].forEach(id => document.getElementById(id).textContent = '');
}
function closeAuth() { document.getElementById('authModal').classList.remove('active'); }
function closeAuthIfOverlay(e) { if (e.target.id === 'authModal') closeAuth(); }
function switchTab(tab) {
  document.getElementById('formLogin').style.display = tab === 'login'    ? '' : 'none';
  document.getElementById('formReg').style.display   = tab === 'register' ? '' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabReg').classList.toggle('active',   tab === 'register');
}

/* ── Login ── */
async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl    = document.getElementById('loginError');
  errEl.textContent = '';
  try {
    const res  = await fetch(`${API}/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; return; }
    setToken(data.token); setUser(data.user);
    closeAuth(); refreshNav(); initUserData();
  } catch { errEl.textContent = 'Cannot connect to server. Is it running?'; }
}

/* ── Register ── */
async function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  const errEl    = document.getElementById('regError');
  errEl.textContent = '';
  try {
    const res  = await fetch(`${API}/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password }) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; return; }
    setToken(data.token); setUser(data.user);
    closeAuth(); refreshNav();
    setTimeout(() => openBMI(), 400);
  } catch { errEl.textContent = 'Cannot connect to server. Is it running?'; }
}

/* ── Logout ── */
function logout() {
  clearToken(); clearUser();
  _tdee = 0;
  refreshNav();
  document.getElementById('tdeeBanner').style.display = 'none';
  document.getElementById('logPanel').style.display   = 'none';
  document.getElementById('statsPanel').style.display = 'none';
}

/* ════════════════════════════════════════════
   BMI MODAL
   ════════════════════════════════════════════ */
function openBMI() {
  if (!getToken()) { openAuth('login'); return; }
  document.getElementById('bmiModal').classList.add('active');
}
function closeBMI()             { document.getElementById('bmiModal').classList.remove('active'); }
function closeBMIIfOverlay(e)   { if (e.target.id === 'bmiModal') closeBMI(); }

async function saveBMI() {
  const errEl = document.getElementById('bmiError');
  errEl.textContent = '';
  const payload = {
    heightCm:      document.getElementById('bmiHeight').value,
    weightKg:      document.getElementById('bmiWeight').value,
    age:           document.getElementById('bmiAge').value,
    gender:        document.getElementById('bmiGender').value,
    activityLevel: document.getElementById('bmiActivity').value,
  };
  try {
    const res  = await fetch(`${API}/bmi`, { method:'POST', headers: authH(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; return; }
    _tdee = data.bmiDetails.tdee;
    _macroTargets = data.bmiDetails.targets;
    showBMIResults(data.bmiDetails);
    updateTDEEBanner(0); // reset bar on new save
    initUserData();
  } catch { errEl.textContent = 'Cannot connect to server.'; }
}

function showBMIResults(d) {
  document.getElementById('bmiResults').style.display = '';
  document.getElementById('resBMI').textContent  = d.bmi;
  document.getElementById('resCat').textContent  = d.category;
  document.getElementById('resBMR').textContent  = d.bmr.toLocaleString();
  document.getElementById('resTDEE').textContent = d.tdee.toLocaleString();

  const catEl = document.getElementById('resCat');
  catEl.className = 'bmi-res-category cat-' + d.category.toLowerCase().replace(' ', '-');

  // Macro targets row
  if (d.targets) {
    const row = document.getElementById('bmiTargetRow');
    if (row) {
      document.getElementById('tgtProtein').textContent = d.targets.protein + 'g';
      document.getElementById('tgtCarbs').textContent   = d.targets.carbs   + 'g';
      document.getElementById('tgtFat').textContent     = d.targets.fat     + 'g';
      row.style.display = '';
    }
  }

  // BMI scale marker (scale: 10–40 range)
  const pct = Math.min(100, Math.max(0, ((d.bmi - 10) / 30) * 100));
  document.getElementById('bmiMarker').style.left = `${pct}%`;
}

/* ════════════════════════════════════════════
   PROFILE MODAL
   ════════════════════════════════════════════ */
function openProfile() {
  if (!getToken()) return;
  const user = getUser();
  document.getElementById('profileName').value    = user?.name  || '';
  document.getElementById('profileEmail').value   = user?.email || '';
  document.getElementById('profileCurPass').value = '';
  document.getElementById('profileNewPass').value = '';
  document.getElementById('profileMsg').textContent = '';
  document.getElementById('profileModal').classList.add('active');
}
function closeProfile()           { document.getElementById('profileModal').classList.remove('active'); }
function closeProfileIfOverlay(e) { if (e.target.id === 'profileModal') closeProfile(); }

async function saveProfile() {
  const name        = document.getElementById('profileName').value.trim();
  const curPass     = document.getElementById('profileCurPass').value;
  const newPass     = document.getElementById('profileNewPass').value;
  const msgEl       = document.getElementById('profileMsg');
  msgEl.textContent = '';

  const payload = {};
  if (name) payload.name = name;
  if (newPass) { payload.currentPassword = curPass; payload.newPassword = newPass; }

  try {
    const res  = await fetch(`${API}/me`, { method:'PUT', headers: authH(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { msgEl.style.color = 'var(--danger)'; msgEl.textContent = data.error; return; }
    setToken(data.token); setUser(data.user);
    msgEl.style.color   = 'var(--accent)';
    msgEl.textContent   = '✓ Profile updated!';
    refreshNav();
  } catch { msgEl.style.color = 'var(--danger)'; msgEl.textContent = 'Server error.'; }
}

/* ════════════════════════════════════════════
   TDEE BANNER
   ════════════════════════════════════════════ */
let _tdee = 0;
let _macroTargets = null;

function updateTDEEBanner(consumed) {
  if (!_tdee) return;
  document.getElementById('tdeeBanner').style.display = 'flex';
  document.getElementById('tdeeGoal').textContent = _tdee.toLocaleString();

  const pct = Math.min(100, Math.round((consumed / _tdee) * 100));
  const rem = _tdee - consumed;
  const bar = document.getElementById('tdeeBar');
  bar.style.width      = pct + '%';
  bar.style.background = pct >= 100 ? 'var(--danger)' : pct > 80 ? '#fbbf24' : 'var(--accent)';

  document.getElementById('tdeeConsumed').textContent  = `${consumed.toLocaleString()} eaten`;
  document.getElementById('tdeeRemaining').textContent =
    rem > 0 ? `${rem.toLocaleString()} remaining` : `${Math.abs(rem).toLocaleString()} over goal`;
}

/* ════════════════════════════════════════════
   FOOD LOG PANEL
   ════════════════════════════════════════════ */
let _logVisible = false;

function toggleLog() {
  _logVisible = !_logVisible;
  document.getElementById('logPanel').style.display   = _logVisible ? '' : 'none';
  document.getElementById('statsPanel').style.display = 'none';
  _statsVisible = false;
  if (_logVisible) fetchLog();
}

async function fetchLog() {
  if (!getToken()) return;
  try {
    const res  = await fetch(`${API}/log`, { headers: authH() });
    const data = await res.json();
    renderLog(data.entries, data.totals);
    updateTDEEBanner(data.totals.calories);
  } catch { /* server offline */ }
}

function renderLog(entries, totals) {
  const el = document.getElementById('logEntries');
  el.innerHTML = entries.length === 0
    ? '<p class="log-empty">No foods logged yet. Click a food card and hit + Log this food!</p>'
    : entries.map(e => `
        <div class="log-entry">
          <div class="log-entry-info">
            <span class="log-name">${e.foodName}${e.servings !== 1 ? ` <span class="log-srv">×${e.servings}</span>` : ''}</span>
            <span class="log-meta">${e.protein}g P · ${e.carbs}g C · ${e.fat}g F</span>
          </div>
          <div class="log-entry-right">
            <span class="log-cal">${e.calories} kcal</span>
            <button class="log-del" onclick="deleteLogEntry(${e.id})">✕</button>
          </div>
        </div>`).join('');

  document.getElementById('logTotal').textContent = (totals?.calories || 0).toLocaleString();

  // Macro totals row
  if (totals) {
    document.getElementById('logTotProtein').textContent = totals.protein + 'g P';
    document.getElementById('logTotCarbs').textContent   = totals.carbs   + 'g C';
    document.getElementById('logTotFat').textContent     = totals.fat     + 'g F';
  }

  // vs TDEE label
  const rem = _tdee ? _tdee - (totals?.calories || 0) : null;
  document.getElementById('logVsTdee').textContent = rem != null
    ? (rem >= 0 ? `${rem.toLocaleString()} remaining` : `${Math.abs(rem).toLocaleString()} over goal`)
    : '';
}

async function deleteLogEntry(id) {
  if (!getToken()) return;
  try {
    await fetch(`${API}/log/${id}`, { method:'DELETE', headers: authH() });
    await fetchLog();
  } catch { /* ignore */ }
}

/* ════════════════════════════════════════════
   LOG CURRENT FOOD FROM MODAL
   ════════════════════════════════════════════ */
window._modalFood = null;

async function logCurrentFood() {
  if (!getToken()) { openAuth('login'); return; }
  if (!window._modalFood) return;

  const servings = parseFloat(document.getElementById('modalServings').value) || 1;
  const msg = document.getElementById('modalLogMsg');
  msg.textContent = '';

  try {
    const res  = await fetch(`${API}/log`, {
      method: 'POST', headers: authH(),
      body: JSON.stringify({ ...window._modalFood, foodName: window._modalFood.name, servings })
    });
    const data = await res.json();
    if (!res.ok) { msg.style.color = 'var(--danger)'; msg.textContent = data.error; return; }
    msg.style.color = 'var(--accent)';
    msg.textContent = `✓ Logged! Today: ${data.totals.calories} kcal`;
    updateTDEEBanner(data.totals.calories);
    if (_logVisible) fetchLog();
  } catch { msg.style.color = 'var(--danger)'; msg.textContent = 'Server error.'; }
}

/* ════════════════════════════════════════════
   WEEKLY STATS PANEL
   ════════════════════════════════════════════ */
let _statsVisible = false;

function toggleStats() {
  _statsVisible = !_statsVisible;
  document.getElementById('statsPanel').style.display  = _statsVisible ? '' : 'none';
  document.getElementById('logPanel').style.display    = 'none';
  _logVisible = false;
  if (_statsVisible) fetchStats();
}

async function fetchStats() {
  if (!getToken()) return;
  try {
    const res  = await fetch(`${API}/stats`, { headers: authH() });
    const data = await res.json();
    renderStats(data);
  } catch { /* offline */ }
}

function renderStats({ days, avgPerActiveDay, tdee }) {
  const container = document.getElementById('statsChartBars');
  const maxCal    = Math.max(...days.map(d => d.calories), 1);

  container.innerHTML = days.map(d => {
    const pct    = Math.round((d.calories / maxCal) * 100);
    const over   = tdee && d.calories > tdee;
    const color  = d.calories === 0 ? 'var(--border)'
                 : over             ? 'var(--danger)'
                 : d.calories > (tdee * 0.8) ? '#fbbf24'
                 : 'var(--accent)';
    const isToday = d.date === new Date().toISOString().slice(0, 10);
    return `
      <div class="stats-bar-col ${isToday ? 'today' : ''}">
        <div class="stats-bar-label-top">${d.calories > 0 ? d.calories : ''}</div>
        <div class="stats-bar-wrap">
          ${tdee ? `<div class="stats-tdee-line" style="bottom:${Math.round((tdee/maxCal)*100)}%"></div>` : ''}
          <div class="stats-bar-fill" style="height:${pct}%;background:${color}"></div>
        </div>
        <div class="stats-bar-day">${d.label}${isToday ? '<br/><span class="today-dot">●</span>' : ''}</div>
      </div>`;
  }).join('');

  // Averages
  if (avgPerActiveDay) {
    document.getElementById('statsAvgCal').textContent  = avgPerActiveDay.calories.toLocaleString();
    document.getElementById('statsAvgProt').textContent = avgPerActiveDay.protein + 'g';
    document.getElementById('statsAvgCarb').textContent = avgPerActiveDay.carbs   + 'g';
    document.getElementById('statsAvgFat').textContent  = avgPerActiveDay.fat     + 'g';
    document.getElementById('statsAvgSection').style.display = '';
  } else {
    document.getElementById('statsAvgSection').style.display = 'none';
  }
}

/* ════════════════════════════════════════════
   INIT — load data on page load / login
   ════════════════════════════════════════════ */
async function initUserData() {
  if (!getToken()) return;
  try {
    const [bmiRes, logRes] = await Promise.all([
      fetch(`${API}/bmi`, { headers: authH() }),
      fetch(`${API}/log`, { headers: authH() }),
    ]);
    if (bmiRes.ok) {
      const bmi  = await bmiRes.json();
      _tdee         = bmi.tdee;
      _macroTargets = bmi.targets;
      showBMIResults(bmi);
      // pre-fill BMI form
      document.getElementById('bmiHeight').value   = bmi.heightCm;
      document.getElementById('bmiWeight').value   = bmi.weightKg;
      document.getElementById('bmiAge').value      = bmi.age;
      document.getElementById('bmiGender').value   = bmi.gender;
      document.getElementById('bmiActivity').value = bmi.activityLevel;
    }
    if (logRes.ok) {
      const log = await logRes.json();
      updateTDEEBanner(log.totals.calories);
      if (_logVisible) renderLog(log.entries, log.totals);
    }
  } catch { /* server offline */ }
}

/* ── Bootstrap ── */
refreshNav();
if (getToken()) initUserData();
