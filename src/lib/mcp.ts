import 'server-only';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { query, queryOne } from './db';

/**
 * Infrastruktur MCP: token, idempotency, dan audit.
 * Setiap tool wajib punya request_id, dicatat, dan idempotent (PRD §9).
 */

export type Scope = 'read' | 'write' | 'publish';

export type McpToken = {
  id: number;
  name: string;
  prefix: string;
  scopes: Scope[];
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

/* ---------------- token ---------------- */

/** Membuat token baru. Nilai asli hanya dikembalikan sekali di sini. */
export async function createToken(
  name: string,
  scopes: Scope[],
  userId: number,
): Promise<{ token: string; row: McpToken }> {
  const raw = `jyt_${randomBytes(24).toString('base64url')}`;
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO mcp_tokens (name, token_hash, token_prefix, scopes, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, sha256(raw), raw.slice(0, 12), scopes, userId],
  );
  return { token: raw, row: toToken(row!) };
}

function toToken(r: Record<string, unknown>): McpToken {
  return {
    id: Number(r.id),
    name: String(r.name),
    prefix: String(r.token_prefix),
    scopes: (r.scopes as Scope[]) ?? [],
    isActive: Boolean(r.is_active),
    lastUsedAt: r.last_used_at ? new Date(r.last_used_at as string).toISOString() : null,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function listTokens(): Promise<McpToken[]> {
  const rows = await query('SELECT * FROM mcp_tokens ORDER BY created_at DESC');
  return rows.map(toToken);
}

export async function revokeToken(id: number): Promise<boolean> {
  const rows = await query(
    'UPDATE mcp_tokens SET is_active = FALSE WHERE id = $1 RETURNING id',
    [id],
  );
  return rows.length > 0;
}

/** Verifikasi header Authorization: Bearer <token>. */
export async function authenticate(header: string | null): Promise<McpToken | null> {
  if (!header?.startsWith('Bearer ')) return null;
  const raw = header.slice(7).trim();
  if (!raw) return null;

  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM mcp_tokens WHERE token_hash = $1 AND is_active = TRUE',
    [sha256(raw)],
  );
  if (!row) return null;

  await query('UPDATE mcp_tokens SET last_used_at = now() WHERE id = $1', [row.id]);
  return toToken(row);
}

export function hasScope(token: McpToken, needed: Scope): boolean {
  return token.scopes.includes(needed);
}

/* ---------------- idempotency + audit ---------------- */

export type McpLog = {
  id: number;
  requestId: string;
  tool: string;
  status: string;
  error: string | null;
  durationMs: number | null;
  createdAt: string;
};

/** Kembalikan hasil tersimpan bila request_id sudah pernah diproses. */
export async function findExisting(requestId: string): Promise<unknown | null> {
  const row = await queryOne<{ result: unknown; status: string }>(
    'SELECT result, status FROM mcp_requests WHERE request_id = $1',
    [requestId],
  );
  if (!row || row.status !== 'success') return null;
  return row.result;
}

export async function logRequest(
  requestId: string,
  tool: string,
  params: unknown,
  tokenId: number | null,
): Promise<void> {
  await query(
    `INSERT INTO mcp_requests (request_id, tool, params, token_id)
     VALUES ($1,$2,$3,$4) ON CONFLICT (request_id) DO NOTHING`,
    [requestId, tool, JSON.stringify(params ?? {}), tokenId],
  );
}

export async function finishRequest(
  requestId: string,
  status: 'success' | 'error',
  result: unknown,
  error: string | null,
  durationMs: number,
): Promise<void> {
  await query(
    `UPDATE mcp_requests
        SET status = $1, result = $2, error = $3, duration_ms = $4
      WHERE request_id = $5`,
    [status, JSON.stringify(result ?? null), error, durationMs, requestId],
  );
}

export async function listMcpLogs(limit = 50): Promise<McpLog[]> {
  const rows = await query<Record<string, unknown>>(
    `SELECT id, request_id, tool, status, error, duration_ms, created_at
       FROM mcp_requests ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    requestId: String(r.request_id),
    tool: String(r.tool),
    status: String(r.status),
    error: (r.error as string) ?? null,
    durationMs: r.duration_ms === null ? null : Number(r.duration_ms),
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export function newRequestId(): string {
  return randomUUID();
}

/* ---------------- audit CMS ---------------- */

export async function logCmsEvent(
  entity: string,
  entityId: string | number | null,
  action: string,
  detail: Record<string, unknown> = {},
  actor: 'admin' | 'mcp' = 'admin',
  userId: number | null = null,
): Promise<void> {
  await query(
    `INSERT INTO cms_events (entity, entity_id, action, detail, actor, user_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [entity, entityId === null ? null : String(entityId), action, JSON.stringify(detail), actor, userId],
  );
}

export type CmsEvent = {
  id: number;
  entity: string;
  entityId: string | null;
  action: string;
  actor: string;
  authorName: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
};

export async function listCmsEvents(limit = 40): Promise<CmsEvent[]> {
  const rows = await query<Record<string, unknown>>(
    `SELECT e.*, u.name AS author FROM cms_events e
       LEFT JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    entity: String(r.entity),
    entityId: (r.entity_id as string) ?? null,
    action: String(r.action),
    actor: String(r.actor),
    authorName: (r.author as string) ?? null,
    detail: (r.detail as Record<string, unknown>) ?? {},
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

/* ---------------- brief ---------------- */

export type Brief = {
  id: number;
  topic: string;
  intent: string;
  primaryKeyword: string;
  keywordCluster: string[];
  entities: string[];
  questions: string[];
  internalLinks: string[];
  sources: string[];
  status: string;
  createdAt: string;
};

function toBrief(r: Record<string, unknown>): Brief {
  return {
    id: Number(r.id),
    topic: String(r.topic),
    intent: String(r.intent),
    primaryKeyword: String(r.primary_keyword),
    keywordCluster: (r.keyword_cluster as string[]) ?? [],
    entities: (r.entities as string[]) ?? [],
    questions: (r.questions as string[]) ?? [],
    internalLinks: (r.internal_links as string[]) ?? [],
    sources: (r.sources as string[]) ?? [],
    status: String(r.status),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function createBrief(
  data: {
    topic: string;
    intent?: string;
    primaryKeyword: string;
    keywordCluster?: string[];
    entities?: string[];
    questions?: string[];
    internalLinks?: string[];
    sources?: string[];
  },
  userId: number | null,
): Promise<Brief> {
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO content_briefs
       (topic, intent, primary_keyword, keyword_cluster, entities, questions, internal_links, sources, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      data.topic,
      data.intent ?? 'informational',
      data.primaryKeyword,
      data.keywordCluster ?? [],
      data.entities ?? [],
      data.questions ?? [],
      data.internalLinks ?? [],
      data.sources ?? [],
      userId,
    ],
  );
  return toBrief(row!);
}

export async function listBriefs(): Promise<Brief[]> {
  const rows = await query('SELECT * FROM content_briefs ORDER BY created_at DESC');
  return rows.map(toBrief);
}

export async function getBrief(id: number): Promise<Brief | null> {
  const row = await queryOne('SELECT * FROM content_briefs WHERE id = $1', [id]);
  return row ? toBrief(row) : null;
}

export async function setBriefStatus(id: number, status: string): Promise<void> {
  await query('UPDATE content_briefs SET status = $1 WHERE id = $2', [status, id]);
}
