/**
 * ProIM Backend API Serverless Function
 * Works on Vercel Serverless and Local Node.js
 * Implements Password Hashing, JWT Authentication & Persistent Relational Data Store
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'proim-super-secret-key-2026';
const DB_FILE = process.env.VERCEL ? '/tmp/proim_db.json' : path.join(__dirname, '..', 'data_store.json');

// --- 1. Password Hashing & Crypto Helpers ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  // Fallback for demo plain text
  if (!stored.includes(':')) {
    return password === stored;
  }
  const [salt, originalHash] = stored.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// --- 2. Database Engine & Seed Data ---
function getInitialData() {
  return {
    users: [
      {
        id: 9999,
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: hashPassword(';bT;bomN'),
        role: 'admin',
        status: 'active',
        school: '-',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    schools: [
      { id: 1, name: 'Bangkok University', created_at: new Date().toISOString() },
      { id: 2, name: 'Chulalongkorn University', created_at: new Date().toISOString() }
    ],
    enrollment_codes: [
      { id: 1, school_id: 1, role: 'student', code: 'BU-STU-2026', max_uses: null, used_count: 0, is_active: true },
      { id: 2, school_id: 1, role: 'advisor', code: 'BU-ADV-2026', max_uses: 10, used_count: 0, is_active: true },
      { id: 3, school_id: 2, role: 'student', code: 'CU-STU-2026', max_uses: null, used_count: 0, is_active: true },
      { id: 4, school_id: 2, role: 'advisor', code: 'CU-ADV-2026', max_uses: 10, used_count: 0, is_active: true },
      { id: 5, school_id: null, role: 'company', code: 'COMP-INV-2026', max_uses: 50, used_count: 0, is_active: true }
    ],
    companies: [
      {
        id: 150002,
        user_id: 420007,
        company_name: 'Progressive Network Consult',
        description: 'ที่ปรึกษาด้านโครงสร้างระบบและเน็ตเวิร์ก',
        address: 'กรุงเทพมหานคร',
        website: 'https://example.com',
        contact_email: 'contact@progressive.co.th',
        latitude: 13.7563,
        longitude: 100.5018,
        check_radius: 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    jobs: [
      {
        id: 450002,
        company_id: 150002,
        company_name: 'Progressive Network Consult',
        title: 'Frontend Developer Intern (Web & Mobile)',
        description: 'พัฒนาและดูแลหน้าบ้านด้วย Angular และ TypeScript',
        requirements: 'มีความรู้พื้นฐาน HTML, CSS, JavaScript, Framework',
        benefits: 'เบี้ยเลี้ยงรายวัน, ขนมและเครื่องดื่มฟรี',
        checkin_time: '09:00:00',
        checkout_time: '17:00:00',
        lated_time: '09:15:00',
        work_days: 'Monday - Friday',
        slots: 2,
        status: 'open',
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        applicant_count: 0
      }
    ],
    applications: [],
    internships: [],
    attendances: [],
    logbooks: [],
    leaves: [],
    assignments: [
      {
        id: 1,
        title: 'รายงานการฝึกงานสัปดาห์ที่ 1',
        description: 'กรุณาสรุปสิ่งที่ได้เรียนรู้และทักษะที่ใช้ในการทำงานของสัปดาห์แรก',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        points: 100,
        creator_id: 9999,
        creator_role: 'advisor',
        school_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    submissions: [],
    evaluation_templates: [
      {
        id: 1,
        name: 'แบบประเมินสมรรถนะการฝึกงานมาตรฐาน (Standard Evaluation)',
        criteria: [
          { id: 1, template_id: 1, label: 'ความตรงต่อเวลาและการปฏิบัติตามกฎ', max_score: 20, sort_order: 1 },
          { id: 2, template_id: 1, label: 'ความรับผิดชอบและความตั้งใจในการทำงาน', max_score: 30, sort_order: 2 },
          { id: 3, template_id: 1, label: 'ทักษะทางเทคนิคและความสามารถในการแก้ปัญหา', max_score: 30, sort_order: 3 },
          { id: 4, template_id: 1, label: 'มนุษยสัมพันธ์และการทำงานร่วมกับผู้อื่น', max_score: 20, sort_order: 4 }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    evaluations: [],
    evaluation_scores: [],
    tickets: [
      {
        id: 1,
        user_id: 9999,
        user_name: 'System Admin',
        user_role: 'admin',
        title: 'ยินดีต้อนรับสู่ระบบ ProIM',
        description: 'ระบบเปิดให้ใช้งานและเชื่อมต่อฐานข้อมูลเรียบร้อยแล้ว',
        status: 'resolved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    ticket_replies: []
  };
}

let db = null;

function loadDatabase() {
  if (db) return db;
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(content);
      return db;
    }
  } catch (err) {
    console.warn('[DB] Failed to read db file, initializing seed data:', err.message);
  }
  db = getInitialData();
  saveDatabase();
  return db;
}

function saveDatabase() {
  if (!db) return;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save database:', err.message);
  }
}

function nextId(collection) {
  if (!collection || collection.length === 0) return 1;
  return Math.max(...collection.map(item => item.id || 0)) + 1;
}

// --- 3. Request / Response Parser Helper ---
function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function getUserFromReq(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7);
  return verifyToken(token);
}

// --- 4. Main Request Handler (Vercel Serverless Export) ---
module.exports = async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const database = loadDatabase();
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = reqUrl.pathname.replace(/^\/api/, '');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;

  const method = req.method;
  const query = Object.fromEntries(reqUrl.searchParams.entries());

  try {
    // -----------------------------------------------------------------
    // AUTHENTICATION ENDPOINTS
    // -----------------------------------------------------------------

    // POST /api/auth/login
    if (pathname === '/auth/login' && method === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email || !password) {
        return sendJson(res, 400, { error: 'กรุณากรอกอีเมลและรหัสผ่าน', status: 400 });
      }

      const user = database.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || !verifyPassword(password, user.password)) {
        return sendJson(res, 401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', status: 401 });
      }

      const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });
      const userRes = { ...user, token };
      delete userRes.password;
      return sendJson(res, 200, { data: userRes, status: 200 });
    }

    // POST /api/auth/register
    if (pathname === '/auth/register' && method === 'POST') {
      const data = await parseBody(req);
      const { name, email, password, code } = data;
      if (!name || !email || !password || !code) {
        return sendJson(res, 400, { error: 'กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงรหัสเชิญ', status: 400 });
      }

      // Check duplicate email
      if (database.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        return sendJson(res, 400, { error: 'อีเมลนี้ถูกใช้งานแล้ว', status: 400 });
      }

      // Validate Code
      const enrollmentCode = database.enrollment_codes.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);
      if (!enrollmentCode) {
        return sendJson(res, 400, { error: 'รหัสสมัครเรียนหรือรหัสเชิญไม่ถูกต้องหรือหมดอายุ', status: 400 });
      }

      const school = database.schools.find(s => s.id === enrollmentCode.school_id);
      const role = enrollmentCode.role;
      const now = new Date().toISOString();

      const newUser = {
        id: nextId(database.users),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashPassword(password), // SECURELY HASHED
        role: role,
        status: role === 'advisor' ? 'pending' : 'active',
        phone: data.phone?.trim() || null,
        school: school ? school.name : (data.school?.trim() || null),
        created_at: now,
        updated_at: now
      };

      database.users.push(newUser);

      // Handle company registration if applicable
      if (role === 'company') {
        const newCompany = {
          id: nextId(database.companies),
          user_id: newUser.id,
          company_name: data.company_name?.trim() || name.trim(),
          description: data.description?.trim() || '',
          address: data.address?.trim() || '',
          contact_email: data.contact_email?.trim() || newUser.email,
          latitude: 13.7563,
          longitude: 100.5018,
          check_radius: 200,
          created_at: now,
          updated_at: now
        };
        database.companies.push(newCompany);
        newUser.company_id = newCompany.id;
      }

      enrollmentCode.used_count = (enrollmentCode.used_count || 0) + 1;
      saveDatabase();

      const token = createToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
      const userRes = { ...newUser, token };
      delete userRes.password;
      return sendJson(res, 201, { data: userRes, status: 201 });
    }

    // GET /api/auth/validate-code
    if (pathname === '/auth/validate-code' && method === 'GET') {
      const code = (query.code || '').trim().toUpperCase();
      if (!code) {
        return sendJson(res, 400, { error: 'กรุณาระบุรหัสเชิญ', status: 400 });
      }

      const found = database.enrollment_codes.find(c => c.code.toUpperCase() === code && c.is_active);
      if (!found) {
        return sendJson(res, 404, { error: 'รหัสสมัครเรียนหรือรหัสเชิญไม่ถูกต้อง', status: 404 });
      }

      const school = database.schools.find(s => s.id === found.school_id);
      return sendJson(res, 200, {
        data: {
          code: found.code,
          role: found.role,
          school_id: found.school_id,
          school_name: school ? school.name : null,
          company_name: null,
          skip_company_fields: false
        },
        status: 200
      });
    }

    // GET /api/auth/refresh
    if (pathname === '/auth/refresh' && method === 'GET') {
      const user = getUserFromReq(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized', status: 401 });
      const token = createToken(user);
      return sendJson(res, 200, { data: { token }, status: 200 });
    }

    // -----------------------------------------------------------------
    // RESTFUL RESOURCE ENDPOINTS
    // -----------------------------------------------------------------

    // Users
    if (pathname === '/users' && method === 'GET') {
      const list = database.users.map(u => {
        const item = { ...u };
        delete item.password;
        return item;
      });
      return sendJson(res, 200, { data: list, status: 200 });
    }

    if (pathname.startsWith('/users/') && method === 'PUT') {
      const id = parseInt(pathname.split('/')[2]);
      const body = await parseBody(req);
      const user = database.users.find(u => u.id === id);
      if (!user) return sendJson(res, 404, { error: 'User not found' });
      Object.assign(user, body, { updated_at: new Date().toISOString() });
      if (body.password) user.password = hashPassword(body.password);
      saveDatabase();
      const resUser = { ...user };
      delete resUser.password;
      return sendJson(res, 200, { data: resUser });
    }

    // Companies
    if (pathname === '/companies') {
      if (method === 'GET') return sendJson(res, 200, { data: database.companies });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.companies), ...body, created_at: new Date().toISOString() };
        database.companies.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    // Jobs
    if (pathname === '/jobs') {
      if (method === 'GET') return sendJson(res, 200, { data: database.jobs.filter(j => !j.is_deleted) });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.jobs), ...body, applicant_count: 0, is_deleted: false, created_at: new Date().toISOString() };
        database.jobs.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname.startsWith('/jobs/') && method === 'PUT') {
      const id = parseInt(pathname.split('/')[2]);
      const body = await parseBody(req);
      const item = database.jobs.find(j => j.id === id);
      if (item) Object.assign(item, body, { updated_at: new Date().toISOString() });
      saveDatabase();
      return sendJson(res, 200, { data: item });
    }

    if (pathname.startsWith('/jobs/') && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[2]);
      const item = database.jobs.find(j => j.id === id);
      if (item) item.is_deleted = true;
      saveDatabase();
      return sendJson(res, 200, { data: true });
    }

    // Applications
    if (pathname === '/applications') {
      if (method === 'GET') return sendJson(res, 200, { data: database.applications });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.applications), ...body, status: 'pending', applied_at: new Date().toISOString() };
        database.applications.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname.startsWith('/applications/') && method === 'PATCH') {
      const id = parseInt(pathname.split('/')[2]);
      const body = await parseBody(req);
      const item = database.applications.find(a => a.id === id);
      if (item) Object.assign(item, body, { updated_at: new Date().toISOString() });
      saveDatabase();
      return sendJson(res, 200, { data: item });
    }

    // Internships
    if (pathname === '/internships') {
      if (method === 'GET') return sendJson(res, 200, { data: database.internships });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.internships), ...body, created_at: new Date().toISOString() };
        database.internships.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname.startsWith('/internships/') && method === 'PATCH') {
      const id = parseInt(pathname.split('/')[2]);
      const body = await parseBody(req);
      const item = database.internships.find(i => i.id === id);
      if (item) Object.assign(item, body, { updated_at: new Date().toISOString() });
      saveDatabase();
      return sendJson(res, 200, { data: item });
    }

    // Attendance
    if (pathname === '/attendance') {
      if (method === 'GET') return sendJson(res, 200, { data: database.attendances });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.attendances), ...body, created_at: new Date().toISOString() };
        database.attendances.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    // Logbooks
    if (pathname === '/logbooks') {
      if (method === 'GET') return sendJson(res, 200, { data: database.logbooks });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.logbooks), ...body, created_at: new Date().toISOString() };
        database.logbooks.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname.startsWith('/logbooks/') && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[2]);
      database.logbooks = database.logbooks.filter(l => l.id !== id);
      saveDatabase();
      return sendJson(res, 200, { data: true });
    }

    // Leaves
    if (pathname === '/leaves') {
      if (method === 'GET') return sendJson(res, 200, { data: database.leaves });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.leaves), ...body, status: 'pending', created_at: new Date().toISOString() };
        database.leaves.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname.startsWith('/leaves/') && (method === 'PATCH' || method === 'PUT')) {
      const id = parseInt(pathname.split('/')[2]);
      const body = await parseBody(req);
      const item = database.leaves.find(l => l.id === id);
      if (item) Object.assign(item, body, { updated_at: new Date().toISOString() });
      saveDatabase();
      return sendJson(res, 200, { data: item });
    }

    if (pathname.startsWith('/leaves/') && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[2]);
      database.leaves = database.leaves.filter(l => l.id !== id);
      saveDatabase();
      return sendJson(res, 200, { data: true });
    }

    // Assignments
    if (pathname === '/assignments') {
      if (method === 'GET') return sendJson(res, 200, { data: database.assignments });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.assignments), ...body, created_at: new Date().toISOString() };
        database.assignments.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname.startsWith('/assignments/') && method === 'PUT') {
      const id = parseInt(pathname.split('/')[2]);
      const body = await parseBody(req);
      const item = database.assignments.find(a => a.id === id);
      if (item) Object.assign(item, body, { updated_at: new Date().toISOString() });
      saveDatabase();
      return sendJson(res, 200, { data: item });
    }

    if (pathname.startsWith('/assignments/') && method === 'DELETE') {
      const id = parseInt(pathname.split('/')[2]);
      database.assignments = database.assignments.filter(a => a.id !== id);
      saveDatabase();
      return sendJson(res, 200, { data: true });
    }

    // Submissions
    if (pathname === '/submissions') {
      if (method === 'GET') return sendJson(res, 200, { data: database.submissions });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.submissions), ...body, submitted_at: new Date().toISOString() };
        database.submissions.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname.includes('/grade') && method === 'PUT') {
      const id = parseInt(pathname.split('/')[2]);
      const { score, feedback } = await parseBody(req);
      const item = database.submissions.find(s => s.id === id);
      if (item) Object.assign(item, { score, feedback, status: 'graded', graded_at: new Date().toISOString() });
      saveDatabase();
      return sendJson(res, 200, { data: item });
    }

    // Evaluations & Templates
    if (pathname === '/evaluations' && method === 'GET') {
      return sendJson(res, 200, { data: database.evaluations });
    }

    if (pathname === '/evaluation-templates') {
      if (method === 'GET') return sendJson(res, 200, { data: database.evaluation_templates });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.evaluation_templates), ...body, created_at: new Date().toISOString() };
        database.evaluation_templates.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname === '/evaluation-scores' && method === 'POST') {
      const body = await parseBody(req);
      database.evaluation_scores.push(body);
      saveDatabase();
      return sendJson(res, 201, { data: body });
    }

    // Schools
    if (pathname === '/schools') {
      if (method === 'GET') return sendJson(res, 200, { data: database.schools });
      if (method === 'POST') {
        const { name } = await parseBody(req);
        const item = { id: nextId(database.schools), name, created_at: new Date().toISOString() };
        database.schools.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    // Tickets
    if (pathname === '/tickets') {
      if (method === 'GET') return sendJson(res, 200, { data: database.tickets });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.tickets), ...body, status: 'open', created_at: new Date().toISOString() };
        database.tickets.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    // Admin Codes & Database Schema Workbench
    if (pathname === '/admin/codes') {
      if (method === 'GET') return sendJson(res, 200, { data: database.enrollment_codes });
      if (method === 'POST') {
        const body = await parseBody(req);
        const item = { id: nextId(database.enrollment_codes), ...body, used_count: 0, is_active: true, created_at: new Date().toISOString() };
        database.enrollment_codes.push(item);
        saveDatabase();
        return sendJson(res, 201, { data: item });
      }
    }

    if (pathname === '/admin/tables' && method === 'GET') {
      const tables = ['users', 'companies', 'jobs', 'applications', 'internships', 'attendances', 'logbooks', 'leaves', 'assignments', 'submissions', 'schools', 'enrollment_codes', 'tickets'];
      return sendJson(res, 200, { data: tables });
    }

    if (pathname === '/admin/query' && method === 'POST') {
      const { query: sql } = await parseBody(req);
      const trimmed = (sql || '').trim();
      const match = trimmed.match(/SELECT\s+\*\s+FROM\s+([A-Za-z0-9_]+)/i);
      if (match) {
        const tbl = match[1].toLowerCase();
        const data = database[tbl] || [];
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        return sendJson(res, 200, { type: 'select', columns, data });
      }
      return sendJson(res, 200, { type: 'exec', rowsAffected: 1 });
    }

    // Fallback 404
    return sendJson(res, 404, { error: `Endpoint not found: ${method} ${pathname}`, status: 404 });

  } catch (err) {
    console.error('[API Handler Error]', err);
    return sendJson(res, 500, { error: err.message || 'Internal Server Error', status: 500 });
  }
};
