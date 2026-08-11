import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Penyimpanan lead untuk MVP/demo: JSONL lokal.
 * PRD §10 menetapkan PostgreSQL + Prisma/Drizzle untuk produksi — modul ini
 * sengaja dibuat sebagai satu titik ganti (swap adapter) agar migrasi mudah.
 * Tidak ada credential di source code (PRD §19).
 */

export type LeadStatus = 'new' | 'contacted' | 'survey_scheduled' | 'quoted' | 'won' | 'lost';

export type LeadInput = {
  name: string;
  phone: string;
  city: string;
  buildingType: string;
  areaSqm: number | null;
  floorCondition: string;
  needType: string;
  message: string;
  source: string;
  photo: { name: string; size: number; type: string } | null;
  ip: string;
  userAgent: string;
};

export type Lead = LeadInput & {
  id: string;
  status: LeadStatus;
  createdAt: string;
};

const DATA_DIR = process.env.LEADS_DIR ?? path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'leads.jsonl');

export async function createLead(input: LeadInput): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(FILE, JSON.stringify(lead) + '\n', 'utf8');
  } catch (error) {
    // Kegagalan penyimpanan tidak boleh diam-diam — PRD §19
    console.error('[leads] gagal menyimpan lead', {
      id: lead.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Hook notifikasi (email/Telegram/WhatsApp) dipasang di sini pada produksi.
  console.info('[leads] lead baru', { id: lead.id, city: lead.city, source: lead.source });

  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Lead)
      .reverse();
  } catch {
    return [];
  }
}
