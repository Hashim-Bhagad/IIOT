import { useId } from 'react';

type Kind = 'sensor' | 'actuator' | 'fog' | 'cloud' | 'ar' | 'vr' | 'passive' | 'active' | 'semi';
type Item = { kind: Kind; label: string; job: string };
const contrasts: Record<string, { caption: string; items: Item[] }> = {
  'w1-system': {caption:'Sensors measure. Actuators change the process.',items:[{kind:'sensor',label:'Sensor',job:'Physical quantity → reading'},{kind:'actuator',label:'Actuator',job:'Control signal → action'}]},
  'w3-reality': {caption:'AR adds to your view. VR replaces it.',items:[{kind:'ar',label:'Augmented reality',job:'Real world + digital overlay'},{kind:'vr',label:'Virtual reality',job:'Simulated environment'}]},
  'w8-fog': {caption:'Nearby work for fast response; shared cloud resources for larger workloads.',items:[{kind:'fog',label:'Fog',job:'Nearby processing'},{kind:'cloud',label:'Cloud',job:'Large shared workloads'}]},
  'w9-fog': {caption:'Fog processes data nearby before sending useful information to the cloud.',items:[{kind:'fog',label:'Fog',job:'Filter and decide nearby'},{kind:'cloud',label:'Cloud',job:'Store and analyse at scale'}]},
  'w11-rfid': {caption:'A battery does not always mean an active transmitter.',items:[{kind:'passive',label:'Passive',job:'Reader power · backscatter'},{kind:'semi',label:'Semi-passive',job:'Battery for IC · backscatter'},{kind:'active',label:'Active',job:'Battery · active transmitter'}]},
};

