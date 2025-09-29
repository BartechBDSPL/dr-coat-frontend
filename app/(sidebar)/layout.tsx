import AdminPanelLayout from '@/components/admin-panel/admin-panel-layout';
import { SessionProvider } from '@/providers/session-provider';
// import { AuthGuard } from "@/components/auth-guard";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* <AuthGuard> */}
      <AdminPanelLayout>{children}</AdminPanelLayout>
      {/* </AuthGuard> */}
    </SessionProvider>
  );
}
