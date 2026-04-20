/* ─── FOOD DATA ─── */
const foods = [
  {name:"Chapati",calories:120,desc:"Whole wheat flatbread",category:"Indian",protein:3,carbs:20,fat:1,details:"Soft flatbread made from whole wheat flour. A staple Indian food rich in complex carbohydrates and fiber."},
  {name:"Paneer Butter Masala",calories:320,desc:"Creamy paneer curry",category:"Indian",protein:12,carbs:10,fat:24,details:"Paneer cubes cooked in rich tomato butter gravy. High in protein and fats."},
  {name:"Rajma",calories:230,desc:"Kidney bean curry",category:"Indian",protein:9,carbs:35,fat:4,details:"North Indian curry made with red kidney beans. Rich in plant protein and fiber."},
  {name:"Dal Tadka",calories:200,desc:"Lentil curry",category:"Indian",protein:10,carbs:28,fat:6,details:"Cooked lentils tempered with spices. Great protein source for vegetarians."},
  {name:"Pani Puri",calories:180,desc:"Crispy street snack",category:"Snack",protein:4,carbs:30,fat:5,details:"Crispy puris filled with spicy water, potatoes, and chutney."},
  {name:"Chole Bhature",calories:420,desc:"Punjabi meal",category:"Indian",protein:12,carbs:50,fat:18,details:"Spicy chickpea curry served with fried bread."},
  {name:"Maggi Noodles",calories:310,desc:"Instant noodles",category:"Snack",protein:7,carbs:40,fat:14,details:"Quick instant noodles loved by students."},
  {name:"Falafel",calories:250,desc:"Chickpea fritters",category:"Healthy",protein:12,carbs:30,fat:10,details:"Deep fried chickpea balls popular in Middle Eastern cuisine."},
  {name:"Tacos",calories:210,desc:"Mexican corn tortillas",category:"Western",protein:10,carbs:25,fat:9,details:"Corn tortillas filled with vegetables, beans, and sauces."},
  {name:"Quesadilla",calories:300,desc:"Cheesy tortilla",category:"Western",protein:13,carbs:28,fat:16,details:"Grilled tortilla stuffed with cheese and fillings."},
  {name:"Mac and Cheese",calories:350,desc:"Creamy pasta",category:"Western",protein:12,carbs:40,fat:18,details:"Pasta cooked in rich cheese sauce."},
  {name:"Garlic Bread",calories:190,desc:"Toasted herb bread",category:"Western",protein:5,carbs:25,fat:8,details:"Bread baked with garlic butter and herbs."},
  {name:"Brown Rice",calories:216,desc:"Whole grain rice",category:"Healthy",protein:5,carbs:45,fat:2,details:"High fiber rice alternative to white rice."},
  {name:"Quinoa Bowl",calories:220,desc:"Protein-rich grain",category:"Healthy",protein:8,carbs:34,fat:4,details:"Ancient grain rich in protein and amino acids."},
  {name:"Avocado Toast",calories:240,desc:"Healthy breakfast",category:"Healthy",protein:6,carbs:28,fat:12,details:"Whole grain toast topped with mashed avocado."},
  {name:"Protein Shake",calories:180,desc:"Post-workout drink",category:"Healthy",protein:25,carbs:10,fat:3,details:"Protein supplement drink used for muscle recovery."},
  {name:"Peanut Butter Sandwich",calories:300,desc:"Energy snack",category:"Snack",protein:12,carbs:32,fat:16,details:"Bread sandwich filled with peanut butter."},
  {name:"Chocolate Cake",calories:380,desc:"Indulgent dessert",category:"Snack",protein:5,carbs:55,fat:18,details:"Sweet baked cake rich in sugar and calories."},
  {name:"Ice Cream",calories:207,desc:"Frozen dessert",category:"Snack",protein:4,carbs:24,fat:11,details:"Sweet frozen dairy dessert."},
  {name:"Milkshake",calories:300,desc:"Blended sweet drink",category:"Snack",protein:8,carbs:45,fat:12,details:"Milk blended with ice cream and flavors."},
  {name:"Dhokla",calories:160,desc:"Steamed Gujarati snack",category:"Indian",protein:6,carbs:25,fat:3,details:"Gujarati steamed snack made from fermented batter."},
  {name:"Kadhi Pakora",calories:260,desc:"Yogurt curry",category:"Indian",protein:8,carbs:18,fat:14,details:"Yogurt-based curry with fried gram flour dumplings."},
  {name:"Momos",calories:230,desc:"Steamed dumplings",category:"Snack",protein:10,carbs:28,fat:8,details:"Dumplings filled with vegetables or meat."},
  {name:"Fried Rice",calories:290,desc:"Asian stir-fried rice",category:"Western",protein:9,carbs:40,fat:10,details:"Rice stir-fried with vegetables and sauces."},
  {name:"Chicken Curry",calories:320,desc:"Spicy protein curry",category:"Indian",protein:26,carbs:8,fat:20,details:"Chicken cooked in spicy curry gravy."},
  {name:"Grilled Chicken",calories:220,desc:"Lean protein",category:"Healthy",protein:30,carbs:0,fat:8,details:"High protein grilled chicken breast."},
  {name:"Egg Omelette",calories:150,desc:"Protein breakfast",category:"Healthy",protein:12,carbs:2,fat:10,details:"Eggs cooked with vegetables and spices."},
  {name:"Boiled Eggs",calories:78,desc:"Simple protein",category:"Healthy",protein:6,carbs:1,fat:5,details:"Hard boiled eggs rich in protein."},
  {name:"Corn Soup",calories:120,desc:"Light vegetable soup",category:"Healthy",protein:4,carbs:20,fat:2,details:"Soup made from sweet corn."},
  {name:"Tomato Soup",calories:90,desc:"Warm tomato soup",category:"Healthy",protein:3,carbs:15,fat:2,details:"Healthy soup made from tomatoes."},
  {name:"Pancakes",calories:230,desc:"Sweet breakfast",category:"Western",protein:6,carbs:35,fat:8,details:"Soft pancakes served with syrup."},
  {name:"Waffles",calories:260,desc:"Crispy breakfast",category:"Western",protein:6,carbs:38,fat:10,details:"Grid-shaped crispy breakfast dish."},
  {name:"Hot Dog",calories:290,desc:"Street sausage roll",category:"Western",protein:11,carbs:30,fat:16,details:"Sausage served in bread bun."},
  {name:"Donut",calories:250,desc:"Glazed sweet ring",category:"Snack",protein:4,carbs:30,fat:12,details:"Deep fried sweet dough ring."},
  {name:"Energy Bar",calories:210,desc:"Workout snack bar",category:"Healthy",protein:10,carbs:25,fat:8,details:"Compact snack with protein and carbs."}
];

