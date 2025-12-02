import * as SQLite from 'expo-sqlite';

export type PatientRecord = {
  id: string;
  name: string;
  village: string;
  age: number;
  gender: string;
  lastVisit: string; // YYYY-MM-DD
  status: string;
  nextVisit: string; // YYYY-MM-DD
  contact?: string;
  territory_state?: string;
  territory_district?: string;
  territory_block?: string;
  territory_village?: string;
  formData?: any;
  updatedAt?: string; // ISO
  isDirty?: number; // 1 means needs sync
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string; // Plain for now; consider hashing in production
  ashaId: string;
  phone: string;
  supervisorId?: string;
  territory_state?: string;
  territory_district?: string;
  territory_block?: string;
  territory_village?: string;
  createdAt?: string;
  isActive?: number; // 1 active, 0 inactive
  preferred_language?: string;
};

const db = SQLite.openDatabaseSync('asha_health.db');

export async function initDatabase(): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      village TEXT,
      age INTEGER,
      gender TEXT,
      lastVisit TEXT,
      status TEXT,
      nextVisit TEXT,
      contact TEXT,
      territory_state TEXT,
      territory_district TEXT,
      territory_block TEXT,
      territory_village TEXT,
      formData TEXT,
      updatedAt TEXT,
      isDirty INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT,
      entityId TEXT,
      action TEXT,
      payload TEXT,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      ashaId TEXT NOT NULL,
      phone TEXT NOT NULL,
      supervisorId TEXT,
      territory_state TEXT,
      territory_district TEXT,
      territory_block TEXT,
      territory_village TEXT,
      preferred_language TEXT,
      createdAt TEXT,
      isActive INTEGER DEFAULT 1
    );
  `);
  // Best-effort migration: add preferred_language if missing
  try {
    await db.runAsync(`ALTER TABLE users ADD COLUMN preferred_language TEXT;`);
  } catch {}
}

export async function upsertPatient(patient: PatientRecord): Promise<void> {
  const nowIso = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO patients (
        id, name, village, age, gender, lastVisit, status, nextVisit, contact,
        territory_state, territory_district, territory_block, territory_village,
        formData, updatedAt, isDirty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET 
        name=excluded.name,
        village=excluded.village,
        age=excluded.age,
        gender=excluded.gender,
        lastVisit=excluded.lastVisit,
        status=excluded.status,
        nextVisit=excluded.nextVisit,
        contact=excluded.contact,
        territory_state=excluded.territory_state,
        territory_district=excluded.territory_district,
        territory_block=excluded.territory_block,
        territory_village=excluded.territory_village,
        formData=excluded.formData,
        updatedAt=excluded.updatedAt,
        isDirty=1;
      `,
      [
        patient.id,
        patient.name,
        patient.village,
        patient.age,
        patient.gender,
        patient.lastVisit,
        patient.status,
        patient.nextVisit,
        patient.contact || '',
        patient.territory_state || '',
        patient.territory_district || '',
        patient.territory_block || '',
        patient.territory_village || '',
        JSON.stringify(patient.formData || {}),
        nowIso,
      ]
    );

    await db.runAsync(
      `INSERT INTO sync_queue (entity, entityId, action, payload, createdAt)
       VALUES (?, ?, ?, ?, ?);`,
      [
        'patient',
        patient.id,
        'upsert',
        JSON.stringify(patient),
        nowIso,
      ]
    );
  });
}

export async function getAllPatients(): Promise<PatientRecord[]> {
  const rows = await db.getAllAsync<any>(`SELECT * FROM patients ORDER BY updatedAt DESC;`);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    village: r.village,
    age: r.age,
    gender: r.gender,
    lastVisit: r.lastVisit,
    status: r.status,
    nextVisit: r.nextVisit,
    contact: r.contact,
    territory_state: r.territory_state,
    territory_district: r.territory_district,
    territory_block: r.territory_block,
    territory_village: r.territory_village,
    formData: safeParseJSON(r.formData),
    updatedAt: r.updatedAt,
    isDirty: r.isDirty,
  }));
}

export async function markPatientsClean(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE patients SET isDirty = 0 WHERE id IN (${placeholders});`, ids as any);
}

export async function getSyncQueue(): Promise<Array<{id:number, entity:string, entityId:string, action:string, payload:any}>> {
  const rows = await db.getAllAsync<any>(`SELECT * FROM sync_queue ORDER BY id ASC;`);
  return rows.map((r) => ({
    id: r.id,
    entity: r.entity,
    entityId: r.entityId,
    action: r.action,
    payload: safeParseJSON(r.payload),
  }));
}

export async function removeFromSyncQueue(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`DELETE FROM sync_queue WHERE id IN (${placeholders});`, ids as any);
}

function safeParseJSON(text: string | null): any {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ========== Users helpers ==========

export async function createUser(user: UserRecord): Promise<UserRecord> {
  const nowIso = new Date().toISOString();
  const id = user.id || String(Date.now());
  try {
    await db.runAsync(
      `INSERT INTO users (
        id, name, email, password, ashaId, phone, supervisorId,
        territory_state, territory_district, territory_block, territory_village,
        preferred_language,
        createdAt, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
      [
        id,
        user.name,
        user.email.toLowerCase(),
        user.password,
        user.ashaId,
        user.phone,
        user.supervisorId || '',
        user.territory_state || '',
        user.territory_district || '',
        user.territory_block || '',
        user.territory_village || '',
        user.preferred_language || 'en',
        nowIso,
      ]
    );
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes('UNIQUE') && msg.includes('users.email')) {
      throw new Error('EMAIL_EXISTS');
    }
    throw e;
  }

  const created = await getUserByEmail(user.email);
  if (!created) throw new Error('CREATE_FAILED');
  return created;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const row = await db.getFirstAsync<any>(`SELECT * FROM users WHERE email = ? LIMIT 1;`, [email.toLowerCase()]);
  if (!row) return null;
  return mapUserRow(row);
}

export async function getUserByEmailAndPassword(email: string, password: string): Promise<UserRecord | null> {
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM users WHERE email = ? AND password = ? AND isActive = 1 LIMIT 1;`,
    [email.toLowerCase(), password]
  );
  if (!row) return null;
  return mapUserRow(row);
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const rows = await db.getAllAsync<any>(`SELECT * FROM users ORDER BY createdAt DESC;`);
  return rows.map(mapUserRow);
}

function mapUserRow(r: any): UserRecord {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    ashaId: r.ashaId,
    phone: r.phone,
    supervisorId: r.supervisorId,
    territory_state: r.territory_state,
    territory_district: r.territory_district,
    territory_block: r.territory_block,
    territory_village: r.territory_village,
    preferred_language: r.preferred_language,
    createdAt: r.createdAt,
    isActive: r.isActive,
  };
}

export async function updateUserPreferredLanguage(userId: string, lang: string): Promise<void> {
  await db.runAsync(`UPDATE users SET preferred_language = ? WHERE id = ?;`, [lang, userId]);
}


