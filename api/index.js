'use strict';
const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
const fs         = require('fs');
const { body, param, query, validationResult } = require('express-validator');

const app        = express();
const PORT       = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'foodiq_secret_change_in_production';
const DB_FILE    = path.join(__dirname, 'db.json');
/* ══════════════════════════════════════════
   PERSISTENT JSON FILE STORE
   ══════════════════════════════════════════ */
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) { console.error('DB load error:', e.message); }
  return { users: {} };
}

function saveDB() {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
  catch (e) { console.error('DB save error:', e.message); }
}

let db = loadDB();
// Shorthand accessor
const users = db.users;

/* ══════════════════════════════════════════
   MIDDLEWARE
   ══════════════════════════════════════════ */
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Validation error handler — call at start of any route that uses validators
function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
}

// JWT auth middleware
function auth(req, res, next) {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Convenience: get user or 404
function getUser(email, res) {
  const u = users[email];
  if (!u) { res.status(404).json({ error: 'User not found' }); return null; }
  return u;
}

/* ══════════════════════════════════════════
   AUTH ROUTES
   ══════════════════════════════════════════ */

// POST /api/register
app.post('/api/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    if (!validate(req, res)) return;
    const { name, email, password } = req.body;
    if (users[email]) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    users[email] = {
      name, email, passwordHash,
      bmiDetails: null,
      foodLog: {},
      createdAt: new Date().toISOString()
    };
    saveDB();

    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ message: 'Registered successfully', token, user: { name, email } });
  }
);

// POST /api/login
app.post('/api/login',
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    if (!validate(req, res)) return;
    const { email, password } = req.body;
    const user = users[email];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email } });
  }
);

// GET /api/me
app.get('/api/me', auth, (req, res) => {
  const user = getUser(req.user.email, res);
  if (!user) return;
  const { passwordHash, ...safe } = user;
  return res.json(safe);
});

// PUT /api/me  — update profile name (+ optionally password)
app.put('/api/me', auth,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  async (req, res) => {
    if (!validate(req, res)) return;
    const user = getUser(req.user.email, res);
    if (!user) return;

    const { name, currentPassword, newPassword } = req.body;

    if (name) user.name = name;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'currentPassword required to change password' });
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) return res.status(401).json({ error: 'Current password incorrect' });
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    saveDB();
    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ message: 'Profile updated', user: { name: user.name, email: user.email }, token });
  }
);

/* ══════════════════════════════════════════
   BMI ROUTES
   ══════════════════════════════════════════ */
const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };

function calcBMI({ heightCm: h, weightKg: w, age: a, gender, activityLevel }) {
  const bmi      = +(w / ((h / 100) ** 2)).toFixed(1);
  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmr      = gender === 'male'
    ? Math.round(88.362  + 13.397 * w + 4.799 * h - 5.677 * a)
    : Math.round(447.593 +  9.247 * w + 3.098 * h - 4.330 * a);
  const tdee     = Math.round(bmr * (ACTIVITY[activityLevel] || 1.2));
  // Macro targets (% split: 30P / 45C / 25F)
  const targets  = {
    protein: Math.round((tdee * 0.30) / 4),
    carbs:   Math.round((tdee * 0.45) / 4),
    fat:     Math.round((tdee * 0.25) / 9),
  };
  return { bmi, category, bmr, tdee, targets };
}

