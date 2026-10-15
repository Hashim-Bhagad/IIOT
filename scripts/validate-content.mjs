import fs from 'node:fs';
import assert from 'node:assert/strict';

const files = ['weeks-01-04.json', 'weeks-05-08.json', 'weeks-09-11.json', 'week-12.json'];
const weeks = files.flatMap(file => JSON.parse(fs.readFileSync(new URL('../content/' + file, import.meta.url), 'utf8'))).sort((a,b) => a.id-b.id);
const ids = new Set();
let diagrams=0, quickDiagrams=0, sections=0;
const words = text => text.trim().split(/\s+/).length;
function quickNotes(notes, label, pointBudget) {
  assert(notes && typeof notes.summary === 'string', `Missing quick notes: ${label}`);
  assert(words(notes.summary)<=18, `Summary word budget: ${label}`);
  assert(notes.points.length>=3 && notes.points.length<=5, `Pointer count: ${label}`);
  assert(notes.points.every(point=>typeof point==='string' && words(point)<=pointBudget), `Pointer word budget: ${label}`);
}
assert.equal(weeks.length,12);
for (const [i,week] of weeks.entries()) {
  assert.equal(week.id,i+1);
  assert.equal(week.quiz.length,15,`Week ${week.id} needs 15 questions`);
  assert(week.summary && week.objectives.length && week.revision.length);
  quickNotes(week.quick, `Week ${week.id}`, 16);
  assert(week.sections.length>=5);
  const sectionIds=new Set(week.sections.map(section=>section.id));
  assert.equal(sectionIds.size,week.sections.length);
  for (const section of week.sections) {
    sections++;
    assert(section.title && section.intro && section.paragraphs.length && section.keyPoints.length);
    assert(Array.isArray(section.terms) && Array.isArray(section.traps));
    quickNotes(section.quick, section.id, 18);
    assert(section.quick.diagram || section.diagram, `Missing visual: ${section.id}`);
    if(section.quick.diagram) {
      quickDiagrams++;
      const d=section.quick.diagram;
      assert(['flow','branch','layers','loop'].includes(d.type));
      assert(d.nodes.length>=2 && d.nodes.length<=6, `Quick diagram node budget: ${section.id}`);
      assert(d.title && d.caption && words(d.caption)<=30, `Quick diagram caption: ${section.id}`);
      assert(d.nodes.every(node=>node.label && node.detail && words(node.label)<=5 && words(node.detail)<=18), `Quick diagram text budget: ${section.id}`);
    }
    if(section.diagram){
      diagrams++;
      assert(['flow','branch','layers','loop'].includes(section.diagram.type));
      assert(section.diagram.nodes.length>=2 && section.diagram.nodes.length<=9,`Diagram budget: ${section.id}`);
      assert(section.diagram.nodes.every(node=>node.label && node.detail));
    }
    if(section.comparison)assert(section.comparison.rows.every(row=>row.length===section.comparison.headers.length),`Table columns: ${section.id}`);
  }
  for (const question of week.quiz) {
    assert(!ids.has(question.id));ids.add(question.id);
    assert(question.question && question.explanation);
    assert(question.brief?.length>=1 && question.brief.length<=2 && question.brief.every(point=>typeof point==='string' && words(point)<=20), `Answer pointer budget: ${question.id}`);
    assert(sectionIds.has(question.sectionId),`Missing lesson for ${question.id}`);
    assert(question.options.length>=2 && question.options.length<=5);
    assert(new Set(question.options).size===question.options.length,`Duplicate options: ${question.id}`);
    assert(Number.isInteger(question.correctIndex) && question.correctIndex>=0 && question.correctIndex<question.options.length);
  }
}
console.log(`Content valid: ${weeks.length} concise week summaries, ${sections} visual lessons, ${diagrams} original + ${quickDiagrams} new diagrams, ${ids.size} short answer explanations; every question links to a lesson.`);
