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
import FGLabelPrintingReport from '@/components/fg-reports/fg-label-printing-report';

export default function FGLabelPrintingReportPage() {
  return (
    <ContentLayout title="FG Label Printing Report">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>FG Label Printing Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <FGLabelPrintingReport />
    </ContentLayout>
  );
}
