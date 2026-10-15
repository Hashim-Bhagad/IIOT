'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Progress, Question, Section, Week, WeekIndex } from '@/lib/types';
import Diagram from './Diagram';
import { Icon } from './Icon';

const STORAGE = 'iiot-study-progress-v1';
const EMPTY: Progress = { answers: {}, understood: {}, flagged: {} };
type Mode = 'learn' | 'practice' | 'review';

function readProgress(): Progress {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    if (!data || typeof data !== 'object') return EMPTY;
    return {
      answers: Object.fromEntries(Object.entries(data.answers || {}).filter(([, value]) => {
        const item = value as { selected?: unknown; correct?: unknown };
        return item && typeof item === 'object' && Number.isInteger(item.selected) && Number(item.selected) >= 0 && Number(item.selected) < 5 && typeof item.correct === 'boolean';
      })),
      understood: Object.fromEntries(Object.entries(data.understood || {}).filter(([, value]) => value === true)),
      flagged: Object.fromEntries(Object.entries(data.flagged || {}).filter(([, value]) => value === true)),
    } as Progress;
  } catch { return EMPTY; }
}

function Lesson({ section, understood, onToggle, hideDiagram = false }: { section: Section; understood: boolean; onToggle: () => void; hideDiagram?: boolean }) {
  return <section className="lesson" id={section.id} aria-labelledby={`${section.id}-heading`}>
    <div className="lesson-heading"><h2 id={`${section.id}-heading`}>{section.title}</h2><label className="understood"><input type="checkbox" checked={understood} onChange={onToggle}/><span>Understood</span></label></div>
    <p className="lesson-intro">{section.intro}</p>
    {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    {section.terms.length > 0 && <dl className="definitions">{section.terms.map((term, i) => <div key={i}><dt>{term.term}</dt><dd>{term.meaning}</dd></div>)}</dl>}
    {section.diagram && !hideDiagram && <Diagram id={section.id} data={section.diagram}/>}
    {section.comparison && <div className="table-scroll"><table><caption>{section.title}: compare the differences</caption><thead><tr>{section.comparison.headers.map((header, i) => <th key={i} scope="col">{header}</th>)}</tr></thead><tbody>{section.comparison.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
    <div className="key-points"><h3>Keep these clear</h3><ul>{section.keyPoints.map((point, i) => <li key={i}>{point}</li>)}</ul></div>
    {section.example && <div className="worked-example"><h3>{section.example.title}</h3><ol>{section.example.steps.map((step, i) => <li key={i}>{step}</li>)}</ol></div>}
    {section.traps.length > 0 && <details className="exam-traps"><summary>Exam traps &amp; course-specific details <span>{section.traps.length}</span></summary><ul>{section.traps.map((trap, i) => <li key={i}>{trap}</li>)}</ul></details>}
  </section>;
}

export default function StudyWorkspace({ week, index, extraQuestions }: { week: Week; index: WeekIndex[]; extraQuestions: number }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('learn');
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => { setProgress(readProgress()); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE, JSON.stringify(progress)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [progress, ready]);
  const answered = week.quiz.filter(q => progress.answers[q.id]).length;
  const correct = week.quiz.filter(q => progress.answers[q.id]?.correct).length;
  const lessonsRead = week.sections.filter(s => progress.understood[s.id]).length;
  const totalAnswered = index.reduce((sum, item) => sum + Object.keys(progress.answers).filter(id => id.startsWith(`w${item.id}-`)).length, 0);
  const totalQuestions = index.reduce((sum, item) => sum + item.questions, 0);
  const nextWeek = index.find(item => item.id > week.id);
  const overview = week.sections.find(section => section.diagram);
  const question = week.quiz[active];
  const result = retrying ? undefined : progress.answers[question.id];
  const selected = result ? result.selected : draft;
  const reviewQuestions = week.quiz.filter(q => progress.flagged[q.id] || (progress.answers[q.id] && !progress.answers[q.id].correct));

  function goQuestion(position: number) {
    setActive(position); setDraft(null); setRetrying(false); setMode('practice');
  }
  function readLesson(sectionId: string) {
    setMode('learn');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }));
  }
  function checkAnswer() {
    if (draft === null) return;
    setProgress(previous => ({ ...previous, answers: { ...previous.answers, [question.id]: { selected: draft, correct: draft === question.correctIndex } } }));
    setRetrying(false);
  }
  function flag(q: Question) {
    setProgress(previous => ({ ...previous, flagged: { ...previous.flagged, [q.id]: !previous.flagged[q.id] } }));
  }

  return <div className="study-app">
    <a className="skip-link" href="#study-main">Skip to study material</a>
    <aside className="course-rail" aria-label="Course navigation">
      <Link className="brand" href="/week/1"><span className="brand-mark"><Icon name="book" size={24}/></span><span>IIoT<br/><small>Study Studio</small></span></Link>
      <p className="course-name">Industry 4.0 &amp;<br/>Industrial Internet of Things</p>
      <div className="course-progress"><span>Assignment progress</span><strong>{totalAnswered} / {totalQuestions}</strong><div className="progress-track" role="progressbar" aria-label="Assignments answered" aria-valuenow={totalAnswered} aria-valuemin={0} aria-valuemax={totalQuestions}><span style={{width:`${totalAnswered / totalQuestions * 100}%`}}/></div></div>
      <nav className="week-nav">{index.map(item => {
        const count = Object.keys(progress.answers).filter(id => id.startsWith(`w${item.id}-`)).length;
        return <Link key={item.id} href={`/week/${item.id}`} aria-current={week.id === item.id ? 'page' : undefined}><span className="week-number">{String(item.id).padStart(2, '0')}</span><span className="week-link-title">{item.title}</span><span className="week-count" aria-label={`${count} of ${item.questions} answered`}>{count === item.questions ? <Icon name="check" size={16}/> : `${count}/${item.questions}`}</span></Link>;
      })}</nav>
      <div className="rail-footer"><span>{index.length} weeks. One connected system.</span><small>Your progress stays in this browser.</small></div>
    </aside>

    <div className="study-body">
      <header className="workspace-bar"><span>Industry 4.0 &amp; IIoT</span><label className="mobile-week">Week<select value={week.id} onChange={event => router.push(`/week/${event.target.value}`)} aria-label="Choose a course week">{index.map(item => <option key={item.id} value={item.id}>{item.id}. {item.title}</option>)}</select></label><span className="workspace-status">Week {week.id} of {index.length} <span className="status-dot"/> {lessonsRead}/{week.sections.length} topics understood</span></header>
      <main id="study-main">
        <div className="week-header"><h1>{week.title}</h1><div className="week-meta">Week {week.id} <span>·</span> {week.sections.length} topics <span>·</span> {week.quiz.length} exercises</div><p>{week.summary}</p></div>
        <div className="pyq-entry"><span>More practice beyond the weekly assignments.</span><Link className="text-button" href="/pyqs">{extraQuestions} extra PYQs <Icon name="arrow" size={16}/></Link></div>
        <div className="study-tabs" role="tablist" aria-label="Study mode">{(['learn','practice','review'] as Mode[]).map(tab => <button key={tab} id={`tab-${tab}`} role="tab" type="button" aria-selected={mode === tab} aria-controls="study-panel" tabIndex={mode === tab ? 0 : -1} onKeyDown={event => { const tabs: Mode[] = ['learn','practice','review']; const position = tabs.indexOf(tab); const target = event.key === 'ArrowRight' ? tabs[(position + 1) % 3] : event.key === 'ArrowLeft' ? tabs[(position + 2) % 3] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[2] : undefined; if (target) { event.preventDefault(); setMode(target); document.getElementById(`tab-${target}`)?.focus(); } }} onClick={() => setMode(tab)}>{tab === 'learn' ? <Icon name="book" size={18}/> : tab === 'review' ? <Icon name="bookmark" size={18}/> : <Icon name="check" size={18}/>}<span>{tab === 'learn' ? 'Learn' : tab === 'practice' ? 'Practice' : 'Review'}</span>{tab === 'practice' && <small>{answered}/15</small>}{tab === 'review' && reviewQuestions.length > 0 && <small>{reviewQuestions.length}</small>}</button>)}</div>
        {storageError && <p className="storage-error" role="status">This browser couldn’t save your progress. You can keep studying, but answers may not be remembered after closing the page.</p>}
        <div id="study-panel" role="tabpanel" aria-labelledby={`tab-${mode}`}>
          {mode === 'learn' && <div className="learn-panel">
            <div className="week-map">{overview?.diagram && <Diagram id={`week-${week.id}-overview`} data={overview.diagram}/>}<details className="learning-outcomes"><summary>What you’ll understand in this week</summary><ul>{week.objectives.map((objective, i) => <li key={i}>{objective}</li>)}</ul></details><div className="topic-index" aria-label="Jump to a topic">{week.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</div></div>
            {week.sections.map(section => <Lesson key={section.id} section={section} hideDiagram={section.id === overview?.id} understood={!!progress.understood[section.id]} onToggle={() => setProgress(previous => ({ ...previous, understood: { ...previous.understood, [section.id]: !previous.understood[section.id] } }))}/>)}
            <div className="lesson-finish"><div><h2>Put this week into practice.</h2><p>Answer the assignments, then return to any concept that needs another look.</p></div><button className="button primary" onClick={() => { setMode('practice'); window.scrollTo({top:0,behavior:'auto'}); }}>Start the 15 exercises <Icon name="arrow"/></button></div>
          </div>}

          {mode === 'practice' && <div className="practice-panel">
            <p className="practice-note">Assignment prompts and keys come from your notes. Answer alternatives are created for practice.</p>
            <div className="question-nav" aria-label="Assignment questions">{week.quiz.map((q, i) => <button key={q.id} type="button" className={`${active === i ? 'current' : ''} ${progress.answers[q.id] ? progress.answers[q.id].correct ? 'answered-correct' : 'answered-wrong' : ''}`} aria-pressed={active === i} aria-label={`Question ${i + 1}${progress.answers[q.id] ? progress.answers[q.id].correct ? ', correct' : ', needs review' : ', unanswered'}`} onClick={() => goQuestion(i)}>{i + 1}{progress.flagged[q.id] && <span className="question-flag"/>}</button>)}</div>
            <div className="question-title-row"><span>Question {active + 1} of 15</span><button className={`text-button ${progress.flagged[question.id] ? 'flagged' : ''}`} type="button" aria-pressed={!!progress.flagged[question.id]} onClick={() => flag(question)}><Icon name="bookmark" size={16}/>{progress.flagged[question.id] ? 'Saved for review' : 'Save for review'}</button></div>
            <h2 className="question-title">{question.question}</h2>
            <fieldset className="answer-options"><legend className="sr-only">Choose one answer</legend>{question.options.map((option, i) => <label key={i} className={`answer-option ${selected === i ? 'selected' : ''} ${result && i === question.correctIndex ? 'correct-option' : ''} ${result && selected === i && !result.correct ? 'wrong-option' : ''}`}><input type="radio" name={question.id} value={i} checked={selected === i} disabled={!!result} onChange={() => setDraft(i)}/><span>{option}</span>{result && i === question.correctIndex && <Icon name="check" size={20}/>}</label>)}</fieldset>
            <div className="question-actions">{!result ? <button className="button primary" disabled={draft === null} onClick={checkAnswer}>Check answer <Icon name="arrow" size={18}/></button> : <button className="button" onClick={() => {setDraft(null);setRetrying(true);}}>Try this question again</button>}<button className="text-button" onClick={() => readLesson(question.sectionId)}>Read the relevant note <Icon name="arrow" size={16}/></button></div>
            {result && <div className={`answer-feedback ${result.correct ? 'is-correct' : 'needs-review'}`} role="status"><h3><Icon name={result.correct ? 'check' : 'close'}/>{result.correct ? 'Correct. Here’s why.' : 'Keep this distinction clear.'}</h3><p><strong>Answer:</strong> {question.options[question.correctIndex]}</p><p>{question.explanation}</p>{question.sourceNote && <p className="source-note"><strong>Course context:</strong> {question.sourceNote}</p>}</div>}
            <div className="practice-footer"><button className="button" disabled={active === 0} onClick={() => goQuestion(active - 1)}>Previous question</button><span>{correct} correct <span>·</span> {answered} answered</span><button className="button" disabled={active === 14} onClick={() => goQuestion(active + 1)}>Next question <Icon name="arrow" size={16}/></button></div>
            {answered === 15 && <div className="practice-complete"><h3>All 15 questions attempted.</h3><p>{correct} correct. {15 - correct} need another look.</p><button className="button primary" onClick={() => setMode('review')}>Review this week</button></div>}
          </div>}

          {mode === 'review' && <div className="review-panel"><div className="review-summary"><h2>Your revision desk</h2><p>{answered} of 15 answered · {correct} correct · {lessonsRead} of {week.sections.length} topics understood</p></div><h3>The ideas to recall</h3><ol className="revision-list">{week.revision.map((fact, i) => <li key={i}>{fact}</li>)}</ol><h3>Saved &amp; missed questions</h3>{reviewQuestions.length ? <div className="review-questions">{reviewQuestions.map(q => <div key={q.id}><span>{progress.flagged[q.id] ? 'Saved' : 'Missed'}</span><p>{q.question}</p><button className="text-button" onClick={() => {goQuestion(week.quiz.indexOf(q));setDraft(null);setRetrying(true);}}>Practise again <Icon name="arrow" size={16}/></button></div>)}</div> : <p className="empty-review">No saved or missed questions yet. Practise the assignments, or save a question to revisit it here.</p>}<div className="next-week">{nextWeek && <Link className="button primary" href={`/week/${nextWeek.id}`}>Continue to Week {nextWeek.id} <Icon name="arrow"/></Link>}</div></div>}
        </div>
        <footer className="content-footer"><span>Based on your Week {week.id} course notes.</span><span>Study progress is stored locally. No account required.</span></footer>
      </main>
    </div>
  </div>;
}
