import type { Metadata } from 'next';
import {
  Inter,
  Source_Serif_4,
  JetBrains_Mono,
  Poppins,
  Roboto_Mono,
  Outfit,
  DM_Sans,
  Dancing_Script,
  Caveat,
} from 'next/font/google';
import './globals.css';
import DemoLayout from './demo-layout';
import { ToastContainer } from 'react-toastify';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const inter = Inter({ subsets: ['latin'] });
const sourceSerif4 = Source_Serif_4({ subsets: ['latin'] });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});
const robotoMono = Roboto_Mono({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'] });
const dmSans = DM_Sans({ subsets: ['latin'] });
const dancingScript = Dancing_Script({ subsets: ['latin'] });
const caveat = Caveat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WMS | DR Coats and Resin',
  description: 'Warehouse Management System for DR Coats and Resin',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = sessionStorage.getItem('app-theme') || localStorage.getItem('app-theme') || 'clean-blue';
                  document.documentElement.classList.add('theme-' + savedTheme);
                } catch (e) {
                  console.warn('Error applying theme:', e);
                  document.documentElement.classList.add('theme-clean-blue');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <DemoLayout>
          {children}
          <ToastContainer />
        </DemoLayout>
      </body>
    </html>
  );
}
