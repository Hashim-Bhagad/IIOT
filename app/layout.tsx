import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'IIoT Study Studio', template: '%s · IIoT Study Studio' },
  description: 'Study Industry 4.0 and Industrial IoT through visual weekly notes, worked examples, and assignment practice.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
