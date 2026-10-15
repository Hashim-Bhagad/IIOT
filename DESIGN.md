---
name: IIoT Study Studio
description: A technical field manual for learning Industry 4.0 and Industrial IoT.
colors:
  paper: "#f5f7f9"
  paper-2: "#e9eef2"
  surface: "#ffffff"
  ink: "#12202e"
  muted: "#526174"
  rule: "#dfe5ea"
  rule-solid: "#bec8d1"
  accent: "#b8430d"
  accent-tint: "#fff0e7"
  accent-hover: "#933307"
  link: "#244b78"
  success: "#24633d"
  success-tint: "#eef7f0"
  danger: "#a63327"
  danger-tint: "#fff1ee"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "44px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline-small:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  body-intro:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.7
  supporting:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  question: "4px"
  control: "6px"
  container: "8px"
spacing:
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
  "48": "48px"
  "64": "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-2}"
  week-link-current:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 8px"
  week-select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  answer-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "16px 20px"
  answer-option-selected:
    backgroundColor: "{colors.accent-tint}"
  answer-option-correct:
    backgroundColor: "{colors.success-tint}"
  answer-option-wrong:
    backgroundColor: "{colors.danger-tint}"
  answer-feedback:
    backgroundColor: "{colors.success-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "24px"
  answer-feedback-needs-review:
    backgroundColor: "{colors.danger-tint}"
  worked-example:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "20px 24px"
  diagram-node-primary:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
---

# Design System: IIoT Study Studio

## Overview

**Creative North Star: "The Technical Field Manual"**

The interface is an open reading workspace on cool paper. Deep blue ink, precise hairlines, compact controls and schematic figures make relationships and distinctions easy to inspect. Space Grotesk headings give the material a technical character; Inter supports sustained reading and operation.

Density follows the material: long lessons remain open, definitions and comparisons use aligned rows, and optional explanations use native disclosure controls. Burnt orange identifies actions and selection. Green and red describe answer outcomes. The established visual world excludes shadows, decorative gradients, simulated paper texture and decorative illustration assets.

**Key Characteristics:**

- Cool paper surfaces with deep blue ink and quiet separators.
- Self-hosted Space Grotesk headings and Inter reading/UI text.
- Compact rectangular controls with visible native input states.
- Flat surfaces whose boundaries come from tone and hairlines.
- Responsive, labelled schematic figures with equivalent prose.

## Colors

The palette is cool and restrained, with a warm action accent and separate semantic feedback colors. Frontmatter values are normative and correspond to the built stylesheet.

### Primary

- **Burnt orange** (`accent`): primary actions, selected tabs, selected answers, active week numbers, progress fill, saved-question marks and focus outlines. `accent-tint` carries selected-answer and first-node backgrounds; `accent-hover` darkens primary buttons on hover.

### Secondary

- **Technical blue** (`link`): reading links and text actions. It remains distinct from the action accent.

### Neutral

- **Cool paper** (`paper`): page background and ordinary diagram nodes.
- **Inset paper** (`paper-2`): course rail, worked examples, table headers, alternating layer nodes and secondary-button hover.
- **White surface** (`surface`): answer choices, current week links and the native week selector.
- **Deep blue ink** (`ink`): headings, body text, current-question outline and the brand mark.
- **Muted slate** (`muted`): explanations, captions, metadata, secondary labels and diagram connectors.
- **Fine rule** (`rule`): reading-section boundaries and quiet dividers.
- **Solid rule** (`rule-solid`): control outlines, table header rules and the study-mode baseline.

### Semantic status

- **Correct green** (`success`, `success-tint`): the correct answer, correct question numbers and positive feedback.
- **Review red** (`danger`, `danger-tint`): an incorrect selected answer, questions needing review and storage failure text.

**The Meaningful Color Rule.** Use accent color for action or selection and semantic green/red for answer outcomes. Pair outcome color with text, state labels or icons.

## Typography

**Display Font:** Space Grotesk, with sans-serif fallback. **Body Font:** Inter, with sans-serif fallback. Both are self-hosted through `@fontsource` imports in `app/layout.tsx`; the build imports Inter weights 400/500/600 and Space Grotesk weights 500/600. There is no distinct mono family.

The pairing is precise without making prose feel like a console. Headings use a compact line height and slightly tightened tracking; body text has a generous reading line height. Counters use tabular numerals.

### Hierarchy

