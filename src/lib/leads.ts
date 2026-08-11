import 'server-only';
import { randomUUID } from 'crypto';
import { query, queryOne, transaction } from './db';
import { LEAD_STATUSES, type LeadStatus } from './leadStatus';

/**
 * Satu-satunya titik akses data lead. Sebelumnya menulis ke JSONL; kini
 * seluruhnya di Postgres agar data selamat saat server restart / redeploy.
 */

export { LEAD_STATUSES, STATUS_LABEL } from './leadStatus';
export type { LeadStatus } from './leadStatus';

export type LeadInput = {
  name: string;
  phone: string;
  city?: string;
  buildingType?: string;
  areaSqm?: number | null;
  floorCondition?: string;
  needType?: string;
  message?: string;
  photoPath?: string | null;
  source?: string;
  ip?: string;
  userAgent?: string;
  utm?: Record<string, string>;
};

export type Lead = {
  id: number;
  publicId: string;
  name: string;
  phone: string;
  city: string | null;
  buildingType: string | null;
  areaSqm: number | null;
  floorCondition: string | null;
  needType: string | null;
  message: string | null;
  photoPath: string | null;
  source: string;
  status: LeadStatus;
  assignedTo: number | null;
  assignedName: string | null;
  estimatedValue: number | null;
  followUpAt: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

type Row = Record<string, unknown>;

function toLead(r: Row): Lead {
  return {
    id: Number(r.id),
    publicId: String(r.public_id),
    name: String(r.name),
    phone: String(r.phone),
    city: (r.city as string) ?? null,
    buildingType: (r.building_type as string) ?? null,
    areaSqm: r.area_sqm === null || r.area_sqm === undefined ? null : Number(r.area_sqm),
    floorCondition: (r.floor_condition as string) ?? null,
    needType: (r.need_type as string) ?? null,
    message: (r.message as string) ?? null,
    photoPath: (r.photo_path as string) ?? null,
    source: String(r.source),
    status: r.status as LeadStatus,
    assignedTo: r.assigned_to === null || r.assigned_to === undefined ? null : Number(r.assigned_to),
    assignedName: (r.assigned_name as string) ?? null,
    estimatedValue:
      r.estimated_value === null || r.estimated_value === undefined
        ? null
        : Number(r.estimated_value),
    followUpAt: r.follow_up_at ? new Date(r.follow_up_at as string).toISOString().slice(0, 10) : null,
    ip: (r.ip as string) ?? null,
    userAgent: (r.user_agent as string) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

const SELECT_LEAD = `
  SELECT l.*, u.name AS assigned_name
    FROM leads l
    LEFT JOIN users u ON u.id = l.assigned_to`;

/* ---------------- tulis (dipakai form publik) ---------------- */

export async function saveLead(input: LeadInput): Promise<{ id: string }> {
  const publicId = randomUUID();
  await query(
    `INSERT INTO leads
       (public_id, name, phone, city, building_type, area_sqm, floor_condition,
        need_type, message, photo_path, source, ip, user_agent, utm)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      publicId,
      input.name,
      input.phone,
      input.city || null,
      input.buildingType || null,
      input.areaSqm ?? null,
      input.floorCondition || null,
      input.needType || null,
      input.message || null,
      input.photoPath || null,
      input.source || 'website',
      input.ip || null,
      input.userAgent || null,
      JSON.stringify(input.utm ?? {}),
    ],
  );
  return { id: publicId };
}

/* ---------------- baca (admin) ---------------- */

export type LeadFilter = {
  status?: LeadStatus | 'semua';
  q?: string;
  assignedTo?: number | 'semua';
  page?: number;
  perPage?: number;
};

export async function listLeads(
  f: LeadFilter = {},
): Promise<{ leads: Lead[]; total: number; page: number; perPage: number; pages: number }> {
  const perPage = Math.min(Math.max(f.perPage ?? 20, 1), 100);
  const page = Math.max(f.page ?? 1, 1);

  const where: string[] = [];
  const params: unknown[] = [];

  if (f.status && f.status !== 'semua') {
    params.push(f.status);
    where.push(`l.status = $${params.length}`);
  }
  if (f.assignedTo && f.assignedTo !== 'semua') {
    params.push(f.assignedTo);
    where.push(`l.assigned_to = $${params.length}`);
  }
  if (f.q && f.q.trim()) {
    params.push(`%${f.q.trim()}%`);
    const i = params.length;
    where.push(`(l.name ILIKE $${i} OR l.phone ILIKE $${i} OR l.city ILIKE $${i})`);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRow = await queryOne<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM leads l ${clause}`,
    params,
  );
  const total = Number(countRow?.n ?? 0);

  params.push(perPage, (page - 1) * perPage);
  const rows = await query(
    `${SELECT_LEAD} ${clause}
      ORDER BY l.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    leads: rows.map(toLead),
    total,
    page,
    perPage,
    pages: Math.max(Math.ceil(total / perPage), 1),
  };
}

export async function getLead(id: number): Promise<Lead | null> {
  const row = await queryOne(`${SELECT_LEAD} WHERE l.id = $1`, [id]);
  return row ? toLead(row) : null;
}

export async function countByStatus(): Promise<Record<string, number>> {
  const rows = await query<{ status: string; n: string }>(
    'SELECT status, COUNT(*)::text AS n FROM leads GROUP BY status',
  );
  const out: Record<string, number> = { total: 0 };
  for (const s of LEAD_STATUSES) out[s] = 0;
  for (const r of rows) {
    out[r.status] = Number(r.n);
    out.total += Number(r.n);
  }
  return out;
}

export async function dashboardStats(): Promise<{
  today: number;
  week: number;
  month: number;
  overdue: number;
  wonValue: number;
}> {
  const r = await queryOne<Row>(`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))::text   AS today,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::text  AS week,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::text AS month,
      COUNT(*) FILTER (
        WHERE follow_up_at < CURRENT_DATE AND status NOT IN ('menang','kalah')
      )::text AS overdue,
      COALESCE(SUM(estimated_value) FILTER (WHERE status = 'menang'), 0)::text AS won_value
    FROM leads`);
  return {
    today: Number(r?.today ?? 0),
    week: Number(r?.week ?? 0),
    month: Number(r?.month ?? 0),
    overdue: Number(r?.overdue ?? 0),
    wonValue: Number(r?.won_value ?? 0),
  };
}

/* ---------------- ubah (admin, dengan audit) ---------------- */

export async function updateLead(
  leadId: number,
  userId: number,
  changes: {
    status?: LeadStatus;
    assignedTo?: number | null;
    estimatedValue?: number | null;
    followUpAt?: string | null;
  },
): Promise<Lead | null> {
  return transaction(async (q) => {
    const before = (await q('SELECT * FROM leads WHERE id = $1 FOR UPDATE', [leadId]))[0];
    if (!before) return null;

    const sets: string[] = [];
    const params: unknown[] = [];
    const audit: Array<[string, string | null, string | null]> = [];

    const push = (col: string, val: unknown, oldVal: unknown) => {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
      const o = oldVal === null || oldVal === undefined ? null : String(oldVal);
      const n = val === null || val === undefined ? null : String(val);
      if (o !== n) audit.push([col, o, n]);
    };

    if (changes.status !== undefined) push('status', changes.status, before.status);
    if (changes.assignedTo !== undefined)
      push('assigned_to', changes.assignedTo, before.assigned_to);
    if (changes.estimatedValue !== undefined)
      push('estimated_value', changes.estimatedValue, before.estimated_value);
    if (changes.followUpAt !== undefined)
      push('follow_up_at', changes.followUpAt, before.follow_up_at);

    if (sets.length) {
      params.push(leadId);
      await q(`UPDATE leads SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
    }

    for (const [field, oldV, newV] of audit) {
      await q(
        `INSERT INTO lead_events (lead_id, user_id, field, old_value, new_value)
         VALUES ($1,$2,$3,$4,$5)`,
        [leadId, userId, field, oldV, newV],
      );
    }

    const rows = await q(
      `SELECT l.*, u.name AS assigned_name FROM leads l
         LEFT JOIN users u ON u.id = l.assigned_to
        WHERE l.id = $1`,
      [leadId],
    );
    return rows[0] ? toLead(rows[0]) : null;
  });
}

