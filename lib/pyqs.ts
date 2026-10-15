import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { DiagramData, PyqBank } from './types';

export function getPyqs(): PyqBank {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/pyqs/questions.json'), 'utf8')) as PyqBank;
}

export function getPyqDiagrams(): Record<string, DiagramData> {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/pyqs/diagrams.json'), 'utf8')) as Record<string, DiagramData>;
}
