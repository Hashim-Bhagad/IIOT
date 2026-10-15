import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWeek, getWeekIndex, getWeeks } from '@/lib/course';
import { getPyqs } from '@/lib/pyqs';
import StudyWorkspace from '@/components/StudyWorkspace';

export function generateStaticParams() { return getWeeks().map(week => ({ id: String(week.id) })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const week = getWeek(Number(id));
  return { title: week ? `Week ${id}: ${week.title}` : 'Week not found' };
}
export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const week = /^\d+$/.test(id) ? getWeek(Number(id)) : undefined;
  if (!week) notFound();
  return <StudyWorkspace key={week.id} week={week} index={getWeekIndex()} extraQuestions={getPyqs().summary.addedQuestions} />;
}
