import Link from 'next/link';
export default function NotFound() {
  return <main className="not-found"><h1>This week isn’t in your notes.</h1><p>The supplied material covers Weeks 1–12.</p><Link className="button primary" href="/week/1">Go to Week 1</Link></main>;
}
