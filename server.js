const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const PORT = Number(process.env.PORT || 3000);

const defaults = {
  settings: {
    clubName: 'Blackford Rovers',
    tagline: 'One Club. One Community. One Rovers.',
    primaryColor: '#c9162d',
    goldColor: '#d7ad45',
    stadium: 'Blixinco Community Stadium'
  },
  news: [
    { id: 1, title: 'Welcome to Blackford Rovers', excerpt: 'The new home of Blackford Rovers is live.', body: 'Welcome to the official Blackford Rovers website and progressive web app. Follow the first team, fixtures, results, squad and club story in one place.', date: '2026-08-18', image: '' },
    { id: 2, title: 'Season preparations underway', excerpt: 'The squad is back on the training ground.', body: 'Graham Mcdonald and the squad are preparing for the new campaign. More updates will be published here.', date: '2026-08-12', image: '' }
  ],
  matches: [
    { id: 1, competition: 'EFL Championship', opponent: 'Portsmouth', date: '2026-08-22', time: '15:00', venue: 'Blackford Rovers Stadium', home: 1, score: '', status: 'Upcoming' },
    { id: 2, competition: 'EFL Championship', opponent: 'Birmingham City', date: '2026-08-29', time: '15:00', venue: "St Andrew's", home: 0, score: '', status: 'Upcoming' },
    { id: 3, competition: 'EFL Championship', opponent: 'Southampton', date: '2026-09-05', time: '15:00', venue: 'Blackford Rovers Stadium', home: 1, score: '', status: 'Upcoming' }
  ],
  results: [
    { id: 1, competition: 'Pre-season', opponent: 'AFC Bournemouth', date: '2026-08-08', home: 1, score: '2–1' },
    { id: 2, competition: 'Pre-season', opponent: 'Portsmouth', date: '2026-08-01', home: 0, score: '1–1' }
  ],
  table: ['Blackford Rovers','Bromley','MK Dons','Cambridge United','Salford City','Notts County','Chesterfield','Grimsby Town','Barnet','Swindon Town','Oldham Athletic','Crewe Alexandra','Colchester United','Walsall','Bristol Rovers','Fleetwood Town','Accrington Stanley','Gillingham','Cheltenham Town','Shrewsbury Town','Newport County','Tranmere Rovers','Crawley Town','Harrogate Town'].map((team, i) => ({ position:i+1, team, played:0, wins:0, draws:0, losses:0, gf:0, ga:0, points:0 })),
  history: "Blackford Rovers was built around the idea that football belongs to the whole community. From its early local roots, the club has grown through generations of players, volunteers, coaches and supporters who have given their time to create something people can be proud to call their own.\n\nThe club’s identity is based on hard work, togetherness and a strong connection with the people around it. Matchdays are about more than the result: they are a meeting point for families, friends and supporters, with the club aiming to give young players a pathway into the game and a place to develop.\n\nToday, Blackford Rovers continues to look forward. The focus is on building a competitive first team, developing the next generation and creating a modern football club that keeps its community spirit at the heart of everything it does.",
  staff: [{ id: 1, name: 'Graham Mcdonald', role: 'First Team Manager', image: '/assets/manager.png' }],
  players: [{"id": "280050", "firstName": "Callum", "lastName": "Fraser", "nationality": "Scotland", "position": "GK", "rating": 65, "height": 191, "image": "p20050.png"}, {"id": "280051", "firstName": "Jamie", "lastName": "McLeod", "nationality": "Scotland", "position": "GK", "rating": 59, "height": 188, "image": "p20051.png"}, {"id": "280052", "firstName": "Lewis", "lastName": "Grant", "nationality": "Scotland", "position": "GK", "rating": 54, "height": 190, "image": "p20052.png"}, {"id": "280053", "firstName": "Ryan", "lastName": "Campbell", "nationality": "Scotland", "position": "RB", "rating": 63, "height": 178, "image": "p20053.png"}, {"id": "280054", "firstName": "Ewan", "lastName": "Robertson", "nationality": "Scotland", "position": "LB", "rating": 62, "height": 181, "image": "p20054.png"}, {"id": "280055", "firstName": "Conner", "lastName": "MacKenzie", "nationality": "Scotland", "position": "CB", "rating": 67, "height": 188, "image": "p20055.png"}, {"id": "280056", "firstName": "Jack", "lastName": "Morrison", "nationality": "England", "position": "CB", "rating": 64, "height": 185, "image": "p20056.png"}, {"id": "280057", "firstName": "Finaly", "lastName": "Stewart", "nationality": "Scotland", "position": "CB", "rating": 59, "height": 187, "image": "p20057.png"}, {"id": "280058", "firstName": "Dylan", "lastName": "Ross", "nationality": "Wales", "position": "RB", "rating": 60, "height": 180, "image": "p20058.png"}, {"id": "280059", "firstName": "Owen", "lastName": "Murray", "nationality": "Scotland", "position": "LB", "rating": 57, "height": 176, "image": "p20059.png"}, {"id": "280060", "firstName": "Archie", "lastName": "Reid", "nationality": "Scotland", "position": "CB", "rating": 55, "height": 184, "image": "p20060.png"}, {"id": "280061", "firstName": "Liam", "lastName": "Anderson", "nationality": "Scotland", "position": "CDM", "rating": 65, "height": 183, "image": "p20061.png"}, {"id": "280062", "firstName": "Scott", "lastName": "Hamilton", "nationality": "Scotland", "position": "CM", "rating": 64, "height": 180, "image": "p20062.png"}, {"id": "280063", "firstName": "Calum", "lastName": "Wallace", "nationality": "Scotland", "position": "CAM", "rating": 66, "height": 177, "image": "p20063.png"}, {"id": "280064", "firstName": "Ben", "lastName": "Fletcher", "nationality": "England", "position": "CM", "rating": 60, "height": 179, "image": "p20064.png"}, {"id": "280065", "firstName": "Rory", "lastName": "Campbell", "nationality": "Scotland", "position": "CM", "rating": 56, "height": 175, "image": "p20065.png"}, {"id": "280066", "firstName": "Jamie", "lastName": "Sinclair", "nationality": "Northern Ireland", "position": "CDM", "rating": 61, "height": 182, "image": "p20066.png"}, {"id": "280067", "firstName": "Max", "lastName": "Turner", "nationality": "England", "position": "CAM", "rating": 55, "height": 174, "image": "p20067.png"}, {"id": "280068", "firstName": "Daniel", "lastName": "Graham", "nationality": "Scotland", "position": "RW", "rating": 67, "height": 181, "image": "p20068.png"}, {"id": "280069", "firstName": "Fraser", "lastName": "Wilson", "nationality": "Scotland", "position": "ST", "rating": 68, "height": 186, "image": "p20069.png"}, {"id": "280070", "firstName": "Kyle", "lastName": "Davidson", "nationality": "Scotland", "position": "LW", "rating": 63, "height": 179, "image": "p20070.png"}, {"id": "280071", "firstName": "Aaron", "lastName": "Kerr", "nationality": "Republic of Ireland", "position": "ST", "rating": 59, "height": 183, "image": "p20071.png"}, {"id": "280072", "firstName": "Noah", "lastName": "Bennett", "nationality": "England", "position": "ST", "rating": 54, "height": 180, "image": "p20072.png"}, {"id": "280073", "firstName": "Alfie", "lastName": "Cheshire", "nationality": "United States", "position": "CAM", "rating": 62, "height": 178, "image": "p20073.png"}],
  admins: []
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
let data = null;

async function loadData() {
  const result = await pool.query(
    'SELECT data FROM club_data LIMIT 1'
  );

if (result.rows.length === 0) {
    const fsData = clone(defaults);

    await pool.query(
      'INSERT INTO club_data (data) VALUES ($1)',
      [fsData]
    );

    return fsData;
  }

  return result.rows[0].data;
}

async function saveData() {
  await pool.query(
    'UPDATE club_data SET data = $1',
    [data]
  );
}
data.settings.stadium = 'Blixinco Community Stadium';
if (!Array.isArray(data.players) || data.players.length === 0) data.players = clone(defaults.players);
data.players = data.players.map(p => ({ ...p, loanStatus: ['loaned-in','loaned-out'].includes(p.loanStatus) ? p.loanStatus : 'none' }));
const leagueTwo2526WithoutBarrow = ['Accrington Stanley','Barnet','Blackford Rovers','Bristol Rovers','Bromley','Cambridge United','Chesterfield','Cheltenham Town','Colchester United','Crawley Town','Crewe Alexandra','Fleetwood Town','Gillingham','Grimsby Town','Harrogate Town','MK Dons','Newport County','Notts County','Oldham Athletic','Salford City','Shrewsbury Town','Swindon Town','Tranmere Rovers','Walsall'];
const existingTableNames = Array.isArray(data.table) ? data.table.map(r => r.team) : [];
if (existingTableNames.length !== 24 || leagueTwo2526WithoutBarrow.some(name => !existingTableNames.includes(name)) || existingTableNames.includes('Barrow')) {
  data.table = leagueTwo2526WithoutBarrow.map((team, i) => ({ position:i+1, team, played:0, wins:0, draws:0, losses:0, gf:0, ga:0, points:0 }));
}
function nextId(items) { return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1; }

// Admin credentials. Environment variables override the development defaults.
const configuredAdminUsername = process.env.ADMIN_USERNAME || 'BlackfordRFC Admin';
const configuredAdminPassword = process.env.ADMIN_PASSWORD || 'BRFCDORSET@2026';

// Create/migrate the configured admin account so the supplied login works even if
// the app was previously started with an older default account.
const configuredAdmin = data.admins.find(a => a.username === configuredAdminUsername);
if (!configuredAdmin) {
  const legacy = data.admins.find(a => a.username === 'admin');
  if (legacy) {
    legacy.username = configuredAdminUsername;
    legacy.password_hash = bcrypt.hashSync(configuredAdminPassword, 12);
  } else {
    data.admins.push({ id: nextId(data.admins), username: configuredAdminUsername, password_hash: bcrypt.hashSync(configuredAdminPassword, 12) });
  }
  saveData();
} else if (!bcrypt.compareSync(configuredAdminPassword, configuredAdmin.password_hash)) {
  configuredAdmin.password_hash = bcrypt.hashSync(configuredAdminPassword, 12);
  saveData();
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

function csrf(req, res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrf = req.session.csrf;
  next();
}
function auth(req, res, next) { if (!req.session.admin) return res.status(401).json({ error: 'Authentication required' }); next(); }
function checkCsrf(req, res, next) { if (!req.session.csrf || req.get('x-csrf-token') !== req.session.csrf) return res.status(403).json({ error: 'Invalid CSRF token' }); next(); }
app.use(csrf);

app.get('/api/bootstrap', (req, res) => {
  res.json({
    settings: data.settings,
    csrf: req.session.csrf,
    authenticated: !!req.session.admin,
    news: [...data.news].sort((a,b) => String(b.date).localeCompare(String(a.date)) || b.id-a.id),
    matches: [...data.matches].sort((a,b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time))),
    results: [...data.results].sort((a,b) => String(b.date).localeCompare(String(a.date)) || b.id-a.id),
    table: data.table.map((r,i) => ({ ...r, position: i+1 })),
    history: data.history,
    staff: data.staff,
    players: data.players
  });
});

app.post('/api/login', checkCsrf, (req, res) => {
  const row = data.admins.find(a => a.username === String(req.body.username || ''));
  if (!row || !bcrypt.compareSync(String(req.body.password || ''), row.password_hash)) return res.status(401).json({ error: 'Invalid username or password' });
  req.session.admin = { id: row.id, username: row.username };
  res.json({ ok: true });
});
app.post('/api/logout', checkCsrf, (req, res) => req.session.destroy(() => res.json({ ok: true })));

app.put('/api/settings', auth, checkCsrf, (req, res) => {
  for (const [key, value] of Object.entries(req.body || {})) if (Object.hasOwn(data.settings, key)) data.settings[key] = String(value);
  saveData(); res.json({ ok: true });
});
app.post('/api/news', auth, checkCsrf, (req, res) => {
  const item = { id: nextId(data.news), title: String(req.body.title || ''), excerpt: String(req.body.excerpt || ''), body: String(req.body.body || ''), date: String(req.body.date || new Date().toISOString().slice(0,10)), image: String(req.body.image || '') };
  data.news.push(item); saveData(); res.json({ id: item.id });
});
app.delete('/api/news/:id', auth, checkCsrf, (req, res) => { data.news = data.news.filter(x => x.id !== Number(req.params.id)); saveData(); res.json({ ok: true }); });
app.post('/api/matches', auth, checkCsrf, (req, res) => {
  const item = { id: nextId(data.matches), competition:String(req.body.competition || ''), opponent:String(req.body.opponent || ''), date:String(req.body.date || ''), time:String(req.body.time || '15:00'), venue:String(req.body.venue || ''), home:req.body.home ? 1 : 0, score:String(req.body.score || ''), status:String(req.body.status || 'Upcoming') };
  data.matches.push(item); saveData(); res.json({ id: item.id });
});
app.delete('/api/matches/:id', auth, checkCsrf, (req, res) => { data.matches = data.matches.filter(x => x.id !== Number(req.params.id)); saveData(); res.json({ ok: true }); });
app.post('/api/players', auth, checkCsrf, (req, res) => {
  const body = req.body || {};
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  if (!firstName || !lastName) return res.status(400).json({ error: 'First and last name are required' });
  const positions = ['GK','RB','LB','CB','CDM','CM','CAM','RW','LW','ST'];
  const position = positions.includes(String(body.position)) ? String(body.position) : 'ST';
  const item = {
    id: String(Date.now()),
    firstName,
    lastName,
    nationality: String(body.nationality || '').trim() || 'England',
    position,
    rating: Math.max(1, Math.min(99, Number(body.rating) || 50)),
    height: Math.max(100, Math.min(230, Number(body.height) || 180)),
    image: String(body.image || '').trim(),
    loanStatus: ['loaned-in', 'loaned-out'].includes(String(body.loanStatus)) ? String(body.loanStatus) : 'none'
  };
  data.players.push(item);
  saveData();
  res.json({ ok: true, player: item });
});
app.put('/api/players/:id/loan', auth, checkCsrf, (req, res) => {
  const player = data.players.find(p => String(p.id) === String(req.params.id));
  if (!player) return res.status(404).json({ error: 'Player not found' });
  const status = String(req.body.loanStatus || 'none');
  if (!['none','loaned-in','loaned-out'].includes(status)) return res.status(400).json({ error: 'Invalid loan status' });
  player.loanStatus = status;
  saveData();
  res.json({ ok: true, loanStatus: status });
});
app.delete('/api/players/:id', auth, checkCsrf, (req, res) => {
  const before = data.players.length;
  data.players = data.players.filter(p => String(p.id) !== String(req.params.id));
  if (data.players.length === before) return res.status(404).json({ error: 'Player not found' });
  saveData();
  res.json({ ok: true });
});
app.put('/api/table', auth, checkCsrf, (req, res) => {
  data.table = (Array.isArray(req.body) ? req.body : []).map(r => ({ position:0, team:String(r.team || ''), played:+r.played||0, wins:+r.wins||0, draws:+r.draws||0, losses:+r.losses||0, gf:+r.gf||0, ga:+r.ga||0, points:+r.points||0 })).map((r,i) => ({ ...r, position:i+1 }));
  saveData(); res.json({ ok: true });
});

app.get('/admin', (req,res) => res.sendFile(path.join(__dirname,'public','admin.html')));
app.use((req,res) => res.sendFile(path.join(__dirname,'public','index.html')));
module.exports = app;
