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
import FGPutAwayReport from '@/components/fg-reports/fg-put-away-report';

export default function FGPutAwayReportPage() {
  return (
    <ContentLayout title="FG Put Away Report">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>FG Put Away Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <FGPutAwayReport />
    </ContentLayout>
  );
}
