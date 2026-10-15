'use client';

import { useEffect, useRef, useState } from 'react';
import type { DiagramData } from '@/lib/types';

type Point = { x: number; y: number };
type Box = Point & { w: number; h: number; lines: string[] };
type MeasureText = (text: string, font: number) => number;
type Layout = { width: number; height: number; boxes: Box[]; paths: string[]; font: number; lineHeight: number };
const snap = (n: number) => Math.round(n / 4) * 4;
const fallbackMeasure: MeasureText = (text, font) => text.length * font * .72;

function wrap(text: string, maxWidth: number, font: number, measure: MeasureText): string[] {
  const words = text.split(/\s+/).flatMap(word => {
    if (measure(word, font) <= maxWidth) return [word];
    const pieces: string[] = [];
    let piece = '';
    for (const character of word) {
      if (piece && measure(piece + character, font) > maxWidth) {
        pieces.push(piece);
        piece = '';
      }
      piece += character;
    }
    if (piece) pieces.push(piece);
    return pieces;
  });
  const lines: string[] = [];
  for (const word of words) {
    if (!lines.length || measure(`${lines[lines.length - 1]} ${word}`, font) > maxWidth) lines.push(word);
    else lines[lines.length - 1] += ' ' + word;
  }
  return lines;
}
function elbow(points: Point[]) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], p = points[i], b = points[i + 1];
    const before = Math.hypot(p.x - a.x, p.y - a.y), after = Math.hypot(b.x - p.x, b.y - p.y);
    if (!before || !after) continue;
    const u = { x: (p.x - a.x) / before, y: (p.y - a.y) / before };
    const v = { x: (b.x - p.x) / after, y: (b.y - p.y) / after };
    const cross = u.x * v.y - u.y * v.x;
    if (cross === 0) { d += ` L ${p.x} ${p.y}`; continue; }
    const r = Math.min(8, before / 2, after / 2);
    const start = { x: p.x - u.x * r, y: p.y - u.y * r };
    const end = { x: p.x + v.x * r, y: p.y + v.y * r };
    d += ` L ${start.x} ${start.y} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${end.x} ${end.y}`;
  }
  const last = points[points.length - 1];
  return d + ` L ${last.x} ${last.y}`;
}

export function buildDiagramLayout(data: DiagramData, availableWidth: number, measure: MeasureText = fallbackMeasure): Layout {
  // Multiples of eight also keep box and port midpoints on the four-pixel grid.
  const width = Math.max(240, Math.floor(availableWidth / 8) * 8);
  const n = data.nodes.length;
  const compact = width < 520;
  const font = compact ? 12 : 16;
  const lineHeight = compact ? 16 : 20;
  let height: number;
  let boxes: Box[];
  const paths: string[] = [];

  if (data.type === 'layers') {
    const w = width - 32;
    const lines = data.nodes.map(node => wrap(node.label, w - 32, font, measure));
    const h = Math.max(80, ...lines.map(line => Math.ceil((line.length * lineHeight + 24) / 8) * 8));
    boxes = lines.map((line, i) => ({ x: 16, y: 16 + i * (h + 8), w, h, lines: line }));
    height = n * (h + 8) + 24;
  } else if (data.type === 'branch') {
    const children = n - 1;
    const w = compact ? 80 : 160;
    const lines = data.nodes.map(node => wrap(node.label, w - 24, font, measure));
    const h = Math.max(80, ...lines.map(line => Math.ceil((line.length * lineHeight + 24) / 8) * 8));
    height = children * (h + 24) + 8;
    const rootH = Math.max(h, (children + 1) * 24);
    boxes = [{ x: 8, y: snap((height - rootH) / 2), w, h: rootH, lines: lines[0] }, ...lines.slice(1).map((line, i) => ({ x: width - w - 8, y: 16 + i * (h + 24), w, h, lines: line }))];
    const rootBox = boxes[0];
    const gap = boxes[1].x - (rootBox.x + w);
    const maxDepth = Math.ceil(children / 2);
    const channelGap = Math.floor(gap / (maxDepth + 1) / 4) * 4;
    for (let i = 0; i < children; i++) {
      const child = boxes[i + 1];
      const y = rootBox.y + snap(rootH * (i + 1) / (children + 1));
      // Outer children turn nearest the root; inner children turn farther away.
      // Mirroring the lower half prevents its horizontal legs crossing earlier
      // downward legs. Reused x lanes occupy disjoint upper/lower y ranges.
      const depth = Math.min(i, children - 1 - i) + 1;
      const lane = rootBox.x + w + channelGap * depth;
      const childY = child.y + h / 2;
      paths.push(elbow([{ x: rootBox.x + w, y }, { x: lane, y }, { x: lane, y: childY }, { x: child.x, y: childY }]));
    }
  } else {
    const horizontal = width >= n * 112 + (n - 1) * 32 + 32;
    const w = horizontal ? Math.min(160, Math.floor((width - 32 - (n - 1) * 32) / n / 8) * 8) : Math.min(320, width - 64);
    const lines = data.nodes.map(node => wrap(node.label, w - 24, font, measure));
    const h = Math.max(80, ...lines.map(line => Math.ceil((line.length * lineHeight + 24) / 8) * 8));
    const offset = snap((width - (n * w + (n - 1) * 32)) / 2);
    boxes = lines.map((line, i) => ({ x: horizontal ? offset + i * (w + 32) : snap((width - w) / 2), y: horizontal ? 16 : 16 + i * (h + 32), w, h, lines: line }));
    height = horizontal ? h + (data.type === 'loop' ? 80 : 32) : n * (h + 32);
    for (let i = 1; i < n; i++) {
      const from = boxes[i - 1], to = boxes[i];
      paths.push(horizontal ? elbow([{ x: from.x + w, y: from.y + h / 2 }, { x: to.x, y: to.y + h / 2 }]) : elbow([{ x: from.x + w / 2, y: from.y + h }, { x: to.x + w / 2, y: to.y }]));
    }
    if (data.type === 'loop') {
      const a = boxes[n - 1], z = boxes[0];
      paths.push(horizontal ? elbow([{ x: a.x + w / 2, y: a.y + h }, { x: a.x + w / 2, y: height - 16 }, { x: z.x + w / 2, y: height - 16 }, { x: z.x + w / 2, y: z.y + h }]) : elbow([{ x: a.x, y: a.y + h / 2 }, { x: 16, y: a.y + h / 2 }, { x: 16, y: z.y + h / 2 }, { x: z.x, y: z.y + h / 2 }]));
    }
  }
  return { width, height, boxes, paths, font, lineHeight };
}