function Picture({kind}: {kind:Kind}) {
  const id=useId();
  return <svg viewBox="0 0 240 140" width="240" height="140" role="img" aria-labelledby={id}>
    <title id={id}>{kind === 'sensor' ? 'A thermometer senses heat and sends a reading' : kind === 'actuator' ? 'A control signal turns a motor and gear' : kind === 'fog' ? 'A local gateway receives data beside factory machines' : kind === 'cloud' ? 'Remote shared servers hold and process data' : kind === 'ar' ? 'A real machine remains visible behind a digital overlay' : kind === 'vr' ? 'A headset presents a simulated environment' : kind === 'passive' ? 'A reader powers a tag that reflects a radio signal' : kind === 'semi' ? 'A battery powers the tag chip while its response is reflected' : 'A battery-powered tag actively sends a radio signal'}</title>
    <g fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {kind==='sensor' && <><path d="M67 35a13 13 0 0 1 26 0v49a24 24 0 1 1-26 0Z" fill="var(--paper-2)"/><path d="M80 45v48" stroke="var(--accent)" strokeWidth="6"/><circle cx="80" cy="105" r="10" fill="var(--accent)" stroke="none"/><path d="M103 45h10m-10 16h7m-7 16h10M133 71h52m-11-10 11 10-11 10"/><rect x="192" y="50" width="30" height="42" rx="4" fill="var(--surface)"/><path d="m200 72 4 5 9-14" stroke="var(--accent)"/><path d="M29 46q-12 9 0 18t0 18M42 32q-12 9 0 18t0 18" stroke="var(--muted)"/></>}
      {kind==='actuator' && <><rect x="23" y="45" width="38" height="46" rx="4" fill="var(--surface)"/><path d="m32 69 6 6 13-18" stroke="var(--accent)"/><path d="M72 68h38m-10-9 10 9-10 9"/><rect x="128" y="40" width="61" height="58" rx="8" fill="var(--paper-2)"/><path d="M140 40v-7h35v7m-35 59v9h40v-9M189 69h26"/><circle cx="157" cy="69" r="17"/><path d="M154 58q15 3 10 17m-7-1 7 3 5-6" stroke="var(--accent)"/><path d="M215 50v38m-8-31h16m-16 24h16"/></>}
      {kind==='fog' && <><path d="M19 112V71l24-15v15l24-15v56Z" fill="var(--paper-2)"/><path d="M26 71V34h11v28m-6 26h5m12 0h5m-23 13h5m13 0h5"/><path d="M79 86h34m-8-8 8 8-8 8"/><rect x="131" y="53" width="76" height="57" rx="5" fill="var(--surface)"/><path d="M145 67h47m-47 13h29m-29 15h4m10 0h4m10 0h4m-8-57v15"/><path d="M156 28q13-12 26 0m-20 8q7-7 14 0" stroke="var(--accent)"/></>}
      {kind==='cloud' && <><path d="M52 60a24 24 0 0 1 23-29 32 32 0 0 1 61-6 27 27 0 0 1 40 35Z" fill="var(--paper-2)"/><path d="M113 61v14m-8-5 8 8 8-8" stroke="var(--accent)"/><rect x="62" y="87" width="108" height="17" rx="3" fill="var(--surface)"/><rect x="62" y="111" width="108" height="17" rx="3" fill="var(--surface)"/><path d="M74 95h4m7 0h4m-15 24h4m7 0h4m55-24h14m-14 24h14"/></>}
      {kind==='ar' && <><path d="M34 114V63l38-20v71Zm38 0V43l35 20v51Z" fill="var(--paper-2)"/><path d="M51 79h8m-8 17h8m26-17h8m-8 17h8M28 115h87"/><rect x="133" y="20" width="71" height="107" rx="8" fill="var(--surface)"/><path d="M145 101V64l23-13 23 13v37Zm23-50v50"/><rect x="151" y="40" width="34" height="23" rx="3" fill="var(--accent-tint)" stroke="var(--accent)"/><path d="m158 51 6 5 12-12" stroke="var(--accent)"/><path d="M153 112h30"/></>}
      {kind==='vr' && <><path d="M52 70a58 58 0 0 1 116-1"/><rect x="44" y="54" width="132" height="58" rx="16" fill="var(--paper-2)"/><path d="M54 94q24-20 46-7l11 10 12-10q23-13 43 7"/><rect x="59" y="64" width="42" height="23" rx="6" fill="var(--accent-tint)" stroke="var(--accent)"/><rect x="119" y="64" width="42" height="23" rx="6" fill="var(--accent-tint)" stroke="var(--accent)"/><path d="M77 30v-9m35 0v-9m35 18v-9M183 65l14-9m-10 30h16" stroke="var(--accent)"/></>}
      {['passive','semi','active'].includes(kind) && <><rect x="19" y="44" width="44" height="64" rx="5" fill="var(--surface)"/><path d="M30 59h22m-22 13h13m-7 24h8"/><path d="M79 59q14 16 0 32m11-43q23 27 0 54" stroke="var(--accent)"/><path d="M133 49h44l31 30-31 30h-44Z" fill="var(--paper-2)"/><rect x="145" y="64" width="26" height="29" rx="3"/><circle cx="188" cy="79" r="4"/>{kind!=='passive' && <><rect x="148" y="21" width="36" height="16" rx="2" fill="var(--accent-tint)" stroke="var(--accent)"/><path d="M184 26h5v6h-5m-27-7v8m-4-4h8" stroke="var(--accent)"/><path d="M165 37v12"/></>}{kind==='active' ? <path d="M127 62q-13 16 0 32m-12-44q-21 28 0 56" stroke="var(--accent)"/> : <path d="M122 97h-17m8-5-8 5 8 5" stroke="var(--muted)"/>}</>}
    </g>
  </svg>;
}

export function hasVisualContrast(sectionId: string) { return sectionId in contrasts; }

export default function VisualContrast({sectionId}: {sectionId:string}) {
  const data=contrasts[sectionId];
  if(!data) return null;
  return <figure className="visual-contrast"><div className={`contrast-pictures ${data.items.length===3?'three-pictures':''}`}>{data.items.map(item=><div key={item.kind}><Picture kind={item.kind}/><h4>{item.label}</h4><p>{item.job}</p></div>)}</div><figcaption>{data.caption}</figcaption></figure>;
}