let currentSort = 'default';
let chartInstance = null;

/* ─── STATS ─── */
function updateStats(list) {
  if (!list.length) return;
  const avg = Math.round(list.reduce((s, f) => s + f.calories, 0) / list.length);
  const high = list.reduce((a, b) => a.calories > b.calories ? a : b);
  const low  = list.reduce((a, b) => a.calories < b.calories ? a : b);
  const prot = list.reduce((a, b) => a.protein > b.protein ? a : b);

  document.getElementById('avgCal').textContent       = avg;
  document.getElementById('highCal').textContent      = high.calories;
  document.getElementById('highCalName').textContent  = high.name;
  document.getElementById('lowCal').textContent       = low.calories;
  document.getElementById('lowCalName').textContent   = low.name;
  document.getElementById('highProt').textContent     = prot.protein + 'g';
  document.getElementById('highProtName').textContent = prot.name;
  document.getElementById('showingCount').textContent = list.length;
}

/* ─── MACRO BAR HTML ─── */
function macroBar(p, c, f) {
  const total = p + c + f || 1;
  const pw = ((p / total) * 100).toFixed(1);
  const cw = ((c / total) * 100).toFixed(1);
  const fw = ((f / total) * 100).toFixed(1);
  return `
    <span class="bar-p" style="width:${pw}%"></span>
    <span class="bar-c" style="width:${cw}%"></span>
    <span class="bar-f" style="width:${fw}%"></span>
  `;
}

