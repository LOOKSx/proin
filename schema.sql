-- ==============================================================
-- ProIM (Intern Manager) - Database Schema (PostgreSQL / Supabase)
-- ==============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'advisor', 'company', 'admin')),
    status VARCHAR(50) DEFAULT 'active',
    phone VARCHAR(50),
    school VARCHAR(255),
    profile_image TEXT,
    resume_url TEXT,
    intro TEXT,
    field VARCHAR(100),
    number INTEGER,
    year_level VARCHAR(50),
    class_group VARCHAR(100),
    advisor_id INTEGER,
    company_id INTEGER,
    company_role VARCHAR(100),
    intern_start_date TIMESTAMP,
    intern_end_date TIMESTAMP,
    online_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    check_radius NUMERIC(10, 2) DEFAULT 200,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Jobs / Job Postings Table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    checkin_time TIME DEFAULT '09:00:00',
    checkout_time TIME DEFAULT '17:00:00',
    lated_time TIME DEFAULT '09:15:00',
    work_days VARCHAR(100) DEFAULT 'Monday - Friday',
    slots INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'open',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_posting_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Internships Table
CREATE TABLE IF NOT EXISTS internships (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    job_posting_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Attendances Table
CREATE TABLE IF NOT EXISTS attendances (
    id SERIAL PRIMARY KEY,
    internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    checkout_latitude NUMERIC(10, 6),
    checkout_longitude NUMERIC(10, 6),
    status VARCHAR(50) DEFAULT 'present',
    verification_status VARCHAR(50) DEFAULT 'verified',
    notes TEXT,
    is_wfh BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Logbooks Table
CREATE TABLE IF NOT EXISTS logbooks (
    id SERIAL PRIMARY KEY,
    internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    mentor_comment TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    work_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Leaves Table
CREATE TABLE IF NOT EXISTS leaves (
    id SERIAL PRIMARY KEY,
    internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    mentor_id INTEGER REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

-- 9. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    points INTEGER DEFAULT 100,
    creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    creator_role VARCHAR(50) NOT NULL,
    school_id INTEGER,
    company_id INTEGER,
    student_id INTEGER,
    job_posting_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    file_name VARCHAR(255),
    file_path TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    score NUMERIC(5, 2),
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP
);

-- 11. Evaluation Templates & Criteria Tables
CREATE TABLE IF NOT EXISTS evaluation_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES evaluation_templates(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    max_score INTEGER DEFAULT 10,
    sort_order INTEGER DEFAULT 0
);

-- 12. Evaluations & Scores Tables
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) DEFAULT 0,
    feedback TEXT,
    evaluation_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Schools Table
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Enrollment Codes Table
CREATE TABLE IF NOT EXISTS enrollment_codes (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Tickets & Ticket Replies Tables
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- Seed Initial Data (All 4 User Roles Pre-Configured)
-- ==============================================================

-- Initial Schools
INSERT INTO schools (id, name) VALUES 
(1, 'Bangkok University'),
(2, 'Chulalongkorn University')
ON CONFLICT (id) DO NOTHING;

-- Initial Enrollment Codes
INSERT INTO enrollment_codes (school_id, role, code, max_uses, is_active) VALUES
(1, 'student', 'BU-STU-2026', NULL, TRUE),
(1, 'advisor', 'BU-ADV-2026', 10, TRUE),
(2, 'student', 'CU-STU-2026', NULL, TRUE),
(2, 'advisor', 'CU-ADV-2026', 10, TRUE),
(NULL, 'company', 'COMP-INV-2026', 50, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 1. ADMIN USER (Password: ;bT;bomN หรือ admin123)
INSERT INTO users (id, name, email, password, role, status, school) VALUES
(9999, 'System Admin (ผู้ดูแลระบบ)', 'admin@gmail.com', '$scrypt$N=16384,r=8,p=1$c2FsdF9zZWVkXzIwMjY$ef33b003a2bc0a1f0a2fb4ec4fb6ffeb825f38a5b169542a192454659427b084e3a479ff76ae68e82b7db5b8ffceca02ba3f721ea7a61d683a48e77c5f87b322', 'admin', 'active', '-')
ON CONFLICT (email) DO NOTHING;

-- 2. ADVISOR USER (Password: advisor123)
INSERT INTO users (id, name, email, password, role, status, school, field) VALUES
(1001, 'ผศ.ดร. สมนึก ที่ปรึกษา (อาจารย์นิเทศก์)', 'advisor@gmail.com', 'advisor123', 'advisor', 'active', 'Bangkok University', 'คณะเทคโนโลยีสารสนเทศ')
ON CONFLICT (email) DO NOTHING;

-- 3. COMPANY USER (Password: company123)
INSERT INTO users (id, name, email, password, role, status, company_id) VALUES
(2001, 'คุณพิชัย ผู้จัดการฝ่ายเทคนิค (Progressive Network)', 'company@gmail.com', 'company123', 'company', 'active', 150002)
ON CONFLICT (email) DO NOTHING;

-- 4. STUDENT USER (Password: student123)
INSERT INTO users (id, name, email, password, role, status, school, field, year_level, class_group, advisor_id, company_id) VALUES
(3001, 'สมชาย ใจดี (นักศึกษาฝึกงาน)', 'student@gmail.com', 'student123', 'student', 'active', 'Bangkok University', 'Information Technology', 'ปี 4', 'IT-4A', 1001, 150002)
ON CONFLICT (email) DO NOTHING;

-- Initial Company
INSERT INTO companies (id, user_id, company_name, description, address, contact_email, latitude, longitude, check_radius) VALUES
(150002, 2001, 'Progressive Network Consult', 'ที่ปรึกษาและพัฒนาระบบซอฟต์แวร์ คลาวด์ และโครงสร้างเน็ตเวิร์ก', 'กรุงเทพมหานคร', 'company@gmail.com', 13.7563, 100.5018, 200)
ON CONFLICT (id) DO NOTHING;
