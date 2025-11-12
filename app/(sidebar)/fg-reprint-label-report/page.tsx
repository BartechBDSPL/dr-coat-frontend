import Link from 'next/link';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import FGReprintLabelReport from '@/components/fg-reports/fg-reprint-label-report';

export default function FGReprintLabelReportPage() {
  return (
    <ContentLayout title="FG Reprint Label Report">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>FG Reprint Label Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <FGReprintLabelReport />
    </ContentLayout>
  );
}
