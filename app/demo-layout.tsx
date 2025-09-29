import { SessionProvider } from '@/providers/session-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProviderLightDark } from '@/components/theme-provider';
// import { AuthGuard } from "@/components/auth-guard";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ThemeProviderLightDark>
          {/* <AuthGuard> */}
          {children}
          {/* </AuthGuard> */}
          <Toaster />
        </ThemeProviderLightDark>
      </ThemeProvider>
    </SessionProvider>
  );
}
