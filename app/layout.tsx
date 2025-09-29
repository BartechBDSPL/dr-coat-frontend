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

// Load all the fonts used across different themes
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
  title: 'WMS | Marken',
  description: 'Warehouse Management System for Marken World',
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
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = sessionStorage.getItem('app-theme') || localStorage.getItem('app-theme') || 'clean-blue';
                  var root = document.documentElement;
                  
                  // Add theme class
                  root.classList.add('theme-' + savedTheme);
                  
                  // Define theme variables for immediate application
                  var themeVariables = {
                    'clean-blue': {
                      light: {
                        '--background': '210.0000 40.0000% 98.0392%',
                        '--foreground': '217.2414 32.5843% 17.4510%',
                        '--primary': '238.7324 83.5294% 66.6667%',
                        '--primary-foreground': '0 0% 100%',
                        '--secondary': '220 13.0435% 90.9804%',
                        '--secondary-foreground': '216.9231 19.1176% 26.6667%',
                        '--muted': '220.0000 14.2857% 95.8824%',
                        '--muted-foreground': '220 8.9362% 46.0784%',
                        '--accent': '226.4516 100% 93.9216%',
                        '--accent-foreground': '216.9231 19.1176% 26.6667%',
                        '--destructive': '0 84.2365% 60.1961%',
                        '--destructive-foreground': '0 0% 100%',
                        '--border': '216.0000 12.1951% 83.9216%',
                        '--input': '216.0000 12.1951% 83.9216%',
                        '--ring': '238.7324 83.5294% 66.6667%',
                        '--card': '0 0% 100%',
                        '--card-foreground': '217.2414 32.5843% 17.4510%',
                        '--popover': '0 0% 100%',
                        '--popover-foreground': '217.2414 32.5843% 17.4510%'
                      },
                      dark: {
                        '--background': '222.2222 47.3684% 11.1765%',
                        '--foreground': '214.2857 31.8182% 91.3725%',
                        '--primary': '234.4538 89.4737% 73.9216%',
                        '--primary-foreground': '222.2222 47.3684% 11.1765%',
                        '--secondary': '217.7778 23.0769% 22.9412%',
                        '--secondary-foreground': '216.0000 12.1951% 83.9216%',
                        '--muted': '217.2414 32.5843% 17.4510%',
                        '--muted-foreground': '217.8947 10.6145% 64.9020%',
                        '--accent': '216.9231 19.1176% 26.6667%',
                        '--accent-foreground': '216.0000 12.1951% 83.9216%',
                        '--destructive': '0 84.2365% 60.1961%',
                        '--destructive-foreground': '222.2222 47.3684% 11.1765%',
                        '--border': '215 13.7931% 34.1176%',
                        '--input': '215 13.7931% 34.1176%',
                        '--ring': '234.4538 89.4737% 73.9216%',
                        '--card': '217.2414 32.5843% 17.4510%',
                        '--card-foreground': '214.2857 31.8182% 91.3725%',
                        '--popover': '217.2414 32.5843% 17.4510%',
                        '--popover-foreground': '214.2857 31.8182% 91.3725%'
                      }
                    }
                  };
                  
                  // Apply CSS variables immediately
                  var isDark = root.classList.contains('dark');
                  var variables = themeVariables[savedTheme];
                  if (variables) {
                    var themeVars = isDark ? variables.dark : variables.light;
                    for (var key in themeVars) {
                      root.style.setProperty(key, themeVars[key]);
                    }
                  }
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
        <DemoLayout>{children}</DemoLayout>
      </body>
    </html>
  );
}
