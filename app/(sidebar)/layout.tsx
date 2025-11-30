import AdminPanelLayout from '@/components/admin-panel/admin-panel-layout';
import { SessionProvider } from '@/providers/session-provider';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </SessionProvider>
  );
}
