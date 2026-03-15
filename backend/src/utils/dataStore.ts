import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

function ensureDir(firmId: string) {
  const dir = path.join(DATA_DIR, firmId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function readStore<T>(name: string, firmId = 'dev_firm'): T[] {
  const dir  = ensureDir(firmId);
  const file = path.join(dir, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

export function writeStore<T>(name: string, data: T[], firmId = 'dev_firm'): void {
  const dir  = ensureDir(firmId);
  const file = path.join(dir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

export function appendStore<T>(name: string, item: T, firmId = 'dev_firm'): T {
  const all = readStore<T>(name, firmId);
  all.push(item);
  writeStore(name, all, firmId);
  return item;
}