- **Display:** the frontmatter display role serves week headings, constrained to 20ch. It steps to 38px at 900px and 32px at 560px.
- **Headline:** the headline role serves lesson headings, constrained to 30ch; it steps to 26px at 560px. Question headings use the same desktop size with a 34ch limit and step to 25px at 560px. The week-map heading uses the headline-small role and steps to 20px.
- **Title:** the title role serves lesson subheadings and diagram titles. Diagram labels use Inter semibold with renderer-specific metrics.
- **Body:** lessons use the body role and a maximum measure of 72ch; lesson paragraphs step to 14px at 560px. Intros use body-intro. The page base is 16px, stepping to 15px on narrow screens.
- **Label / supporting:** buttons use the label role. Captions and definitions use supporting text; course navigation, question counts and metadata commonly use 12px, while footer notes use 11px. Keep small sizes in supporting roles.

**The Reading Measure Rule.** Keep lesson prose and captions at the implemented reading measure; do not stretch them to fill a wide workspace.

## Layout

The desktop shell is a two-column grid with a sticky, independently scrolling course rail (272px wide, 100dvh tall) and a flexible study body. The rail has 32px top, 20px horizontal and 24px bottom padding. The reading workspace is centered with a maximum outer width of 1104px and 48px horizontal padding; its header is capped at 820px. Practice and review regions cap at 880px and 840px respectively.

The horizontal workspace bar has a minimum height of 72px. Study modes sit on a single hairline baseline. Lessons begin after 64px and end with 48px of padding and a divider. The spacing primitives record recurring built steps; component padding also includes the exact local values documented in the frontmatter.

- **At 1180px and below:** the rail narrows to 240px, main padding becomes 40px 32px 24px, and the workspace bar uses 32px horizontal padding. Practice footer counts move to a full-width row.
- **At 900px and below:** the rail disappears, the shell becomes a single block, and a full-width native mobile week selector appears in the workspace bar. The main region uses 36px 24px 20px padding; secondary workspace status is hidden.
- **At 560px and below:** main padding becomes 28px 20px 20px, the workspace bar uses 20px horizontal padding, lesson headings stack above the Understood control, and definition rows become a single column. Lesson spacing becomes 48px before / 36px after; answer actions stack and tab icons disappear.

Tables retain a minimum width of 480px inside horizontal scroll containers. Diagrams reflow their geometry to available inline width rather than depending on a fixed desktop image. Print removes navigation and operational controls, opens the reading width, and avoids splitting figures, tables and worked examples.

## Elevation & Depth

The system uses **no shadows**. Tone, thin borders, separators and open spacing establish grouping. The course rail is inset paper; answer choices and current navigation use white; examples use inset paper. State changes use border, fill and outline instead of lift or glow.

**The Flat Surface Rule.** Preserve flat surfaces and the existing hairline vocabulary. Do not add shadows, decorative gradients or simulated paper texture.

## Shapes

The form language is rectangular with restrained corners. Question-number controls use the question radius; buttons, week links and the native selector use the control radius; answer choices, feedback, examples, the brand mark and diagram nodes use the container radius. Separators and tables remain straight edged. Most outlines are 1px; selected tabs have a 2px lower rule and the current question has a 2px ink outline offset by 2px.

Icons are inline, unfilled SVGs with rounded line caps and joins and a 1.7px stroke. They accompany text rather than replace labels. Diagram connectors are distinct from UI icon strokes.

## Components

### Buttons

Compact and direct. Primary and secondary buttons share the control radius, frontmatter padding, a minimum height of 44px, 13px medium text and a 12px icon gap. Primary buttons use burnt orange with white text; secondary buttons are transparent with a solid-rule border. Their backgrounds transition over 150ms with `ease-out`. Disabled buttons retain native disabled semantics, opacity 0.48 and a default cursor. Text buttons use technical blue, a minimum height of 40px and an underline on hover; saved-question text uses the accent.

All focusable controls use a visible 2px accent outline offset by 4px. There is no hover translation or scale. Reduced-motion settings disable smooth scrolling and shorten transitions/animations to 0.01ms.

### Navigation

Week links are compact rows with two-digit week numbers, a short title and a progress count. Their minimum height is 48px; current-page state uses a white background, a quiet border and an accent number. Hover adds a cool tinted background. At the mobile breakpoint, replace the rail with the labelled native week select, preserving full option text.

