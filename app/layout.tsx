import type {Metadata} from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css'; // Global styles

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ArcaneNexus | Algorithmic Yield Orchestrator',
  description: 'The premium AI-driven multi-vault yield aggregator on the high-speed Arc Network blockchain.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} dark`}>
      <body suppressHydrationWarning className="bg-[#050608] text-[#f1f5f9] antialiased min-h-screen font-sans selection:bg-[#c084fc]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