export async function deleteLead(leadId: number): Promise<boolean> {
  const rows = await query('DELETE FROM leads WHERE id = $1 RETURNING id', [leadId]);
  return rows.length > 0;
}

/* ---------------- catatan & riwayat ---------------- */

export type Note = {
  id: number;
  body: string;
  authorName: string | null;
  createdAt: string;
};

export async function addNote(leadId: number, userId: number, body: string): Promise<Note> {
  const row = await queryOne<Row>(
    `INSERT INTO lead_notes (lead_id, user_id, body) VALUES ($1,$2,$3)
     RETURNING id, body, created_at`,
    [leadId, userId, body],
  );
  const author = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = $1', [userId]);
  return {
    id: Number(row!.id),
    body: String(row!.body),
    authorName: author?.name ?? null,
    createdAt: new Date(row!.created_at as string).toISOString(),
  };
}

export async function listNotes(leadId: number): Promise<Note[]> {
  const rows = await query<Row>(
    `SELECT n.id, n.body, n.created_at, u.name AS author
       FROM lead_notes n LEFT JOIN users u ON u.id = n.user_id
      WHERE n.lead_id = $1 ORDER BY n.created_at DESC`,
    [leadId],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    body: String(r.body),
    authorName: (r.author as string) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export type LeadEvent = {
  id: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  authorName: string | null;
  createdAt: string;
};

export async function listEvents(leadId: number): Promise<LeadEvent[]> {
  const rows = await query<Row>(
    `SELECT e.id, e.field, e.old_value, e.new_value, e.created_at, u.name AS author
       FROM lead_events e LEFT JOIN users u ON u.id = e.user_id
      WHERE e.lead_id = $1 ORDER BY e.created_at DESC LIMIT 50`,
    [leadId],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    field: String(r.field),
    oldValue: (r.old_value as string) ?? null,
    newValue: (r.new_value as string) ?? null,
    authorName: (r.author as string) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

/* ---------------- pengguna ---------------- */

export type UserRow = { id: number; name: string; email: string; role: string; isActive: boolean };

export async function listUsers(): Promise<UserRow[]> {
  const rows = await query<Row>(
    'SELECT id, name, email, role, is_active FROM users ORDER BY name',
  );
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    role: String(r.role),
    isActive: Boolean(r.is_active),
  }));
}

/* ---------------- ekspor ---------------- */

export async function allLeadsForExport(): Promise<Lead[]> {
  const rows = await query(`${SELECT_LEAD} ORDER BY l.created_at DESC`);
  return rows.map(toLead);
}