export default function Diagram({ data, id }: { data: DiagramData; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [measure, setMeasure] = useState<MeasureText>(() => fallbackMeasure);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    const context = document.createElement('canvas').getContext('2d');
    const updateMetrics = () => {
      if (!active || !context) return;
      const family = getComputedStyle(element.querySelector('svg') ?? element).fontFamily;
      setMeasure(() => (text: string, font: number) => {
        context.font = `600 ${font}px ${family}`;
        return context.measureText(text).width;
      });
    };
    updateMetrics();
    void document.fonts.ready.then(updateMetrics);
    const observer = new ResizeObserver(entries => setWidth(Math.max(240, Math.floor(entries[0].contentRect.width / 8) * 8)));
    observer.observe(element);
    return () => { active = false; observer.disconnect(); };
  }, []);

  const n = data.nodes.length;
  // Preserve every source label instead of silently shrinking or discarding
  // content that exceeds the editorial diagram budgets.
  if (n < 2 || n > 9 || (data.type === 'layers' && n > 6) || (data.type === 'branch' && n > 6)) {
    return <figure className="lesson-diagram"><h4>{data.title}</h4><figcaption>{data.caption}</figcaption><ol>{data.nodes.map((node, i) => <li key={i}><strong>{node.label}.</strong> {node.detail}</li>)}</ol></figure>;
  }
  const { width: canvasWidth, height, boxes, paths, font, lineHeight } = buildDiagramLayout(data, width, measure);
  const marker = `${id}-arrow`;
  return <figure className="lesson-diagram">
    <h4>{data.title}</h4>
    <div ref={ref} className="diagram-canvas">
      <svg viewBox={`0 0 ${canvasWidth} ${height}`} width="100%" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{data.title}</title>
        <desc id={`${id}-desc`}>{data.caption}</desc>
        <defs>{['', '-accent', '-link'].map((suffix, i) => <marker key={suffix} id={marker + suffix} markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M 0 0 L 8 4 L 0 8 Z" fill={`var(${['--muted', '--accent', '--link'][i]})`}/></marker>)}</defs>
        {paths.map((path, i) => <path key={i} d={path} fill="none" stroke="var(--muted)" strokeWidth="1.2" markerEnd={`url(#${marker})`}/>)}
        {boxes.map((box, i) => <g key={i}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="8" fill="var(--paper)"/>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="8" fill={i === 0 ? 'var(--accent-tint)' : data.type === 'layers' && i % 2 ? 'var(--paper-2)' : 'var(--paper)'} stroke={i === 0 ? 'var(--accent)' : 'var(--rule-solid)'} strokeWidth="1"/>
          <text x={box.x + box.w / 2} y={snap(box.y + box.h / 2 - (box.lines.length - 1) * lineHeight / 2 + 4)} textAnchor="middle" fill="var(--ink)" fontSize={font} fontWeight="600">
            {box.lines.map((line, j) => <tspan key={j} x={box.x + box.w / 2} dy={j === 0 ? 0 : lineHeight}>{line}</tspan>)}
          </text>
        </g>)}
      </svg>
    </div>
    <figcaption>{data.caption}</figcaption>
    <details className="diagram-explanation"><summary>Walk through the diagram</summary><ol>{data.nodes.map((node, i) => <li key={i}><strong>{node.label}.</strong> {node.detail}</li>)}</ol></details>
  </figure>;
}