// POST /api/bmi
app.post('/api/bmi', auth,
  body('heightCm').isFloat({ min: 50, max: 250 }).withMessage('Height must be 50–250 cm'),
  body('weightKg').isFloat({ min: 10, max: 500 }).withMessage('Weight must be 10–500 kg'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be 1–120'),
  body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('activityLevel').optional().isIn(Object.keys(ACTIVITY)).withMessage('Invalid activity level'),
  (req, res) => {
    if (!validate(req, res)) return;
    const user = getUser(req.user.email, res);
    if (!user) return;

    const { heightCm, weightKg, age, gender, activityLevel = 'sedentary' } = req.body;
    const input = { heightCm: +heightCm, weightKg: +weightKg, age: +age, gender, activityLevel };
    const calc  = calcBMI(input);
    const bmiDetails = { ...input, ...calc, savedAt: new Date().toISOString() };

    user.bmiDetails = bmiDetails;
    saveDB();
    return res.json({ message: 'BMI saved successfully', bmiDetails });
  }
);

// GET /api/bmi
app.get('/api/bmi', auth, (req, res) => {
  const user = getUser(req.user.email, res);
  if (!user) return;
  if (!user.bmiDetails) return res.status(404).json({ error: 'No BMI data saved yet' });
  return res.json(user.bmiDetails);
});

/* ══════════════════════════════════════════
   FOOD LOG ROUTES
   ══════════════════════════════════════════ */

function todayStr() { return new Date().toISOString().slice(0, 10); }

// GET /api/log?date=YYYY-MM-DD
app.get('/api/log', auth,
  query('date').optional().isDate().withMessage('date must be YYYY-MM-DD'),
  (req, res) => {
    if (!validate(req, res)) return;
    const user = getUser(req.user.email, res);
    if (!user) return;
    const date  = req.query.date || todayStr();
    const log   = (user.foodLog || {})[date] || [];
    const total = log.reduce((s, e) => ({ calories: s.calories + e.calories, protein: +(s.protein + e.protein).toFixed(1), carbs: +(s.carbs + e.carbs).toFixed(1), fat: +(s.fat + e.fat).toFixed(1) }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return res.json({ date, entries: log, totals: total });
  }
);

// POST /api/log
app.post('/api/log', auth,
  body('foodName').trim().notEmpty().withMessage('foodName is required'),
  body('calories').isFloat({ min: 0 }).withMessage('calories must be a positive number'),
  body('servings').optional().isFloat({ min: 0.1 }).withMessage('servings must be > 0'),
  (req, res) => {
    if (!validate(req, res)) return;
    const user = getUser(req.user.email, res);
    if (!user) return;

    const { foodName, calories, protein = 0, carbs = 0, fat = 0, servings = 1 } = req.body;
    const srv  = +servings;
    const date = todayStr();

    if (!user.foodLog)       user.foodLog = {};
    if (!user.foodLog[date]) user.foodLog[date] = [];

    const entry = {
      id:       Date.now(),
      foodName,
      servings: srv,
      calories: Math.round(calories * srv),
      protein:  +((protein) * srv).toFixed(1),
      carbs:    +((carbs)   * srv).toFixed(1),
      fat:      +((fat)     * srv).toFixed(1),
      loggedAt: new Date().toISOString()
    };
    user.foodLog[date].push(entry);
    saveDB();

    const log   = user.foodLog[date];
    const total = log.reduce((s, e) => ({ calories: s.calories + e.calories, protein: +(s.protein + e.protein).toFixed(1), carbs: +(s.carbs + e.carbs).toFixed(1), fat: +(s.fat + e.fat).toFixed(1) }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return res.status(201).json({ message: 'Food logged', entry, totals: total });
  }
);

// DELETE /api/log/:id
app.delete('/api/log/:id', auth,
  param('id').isInt().withMessage('id must be an integer'),
  (req, res) => {
    if (!validate(req, res)) return;
    const user = getUser(req.user.email, res);
    if (!user) return;

    const date = todayStr();
    const id   = parseInt(req.params.id);
    if (!user.foodLog?.[date]) return res.status(404).json({ error: 'No log for today' });

    const before = user.foodLog[date].length;
    user.foodLog[date] = user.foodLog[date].filter(e => e.id !== id);
    if (user.foodLog[date].length === before) return res.status(404).json({ error: 'Entry not found' });

    saveDB();
    const log   = user.foodLog[date];
    const total = log.reduce((s, e) => ({ calories: s.calories + e.calories, protein: +(s.protein + e.protein).toFixed(1), carbs: +(s.carbs + e.carbs).toFixed(1), fat: +(s.fat + e.fat).toFixed(1) }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return res.json({ message: 'Entry removed', totals: total });
  }
);

/* ══════════════════════════════════════════
   STATS ROUTE  — last 7 days summary
   ══════════════════════════════════════════ */
app.get('/api/stats', auth, (req, res) => {
  const user = getUser(req.user.email, res);
  if (!user) return;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d    = new Date(); d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const log  = (user.foodLog || {})[date] || [];
    const tot  = log.reduce((s, e) => ({
      calories: s.calories + e.calories,
      protein:  +(s.protein + e.protein).toFixed(1),
      carbs:    +(s.carbs   + e.carbs  ).toFixed(1),
      fat:      +(s.fat     + e.fat    ).toFixed(1),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    days.push({ date, label: d.toLocaleDateString('en-US', { weekday: 'short' }), ...tot, count: log.length });
  }

  const activeDays = days.filter(d => d.calories > 0);
  const avg = activeDays.length
    ? {
        calories: Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length),
        protein:  +(activeDays.reduce((s, d) => s + d.protein, 0) / activeDays.length).toFixed(1),
        carbs:    +(activeDays.reduce((s, d) => s + d.carbs,   0) / activeDays.length).toFixed(1),
        fat:      +(activeDays.reduce((s, d) => s + d.fat,     0) / activeDays.length).toFixed(1),
      }
    : null;

  return res.json({ days, avgPerActiveDay: avg, tdee: user.bmiDetails?.tdee || null });
});

/* ══════════════════════════════════════════
   START
   ══════════════════════════════════════════ */
module.exports = app;