export default function AnswerExplanation({ brief, explanation, sourceNote }: { brief?: string[]; explanation: string; sourceNote?: string }) {
  return <>
    <ul className="answer-pointers">{(brief ?? [explanation.split(/(?<=[.!?])\s+/)[0]]).map((point, i) => <li key={i}>{point}</li>)}</ul>
    {sourceNote && <details className="source-caveat"><summary>Source caveat</summary><p className="source-note">{sourceNote}</p></details>}
    <details className="full-explanation"><summary>Full explanation</summary><p>{explanation}</p></details>
  </>;
}
