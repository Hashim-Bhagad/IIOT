# IIoT Study Studio

A Next.js study app built from the twelve supplied Industry 4.0 and IIoT weekly notes.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The first page opens Week 1. The course navigation covers Weeks 1–12.

For a production run:

```bash
npm run build
npm start
```

## Study workflow

- **Learn:** a short summary, 3–5 pointers and a visual for every topic. Use the topic picker to jump ahead; expand **More detail** for the original explanations, definitions, comparisons and worked examples. Mark topics understood as you study.
- **Practice:** 15 assignment questions per week. Check an answer to see 1–2 explanation pointers; expand **Full explanation** or **Source caveat** when needed. Save questions for revision or jump to the related lesson.
- **Review:** a concise recall sheet plus saved and missed questions. Retrying an exercise updates its result when a new answer is checked.

Progress is saved in this browser using local storage. There is no account or server-side database. A storage warning appears if saving is unavailable. The original Word source files are kept separately in the sibling `../course-docx/` folder. The app uses the prepared JSON content under `content/`, so those source files are not required to run it.

## Extra PYQs

Open `/pyqs`, or use the extra-PYQ link on any weekly page. Both years contain 360 source questions. Manual comparison leaves 279 additional questions, with 38 occurrences already covered by weekly exercises and 43 repeated appearances merged into retained questions. A new tested detail is retained even when the broader topic already appears in a lesson.

Filter by related week or source year, check an answer, read an authored explanation, expand a concept diagram, or save a question for review. Original options and source-paper answer keys are preserved. One source has duplicate option labels, so it is review-only and excluded from correctness scoring. Conflicts and imprecise source wording are flagged. Source PDFs are bundled locally in `public/pyqs/`; the downloadable coverage record accounts for all 360 occurrences.

PYQ progress is stored separately from the weekly assignments. Motion for React supplies short question/feedback fades; a local Lottie check traces once after a correct answer. Reduced-motion preferences remove those animations.

## Deploy

See [DEPLOY.md](DEPLOY.md). Vercel configuration, Node 24.x selection and a lockfile are checked in. Import the app repository and deploy with the Next.js defaults; if the entire workspace is imported, choose `code` as Root Directory. No environment variables are required.

## Content and limits

The app contains 98 learning sections, 98 diagram specifications (64 original and 34 new), five illustrated topic comparisons and 180 assignment questions. All 459 weekly/PYQ answers include brief explanations alongside the full originals. Content is stored under `content/`; schema types are in `lib/types.ts`.

The source documents give assignment prompts and keyed answers but omit most original option lists. Practice distractors are authored and labelled as such. Course-key-specific wording, inconsistent numbers and historical platform details are flagged in lessons and answer feedback. This is preparation from the supplied notes, not an official exam paper. No official exam blueprint was supplied. Week 12 flags the UAV-generation key/slide discrepancy and the two conveyor-case questions supplied outside its transcript.

## Validation

```bash
npm run validate:content
npm run validate:pyqs
npm run typecheck
npm run build
```

`validate:pyqs` accounts for every original question, checks source options/keys, duplicate/weekly matches, PDF files and lesson links.

`validate:content` checks complete week/question coverage, concise-note word budgets, a visual per topic, table shapes, diagram budgets, unique options/IDs and exercise-to-lesson links. Browser checks cover rendering, diagram bounds, expandable full explanations, answer feedback, local persistence, revision and navigation.
