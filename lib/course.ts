import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { Week, WeekIndex } from './types';

let loaded: Week[] | undefined;
export function getWeeks(): Week[] {
  if (!loaded || process.env.NODE_ENV === 'development') {
    loaded = ['weeks-01-04.json', 'weeks-05-08.json', 'weeks-09-11.json', 'week-12.json']
      .flatMap(file => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', file), 'utf8')) as Week[])
      .sort((a, b) => a.id - b.id);
  }
  return loaded;
}
export function getWeek(id: number) { return getWeeks().find(week => week.id === id); }
export function getWeekIndex(): WeekIndex[] {
  return getWeeks().map(week => ({ id: week.id, title: week.title, questions: week.quiz.length, sectionIds: week.sections.map(section => section.id) }));
}
