import type { Metadata } from 'next';
import PyqWorkspace from '@/components/PyqWorkspace';
import { getWeeks } from '@/lib/course';
import { getPyqs, getPyqDiagrams } from '@/lib/pyqs';

export const metadata: Metadata = { title: 'Extra PYQs · Questions beyond the weekly assignments' };

export default function PyqsPage() {
  const customDiagrams = getPyqDiagrams();
  const lessons = getWeeks().flatMap(week => week.sections.map(section => ({
    id: section.id,
    title: section.title,
    diagram: customDiagrams[section.id] ?? section.quick?.diagram ?? section.diagram ?? null,
  })));
  return <PyqWorkspace bank={getPyqs()} lessons={lessons} />;
}
