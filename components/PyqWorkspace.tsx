'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';
import * as m from 'motion/react-m';
import type { DiagramData, PyqBank, PyqQuestion } from '@/lib/types';
import Diagram from './Diagram';
import { Icon } from './Icon';
import checkAnimation from './animations/study-check.json';

const Lottie = dynamic(() => import('lottie-react').then(module => module.LottieLight), { ssr: false });
const STORAGE = 'iiot-pyq-progress-v1';
type Progress = { answers: Record<string, { selected: number | null; correct: boolean | null }>; flagged: Record<string, boolean> };
type Lesson = { id: string; title: string; diagram: DiagramData | null };
const EMPTY: Progress = { answers: {}, flagged: {} };

function loadProgress(questions: PyqQuestion[]): Progress {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    if (!stored || typeof stored !== 'object') return EMPTY;
    const answers: Progress['answers'] = {};
    const flagged: Progress['flagged'] = {};
    for (const q of questions) {
      const selected = stored.answers?.[q.id]?.selected;
      if (q.correctIndex === null && stored.answers?.[q.id]) answers[q.id] = { selected: null, correct: null };
      else if (Number.isInteger(selected) && selected >= 0 && selected < q.options.length) {
        answers[q.id] = { selected, correct: selected === q.correctIndex };
      }
      if (stored.flagged?.[q.id] === true) flagged[q.id] = true;
    }
    return { answers, flagged };
  } catch { return EMPTY; }
}

