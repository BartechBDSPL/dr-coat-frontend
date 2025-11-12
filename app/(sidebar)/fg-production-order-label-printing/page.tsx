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
import FGLabelPrintingProductionOrder from '@/components/fg-transactions/fg-label-printing-production-order';

export default function FGProductionOrderLabelPrintingPage() {
  return (
    <ContentLayout title="FG Production Order Label Printing">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>FG Production Order Label Printing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <FGLabelPrintingProductionOrder />
    </ContentLayout>
  );
}