/* ─── DISPLAY FOODS ─── */
function displayFoods(list) {
  const grid = document.getElementById('foodGrid');
  grid.innerHTML = '';
  updateStats(list);
  updateChart(list);

  if (!list.length) {
    grid.innerHTML = '<div class="no-results">No foods found…</div>';
    return;
  }

  list.forEach((food, i) => {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.style.animationDelay = `${i * 0.04}s`;
    card.onclick = () => openModal(food.name);
    card.innerHTML = `
      <div class="card-top">
        <span class="category-badge">${food.category}</span>
        <span class="cal-pill">${food.calories} cal</span>
      </div>
      <h3>${food.name}</h3>
      <p>${food.desc}</p>
      <div class="macro-bar">${macroBar(food.protein, food.carbs, food.fat)}</div>
      <div class="macro-labels">
        <span><span class="dot" style="background:#4ade80"></span>${food.protein}g P</span>
        <span><span class="dot" style="background:#60a5fa"></span>${food.carbs}g C</span>
        <span><span class="dot" style="background:#f472b6"></span>${food.fat}g F</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ─── CHART ─── */
function updateChart(list) {
  const isDark     = document.body.classList.contains('dark');
  const gridColor  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const textColor  = isDark ? '#6b8c72' : '#4a7a52';
  const ctx        = document.getElementById('calorieChart').getContext('2d');

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: list.map(f => f.name),
      datasets: [{
        label: 'Calories',
        data: list.map(f => f.calories),
        backgroundColor: list.map(f => {
          if (f.calories < 150) return 'rgba(74,222,128,0.7)';
          if (f.calories < 250) return 'rgba(251,191,36,0.7)';
          return 'rgba(248,113,113,0.7)';
        }),
        borderRadius: 6,
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0e1512',
          borderColor: '#1e2d23',
          borderWidth: 1,
          titleColor: '#4ade80',
          bodyColor: '#6b8c72',
          callbacks: { label: ctx => `${ctx.parsed.y} calories` }
        }
      },
      scales: {
        x: { ticks: { color: textColor, font: { family: "'DM Sans',sans-serif", size: 10 } }, grid: { color: gridColor } },
        y: { beginAtZero: true, ticks: { color: textColor, font: { family: "'DM Sans',sans-serif" } }, grid: { color: gridColor } }
      }
    }
  });
}

/* ─── MODAL ─── */
function openModal(name) {
  const food = foods.find(f => f.name === name);
  document.getElementById('modal').classList.add('open');
  document.getElementById('modalBadge').textContent   = food.category;
  document.getElementById('modalTitle').textContent   = food.name;
  document.getElementById('modalCalNum').textContent  = food.calories;
  document.getElementById('modalDesc').textContent    = food.details;
  document.getElementById('mProtein').textContent     = food.protein;
  document.getElementById('mCarbs').textContent       = food.carbs;
  document.getElementById('mFat').textContent         = food.fat;
  document.getElementById('modalBar').innerHTML       = macroBar(food.protein, food.carbs, food.fat);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target.id === 'modal') closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ─── FILTER + SORT ─── */
function getSorted(list) {
  const s = [...list];
  if      (currentSort === 'cal-asc')  s.sort((a, b) => a.calories - b.calories);
  else if (currentSort === 'cal-desc') s.sort((a, b) => b.calories - a.calories);
  else if (currentSort === 'protein')  s.sort((a, b) => b.protein  - a.protein);
  else if (currentSort === 'az')       s.sort((a, b) => a.name.localeCompare(b.name));
  return s;
}

function applyFilters() {
  const q   = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;

  const filtered = foods.filter(f => {
    const matchQ   = f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q);
    const matchCat = cat === 'all' || f.category === cat;
    return matchQ && matchCat;
  });

  displayFoods(getSorted(filtered));
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);

document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    applyFilters();
  });
});

/* ─── THEME ─── */
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  const isDark = document.body.classList.contains('dark');
  document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
  applyFilters(); // re-render chart with updated theme colors
});

/* ─── INIT ─── */
document.getElementById('totalCount').textContent = foods.length;
displayFoods(foods);

/* ─── AUTH INTEGRATION HOOK ─── */
// Patch openModal after auth.js loads to expose _modalFood
const _origOpenModal = openModal;
window.openModal = function(name) {
  _origOpenModal(name);
  const food = foods.find(f => f.name === name);
  if (typeof _modalFood !== 'undefined') {
    window._modalFood = food;
    const logSection = document.getElementById('modalLogSection');
    const servings   = document.getElementById('modalServings');
    const logMsg     = document.getElementById('modalLogMsg');
    if (logSection) {
      logSection.style.display = (typeof getToken === 'function' && getToken()) ? '' : 'none';
    }
    if (servings) servings.value = 1;
    if (logMsg)   logMsg.textContent = '';
  }
};

/* ══════════════════════════════════════════════
   AUTH INTEGRATION — % of daily goal on cards
   ══════════════════════════════════════════════ */

// Patch displayFoods to add % badge when TDEE is known
const _origDisplayFoods = displayFoods;
window.displayFoods = function(list) {
  _origDisplayFoods(list);
  // After cards render, inject % pill if TDEE known
  if (typeof _tdee === 'undefined' || !_tdee) return;
  document.querySelectorAll('.food-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent;
    const food  = foods.find(f => f.name === title);
    if (!food) return;
    const pct = Math.round((food.calories / _tdee) * 100);
    const existing = card.querySelector('.tdee-pct-pill');
    if (existing) return;
    const pill = document.createElement('span');
    pill.className = 'tdee-pct-pill';
    pill.textContent = `${pct}% of goal`;
    pill.style.cssText = `
      font-size:.65rem;font-weight:600;letter-spacing:.04em;
      background:var(--accent-dim);color:var(--accent);
      border:1px solid var(--border);border-radius:20px;
      padding:2px 8px;margin-top:4px;display:inline-block;
    `;
    card.querySelector('.macro-labels')?.insertAdjacentElement('afterend', pill);
  });
};

// Re-inject pills whenever TDEE changes
const _tdeeObserver = setInterval(() => {
  if (typeof _tdee !== 'undefined' && _tdee && !document.querySelector('.tdee-pct-pill')) {
    window.displayFoods(Array.from(document.querySelectorAll('.food-card')).map(c => {
      return foods.find(f => f.name === c.querySelector('h3')?.textContent);
    }).filter(Boolean));
  }
}, 1000);

// Patch openModal for servings preview + food exposure
const _origOpenModal2 = window.openModal || openModal;
window.openModal = function(name) {
  _origOpenModal2(name);
  const food = foods.find(f => f.name === name);
  window._modalFood = food;

  const logSec = document.getElementById('modalLogSection');
  if (logSec) logSec.style.display = (typeof getToken === 'function' && getToken()) ? '' : 'none';

  const preview = document.getElementById('modalCalPreview');
  const servInp = document.getElementById('modalServings');
  if (preview && servInp && food) {
    servInp.value = 1;
    preview.textContent = `= ${food.calories} kcal`;
    servInp.oninput = () => {
      const s = parseFloat(servInp.value) || 1;
      preview.textContent = `= ${Math.round(food.calories * s)} kcal`;
    };
  }

  document.getElementById('modalLogMsg').textContent = '';
};
