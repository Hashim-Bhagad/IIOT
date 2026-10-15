import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = name => JSON.parse(fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8'));
const bank = read('content/pyqs/questions.json');
const coverage = read('content/pyqs/coverage.json');
const papers = read('content/pyqs/sources.json');
const weeks = ['weeks-01-04.json','weeks-05-08.json','weeks-09-11.json','week-12.json'].flatMap(f => read('content/' + f));
const weekly = new Map(weeks.flatMap(w => w.quiz.map(q => [q.id,q])));
const sections = new Map(weeks.flatMap(w => w.sections.map(s => [s.id,w.id])));
const questions = new Map(bank.questions.map(q => [q.id,q]));
const raw = new Map(papers.flatMap(p => p.items.map(q => [`${p.year}-${p.assignment}-${q.number}`,{...q,file:p.file}])));
const records = new Map(coverage.map(r => [r.sourceId,r]));
assert.equal(papers.length,24);
assert.equal(raw.size,360);
assert.equal(records.size,raw.size);
assert.equal(questions.size,bank.questions.length);
const occurrences = new Set();
for (const q of bank.questions) {
  assert.equal(sections.get(q.sectionId),q.weekId,`Related lesson: ${q.id}`);
  assert(q.explanation.length > 70,`Missing teaching explanation: ${q.id}`);
  assert(q.options.length===2 || q.options.length===4,`Options: ${q.id}`);
  assert(new Set(q.options).size===q.options.length,`Duplicate option text: ${q.id}`);
  assert(q.sources.length>0,`Missing PDF provenance: ${q.id}`);
  const canonical = raw.get(q.id.replace(/^pyq-/,''));
  assert(canonical,`Missing canonical source: ${q.id}`);
  assert.deepEqual(q.options,canonical.options.map(([,v])=>v),`Source choices changed: ${q.id}`);
  const label = canonical.answer.replace(/[().\s]/g,'').toLowerCase();
  const matches = canonical.options.flatMap(([key],i) => key===label ? [i] : []);
  assert.equal(q.correctIndex,matches.length===1 ? matches[0] : null,`Source key changed: ${q.id}`);
  if(q.correctIndex===null) assert(q.sourceNote.includes('ambiguous'),`Unflagged source ambiguity: ${q.id}`);
  for(const s of q.sources) {
    const id=`${s.year}-${s.assignment}-${s.number}`;
    assert(!occurrences.has(id),`Source counted twice: ${id}`);occurrences.add(id);
    assert(raw.has(id) && records.get(id)?.questionId===q.id,`Unaccounted source: ${id}`);
    assert.equal(s.answer,raw.get(id).answer);
    assert(fs.existsSync(new URL(`../public/pyqs/${s.year}/${s.file}`,import.meta.url)),`Missing PDF: ${s.file}`);
  }
}
for(const r of coverage) {
  assert(raw.has(r.sourceId),`Unknown source ${r.sourceId}`);
  assert(['covered','added','duplicate'].includes(r.decision));
  if(r.decision==='covered') {
    assert(!occurrences.has(r.sourceId));
    assert(r.weeklyQuestionIds.length && r.weeklyQuestionIds.every(id=>weekly.has(id)),`Invalid weekly match ${r.sourceId}`);
  } else assert(questions.has(r.questionId) && occurrences.has(r.sourceId));
}
assert.equal(bank.summary.sourceQuestions,raw.size);
assert.equal(bank.summary.weeklyQuestions,weekly.size);
assert.equal(bank.summary.addedQuestions,questions.size);
assert.equal(bank.summary.coveredOccurrences,coverage.filter(r=>r.decision==='covered').length);
assert.equal(bank.summary.duplicateOccurrences,coverage.filter(r=>r.decision==='duplicate').length);
assert.equal(bank.summary.reviewOnlyQuestions,bank.questions.filter(q=>q.correctIndex===null).length);
assert.equal(bank.summary.sourceQuestions,bank.summary.addedQuestions+bank.summary.coveredOccurrences+bank.summary.duplicateOccurrences);
assert.deepEqual(read('public/pyqs/coverage.json'),coverage);
for(const [id,d] of Object.entries(read('content/pyqs/diagrams.json'))) {
  assert(sections.has(id));
  assert(d.nodes.length>=2 && d.nodes.length<=6);
  assert(d.title && d.caption && d.nodes.every(n=>n.label && n.detail));
}
console.log(`PYQs valid: all ${raw.size} source occurrences accounted for; ${questions.size} extra questions, ${bank.summary.coveredOccurrences} covered, ${bank.summary.duplicateOccurrences} merged repeats, ${bank.summary.reviewOnlyQuestions} unscored ambiguous key. All PDF choices/keys, lesson links and sources verified.`);