Study modes use native buttons with tab semantics. The selected mode has ink text and an accent lower rule; unselected labels are muted and become ink on hover. Arrow keys, Home and End move between tabs. Question-number buttons are 40px wide with a minimum height of 40px; width becomes 36px on narrow screens. Correct and needs-review states have matching semantic fills, text and borders; the current number has an ink outline and saved questions have an accent corner mark.

### Inputs / Fields

Preserve native radio buttons, checkboxes and select controls. Radios and checkboxes are 16px and use the accent for native selection. The Understood checkbox sits beside a 12px muted label and a minimum 36px label height. Answer radios live inside labelled white rows with the container radius, a solid-rule border, a minimum height of 60px and frontmatter padding. Hover changes the row border to ink; selection uses accent border and tint. After checking, correct answers use green and an inline check icon; an incorrect selected answer uses red. Inputs become natively disabled after a result, and retry reopens selection.

### Cards / Containers

Use containers where they explain a local grouping. Worked examples use inset paper and the container radius; feedback uses the same radius with a semantic tinted background and a quiet matching border. Feedback headings add an icon and explicit result text, and the feedback region has status semantics. Desktop feedback padding is 24px, becoming 20px on narrow screens. Most reading content remains unboxed, separated by fine rules.

### Tables and disclosures

Tables align comparisons in rows: 13px text, 14px 12px cell padding, 1.55 line height, muted captions and inset-paper headers. Header and first-column scope are explicit. Optional objectives, diagram walkthroughs and exam traps use native `details`/`summary`; summary hover adopts the accent.

### Schematic figures

Figures describe relationships, never decoration. Use responsive inline SVG for flow/feedback, branch and layer layouts, an accessible title and description, a visible caption, and a prose walkthrough retaining every source node label and detail. The first node uses accent border/tint; ordinary nodes use cool paper and solid-rule borders; alternating layer nodes use inset paper.

Geometry follows the renderer: dimensions align to an 8px grid and ports/text positions snap to 4px. Nodes have the container radius, a minimum height of 80px and text measured after self-hosted fonts are ready. Below 520px available figure width, labels use 12px text with 16px line height; otherwise they use 16px with 20px line height. Flow rows become vertical when their labels and connectors cannot fit. Connectors are orthogonal with up to 8px rounded bends, 1.2px muted strokes and 8px arrow markers. Branches use unique root ports and separated routing lanes.

**The Source Label Rule.** Preserve source labels and details. Plan figures to stay within nine nodes, or six nodes for branch/layer layouts; split larger relationships editorially. The implemented renderer falls back to a complete text list when a diagram is outside those limits rather than shrinking or dropping content.

## Do's and Don'ts

### Do:

- **Do** use self-hosted Space Grotesk for headings and Inter for reading and controls.
- **Do** keep the 272px desktop rail and the native mobile week selector at the documented responsive thresholds.
- **Do** use semantic green/red with explicit outcome text or icons, while retaining orange for action and selection.
- **Do** preserve native radio, checkbox, select and disclosure behavior and visible keyboard focus.
- **Do** keep lesson prose at the implemented reading measure and let tables scroll when necessary.
- **Do** preserve every source diagram label, accessible SVG title/description and equivalent prose walkthrough.

### Don't:

- **Don't** add shadows, decorative gradients, simulated paper texture or decorative illustration assets.
- **Don't** box every paragraph; use the existing open reading rhythm and fine separators.
- **Don't** substitute custom drawn controls for native answer radios or Understood checkboxes.
- **Don't** encode answer correctness through color alone.
- **Don't** shrink or discard source labels to fit a diagram; respect renderer limits and the complete-text fallback.
- **Don't** add entrance animation or hover lift; retain the brief background transition and reduced-motion behavior.


## Additional PYQ practice

The PYQ route reuses the cool-paper workspace, native controls and answer feedback. A compact four-column comparison shows source, covered, repeated and additional counts; it becomes two columns on mobile. The desktop rail filters related weeks, while mobile uses a labelled native select. Year filtering and a question jump menu work with the same question set.

At the user’s explicit request for Motion/Lottie, the PYQ route adds brief 160–200ms opacity transitions for question/feedback changes and a locally authored, non-looping Lottie checkmark for correct answers. These are exceptions to the earlier no-entrance-animation rule. Reduced-motion preferences remove the fades/check animation. Diagrams remain responsive SVG with a prose walkthrough; eight additional concept diagrams clarify sensor terms, RFID, AI/ML/DL, cloud-service responsibilities, R operators, learning tasks, MOS sensing and IIRA activities.