export default function PyqWorkspace({ bank, lessons }: { bank: PyqBank; lessons: Lesson[] }) {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [week, setWeek] = useState(0);
  const [year, setYear] = useState(0);
  const [mode, setMode] = useState<'practice' | 'review'>('practice');
  const [activeId, setActiveId] = useState<string | undefined>(bank.questions[0]?.id);
  const [draft, setDraft] = useState<number | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => { setProgress(loadProgress(bank.questions)); setReady(true); }, [bank.questions]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE, JSON.stringify(progress)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [progress, ready]);

  const questions = bank.questions.filter(q => (!week || q.weekId === week) && (!year || q.sources.some(s => s.year === year)));
  const active = Math.max(0, questions.findIndex(q => q.id === activeId));
  const question = questions[active];
  const result = question && retrying !== question.id ? progress.answers[question.id] : undefined;
  const selected = result ? result.selected : draft;
  const lesson = question ? lessons.find(l => l.id === question.sectionId) : undefined;
  const reviewed = bank.questions.filter(q => progress.answers[q.id]).length;
  const answered = questions.filter(q => progress.answers[q.id]).length;
  const correct = questions.filter(q => progress.answers[q.id]?.correct === true).length;
  const missed = questions.filter(q => progress.flagged[q.id] || progress.answers[q.id]?.correct === false);
  const navStart = Math.floor(active / 20) * 20;

  function goTo(q: PyqQuestion) {
    setActiveId(q.id); setDraft(null); setRetrying(null); setMode('practice');
  }
  function filter(nextWeek: number, nextYear: number) {
    setWeek(nextWeek); setYear(nextYear); setDraft(null); setRetrying(null);
    const first = bank.questions.find(q => (!nextWeek || q.weekId === nextWeek) && (!nextYear || q.sources.some(s => s.year === nextYear)));
    setActiveId(first?.id);
  }
  function check() {
    if (!question || (question.correctIndex !== null && draft === null)) return;
    setProgress(old => ({ ...old, answers: { ...old.answers, [question.id]: {
      selected: question.correctIndex === null ? null : draft,
      correct: question.correctIndex === null ? null : draft === question.correctIndex,
    } } }));
    setRetrying(null);
  }

  return <LazyMotion features={domAnimation} strict><MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
    <div className="study-app pyq-app">
      <a className="skip-link" href="#study-main">Skip to PYQ practice</a>
      <aside className="course-rail" aria-label="PYQ topics">
        <Link className="brand" href="/week/1"><span className="brand-mark"><Icon name="book" size={24}/></span><span>IIoT<br/><small>Study Studio</small></span></Link>
        <p className="course-name">Extra PYQs<br/>Beyond the weekly assignments</p>
        <div className="course-progress"><span>Extra questions reviewed</span><strong>{reviewed} / {bank.questions.length}</strong><div className="progress-track" role="progressbar" aria-label="Extra PYQs reviewed" aria-valuenow={reviewed} aria-valuemin={0} aria-valuemax={bank.questions.length}><span style={{ width: `${reviewed / bank.questions.length * 100}%` }}/></div></div>
        <nav className="pyq-week-nav">
          <button type="button" aria-pressed={week === 0} onClick={() => filter(0, year)}>All weeks <span>{bank.questions.length}</span></button>
          {Array.from({length: 12}, (_, i) => i + 1).map(id => <button key={id} type="button" aria-pressed={week === id} onClick={() => filter(id, year)}>Week {String(id).padStart(2, '0')} <span>{bank.questions.filter(q => q.weekId === id).length}</span></button>)}
        </nav>
        <Link className="text-button" href="/week/1"><Icon name="book" size={16}/>Return to weekly notes</Link>
        <div className="rail-footer"><span>One question per tested distinction.</span><small>Repeated paper appearances share progress.</small></div>
      </aside>
      <div className="study-body">
        <header className="workspace-bar"><span>Industry 4.0 &amp; IIoT</span><Link className="text-button" href="/week/1">Weekly notes <Icon name="arrow" size={16}/></Link></header>
        <main id="study-main">
          <div className="week-header"><div className="week-label">2023 + 2024 · Assignment solution papers</div><h1>Extra PYQs</h1><p>Questions that add a tested fact beyond your 180 weekly exercises. Repeated PYQ appearances share one question and one result.</p></div>
          <dl className="pyq-coverage" aria-label="PYQ coverage"><div><dt>Source questions checked</dt><dd>{bank.summary.sourceQuestions}</dd></div><div><dt>Covered by weekly exercises</dt><dd>{bank.summary.coveredOccurrences}</dd></div><div><dt>Repeated appearances merged</dt><dd>{bank.summary.duplicateOccurrences}</dd></div><div><dt>Additional questions</dt><dd>{bank.summary.addedQuestions}</dd></div></dl>
          <details className="pyq-method"><summary>What counts as a new question?</summary><p>Questions are compared by the fact or distinction they test, including the answer choices. A new number, example, role or application stays; a paraphrase testing the same fact is combined. Each question keeps its PDF references. The extra set includes {bank.summary.reviewOnlyQuestions} ambiguous source-key question for review without scoring.</p><a href="/pyqs/coverage.json" download>Download the match record for all {bank.summary.sourceQuestions} source questions</a></details>
          <div className="pyq-filters">
            <label className="pyq-mobile-filter">Related week<select aria-label="Filter PYQs by week" value={week} onChange={e => filter(Number(e.target.value), year)}><option value={0}>All weeks</option>{Array.from({length:12},(_,i)=>i+1).map(id=><option key={id} value={id}>Week {id}</option>)}</select></label>
            <label>Paper year<select value={year} aria-label="Filter PYQs by year" onChange={e => filter(week, Number(e.target.value))}><option value={0}>Both years</option><option value={2023}>2023</option><option value={2024}>2024</option></select></label>
            <span role="status">{questions.length} questions · {answered} reviewed · {correct} correct</span>
          </div>
          <div className="study-tabs" role="tablist" aria-label="PYQ study mode">{(['practice','review'] as const).map(tab => <button key={tab} id={`pyq-${tab}`} type="button" role="tab" aria-selected={mode === tab} aria-controls="pyq-panel" tabIndex={mode === tab ? 0 : -1} onClick={() => setMode(tab)} onKeyDown={event => {
            if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
              event.preventDefault(); const target = event.key === 'Home' ? 'practice' : event.key === 'End' ? 'review' : tab === 'practice' ? 'review' : 'practice'; setMode(target); document.getElementById(`pyq-${target}`)?.focus();
            }
          }}>{tab === 'practice' ? <Icon name="check" size={18}/> : <Icon name="bookmark" size={18}/>}<span>{tab === 'practice' ? 'Practice extras' : 'Saved & missed'}</span>{tab === 'review' && <small>{missed.length}</small>}</button>)}</div>
          {!ready && <p role="status" className="practice-note">Loading your saved progress…</p>}
          {storageError && <p className="storage-error" role="status">Your browser couldn’t save progress. You can practise, but new results may not be remembered after closing the page.</p>}
          <div id="pyq-panel" role="tabpanel" aria-labelledby={`pyq-${mode}`}>
            {mode === 'practice' && question && <div className="practice-panel">
              <div className="pyq-jump"><label>Jump to a question<select aria-label="Jump to PYQ" value={question.id} onChange={e => { const q = questions.find(q => q.id === e.target.value); if (q) goTo(q); }}>{questions.map((q,i)=><option key={q.id} value={q.id}>{i+1}. {q.question.slice(0,95)}</option>)}</select></label></div>
              <nav className="question-nav" aria-label="Extra questions"><button type="button" aria-label="Previous 20 questions" disabled={navStart === 0} onClick={() => goTo(questions[Math.max(0, navStart - 20)])}>‹</button>{questions.slice(navStart, navStart+20).map((q,i) => <button key={q.id} type="button" className={`${question.id === q.id ? 'current' : ''} ${progress.answers[q.id] ? progress.answers[q.id].correct === null ? 'answered-neutral' : progress.answers[q.id].correct ? 'answered-correct' : 'answered-wrong' : ''}`} aria-pressed={question.id === q.id} aria-label={`Extra question ${navStart+i+1}${progress.answers[q.id] ? progress.answers[q.id].correct === null ? ', reviewed' : progress.answers[q.id].correct ? ', correct' : ', needs review' : ', unanswered'}`} onClick={() => goTo(q)}>{navStart+i+1}{progress.flagged[q.id] && <span className="question-flag"/>}</button>)}<button type="button" aria-label="Next 20 questions" disabled={navStart+20 >= questions.length} onClick={() => goTo(questions[navStart+20])}>›</button></nav>
              <div className="question-title-row"><span>Extra question {active+1} of {questions.length} · Week {question.weekId}</span><button type="button" className={`text-button ${progress.flagged[question.id] ? 'flagged' : ''}`} aria-pressed={!!progress.flagged[question.id]} onClick={() => setProgress(old => ({ ...old, flagged: { ...old.flagged, [question.id]: !old.flagged[question.id] } }))}><Icon name="bookmark" size={16}/>{progress.flagged[question.id] ? 'Saved for review' : 'Save for review'}</button></div>
              <m.div key={question.id} initial={reduce ? false : {opacity:0}} animate={{opacity:1}} transition={{duration:reduce ? 0 : .16}}>
                <p className="pyq-origin">{question.sources.map(s=>`${s.year} · Assignment ${s.assignment} · Q${s.number}`).join('  /  ')}</p>
                <h2 className="question-title">{question.question}</h2>
                {question.correctIndex === null && <p className="pyq-key-warning">Review only: the PDF has duplicate option labels, so its answer key is ambiguous.</p>}
                <fieldset className="answer-options" disabled={!ready || !!result || question.correctIndex === null}><legend className="sr-only">Choose one answer</legend>{question.options.map((option,i)=><label key={i} className={`answer-option ${selected === i ? 'selected' : ''} ${result && i === question.correctIndex ? 'correct-option' : ''} ${result?.correct === false && selected === i ? 'wrong-option' : ''}`}><input type="radio" name={question.id} value={i} checked={selected === i} onChange={()=>setDraft(i)}/><span>{option}</span>{result && i === question.correctIndex && <Icon name="check"/>}</label>)}</fieldset>
                <div className="question-actions">{!result ? <button className="button primary" disabled={!ready || (question.correctIndex !== null && draft === null)} onClick={check}>{question.correctIndex === null ? 'Read explanation & mark reviewed' : 'Check answer'} <Icon name="arrow" size={18}/></button> : question.correctIndex !== null && <button className="button" onClick={()=>{setDraft(null);setRetrying(question.id);}}>Try this question again</button>}<Link className="text-button" href={`/week/${question.weekId}#${question.sectionId}`}>Read the related note <Icon name="arrow" size={16}/></Link></div>
                {result && <m.section initial={reduce ? false : {opacity:0}} animate={{opacity:1}} transition={{duration:reduce ? 0 : .2}} className={`answer-feedback ${result.correct === null ? 'source-ambiguous' : result.correct ? 'is-correct' : 'needs-review'}`} aria-label="Answer explanation">
                  <div role="status"><h3>{result.correct === true && !reduce ? <span className="answer-lottie" aria-hidden="true"><Lottie src={checkAnimation} autoplay loop={false} style={{width:28,height:28}}/></span> : <Icon name={result.correct === false ? 'close' : result.correct === null ? 'book' : 'check'}/>} {result.correct === null ? 'Source key needs interpretation.' : result.correct ? 'Correct. Here’s why.' : 'Keep this distinction clear.'}</h3>{question.correctIndex !== null && <p><strong>Answer:</strong> {question.options[question.correctIndex]}</p>}<p>{question.explanation}</p>{question.sourceNote && <p className="source-note"><strong>Source context:</strong> {question.sourceNote}</p>}</div>
                  {lesson?.diagram && <details className="pyq-visual"><summary>See the concept visually</summary><Diagram id={`pyq-${question.id}`} data={lesson.diagram}/></details>}
                </m.section>}
              </m.div>
              <details className="pyq-sources"><summary>Original paper &amp; course references ({question.sources.length})</summary>{question.sources.map(s=><div key={`${s.year}-${s.assignment}-${s.number}`}><a href={`/pyqs/${s.year}/${encodeURIComponent(s.file)}`} target="_blank" rel="noreferrer">{s.year} · Assignment {s.assignment} · Question {s.number} <span className="sr-only">(opens PDF in a new tab)</span></a><p>{s.reference}</p></div>)}</details>
              <div className="practice-footer"><button className="button" disabled={active === 0} onClick={()=>goTo(questions[active-1])}>Previous question</button><span>{answered} of {questions.length} reviewed</span><button className="button" disabled={active === questions.length-1} onClick={()=>goTo(questions[active+1])}>Next question <Icon name="arrow" size={16}/></button></div>
              {answered === questions.length && <p className="practice-complete" role="status">You’ve reviewed every question in this selection. {correct} correct; use Saved &amp; missed to revisit the rest.</p>}
            </div>}
            {mode === 'practice' && !question && <p className="empty-review">No extra questions match this selection. Choose another week or both years.</p>}
            {mode === 'review' && <div className="review-panel"><div className="review-summary"><h2>Your extra revision</h2><p>Saved and missed questions in the current week/year selection.</p></div>{missed.length ? <div className="review-questions">{missed.map(q=><div key={q.id}><span>Week {q.weekId} · {progress.flagged[q.id] ? 'Saved' : 'Missed'}</span><p>{q.question}</p><button type="button" className="text-button" onClick={()=>{goTo(q);setRetrying(q.id);}}>Practise again <Icon name="arrow" size={16}/></button></div>)}</div> : <p className="empty-review">No saved or missed questions in this selection yet. Check an answer or save a question to revisit it here.</p>}</div>}
          </div>
          <footer className="content-footer"><span>From your 2023 and 2024 assignment solution PDFs. Explanations are authored study guidance.</span><span>Progress stays in this browser.</span></footer>
        </main>
      </div>
    </div>
  </MotionConfig></LazyMotion>;
}
