'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import TableSearch from '@/utils/tableSearch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ReportData {
  item_code: string;
  item_description: string | null;
  lot_no: string;
  serial_no: string;
  system_quantity: number;
  adjusted_quantity: number;
  adjusted_by: string;
  adjusted_date: string;
  system_remarks: string | null;
}

const FGStockAdjustmentReport: React.FC = () => {
  const [itemCode, setItemCode] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [lotNo, setLotNo] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(
    DateTime.now().toFormat('yyyy-MM-dd')
  );
  const [toDate, setToDate] = useState<string>(
    DateTime.now().toFormat('yyyy-MM-dd')
  );
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const token = Cookies.get('token');

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields: (keyof ReportData)[] = [
        'item_code',
        'item_description',
        'lot_no',
        'serial_no',
        'adjusted_by',
        'system_remarks',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [reportData, searchTerm]);

  const handleSearchTerm = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setPage(1);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setPage(1);
  }, []);

  const handleSearch = async () => {
    if (fromDate && toDate && fromDate > toDate) {
      toast.error('From Date cannot be greater than To Date');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/reports/fg-stock-adjustment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_code: itemCode.trim() || null,
          item_description: itemDescription.trim() || null,
          lot_no: lotNo.trim() || null,
          from_date: fromDate || null,
          to_date: toDate || null,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: ReportData[] = await response.json();
      setSearchClicked(true);
      setReportData(data);
      setPage(1);
      toast.success(`Found ${data.length} records`);
    } catch (error) {
      setSearchClicked(true);
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setItemCode('');
    setItemDescription('');
    setLotNo('');
    setFromDate(DateTime.now().toFormat('yyyy-MM-dd'));
    setToDate(DateTime.now().toFormat('yyyy-MM-dd'));
    setReportData([]);
    setPage(1);
    setSearchClicked(false);
    setSearchTerm('');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row, index) => ({
        'Sr No': index + 1,
        'Item Code': row.item_code,
        'Item Description': row.item_description || '-',
        'Lot No': row.lot_no,
        'Serial No': row.serial_no,
        'System Quantity': row.system_quantity ?? 0,
        'Adjusted Quantity': row.adjusted_quantity ?? 0,
        Variance: (row.adjusted_quantity ?? 0) - (row.system_quantity ?? 0),
        'Adjusted By': row.adjusted_by,
        'Adjusted Date': DateTime.fromISO(row.adjusted_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
        Remarks: row.system_remarks || '-',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FG Stock Adjustment');
    const formattedDateTime = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss');
    XLSX.writeFile(
      workbook,
      `FG_STOCK_ADJUSTMENT_REPORT_${formattedDateTime}.xlsx`
    );
    toast.success('Excel exported successfully');
  };

  const exportToPdf = (): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a3') as any;
      const columns = [
        { header: 'Sr No', dataKey: 'srno' },
        { header: 'Item Code', dataKey: 'item_code' },
        { header: 'Item Description', dataKey: 'item_description' },
        { header: 'Lot No', dataKey: 'lot_no' },
        { header: 'Serial No', dataKey: 'serial_no' },
        { header: 'System Qty', dataKey: 'system_quantity' },
        { header: 'Adjusted Qty', dataKey: 'adjusted_quantity' },
        { header: 'Variance', dataKey: 'variance' },
        { header: 'Adjusted By', dataKey: 'adjusted_by' },
        { header: 'Adjusted Date', dataKey: 'adjusted_date' },
        { header: 'Remarks', dataKey: 'system_remarks' },
      ];

      const formattedData = filteredData.map((row, index) => ({
        srno: index + 1,
        item_code: row.item_code,
        item_description: row.item_description || '-',
        lot_no: row.lot_no,
        serial_no: row.serial_no,
        system_quantity: row.system_quantity ?? 0,
        adjusted_quantity: row.adjusted_quantity ?? 0,
        variance: (row.adjusted_quantity ?? 0) - (row.system_quantity ?? 0),
        adjusted_by: row.adjusted_by,
        adjusted_date: DateTime.fromISO(row.adjusted_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
        system_remarks: row.system_remarks || '-',
      }));

      doc.setFontSize(18);
      doc.text('FG Stock Adjustment Report', 14, 22);

      autoTable(doc, {
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: { fontSize: 6, cellPadding: 1.5 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 22 },
          4: { cellWidth: 38 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 18 },
          8: { cellWidth: 22 },
          9: { cellWidth: 30 },
          10: { cellWidth: 35 },
        },
        headStyles: { fillColor: [66, 66, 66] },
      });

      const totalPagesGenerated = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPagesGenerated; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${totalPagesGenerated}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      const formattedDateTime = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss');
      doc.save(`FG_STOCK_ADJUSTMENT_REPORT_${formattedDateTime}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>FG Stock Adjustment Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="itemCode">Item Code</Label>
              <Input
                id="itemCode"
                value={itemCode}
                onChange={e => setItemCode(e.target.value)}
                placeholder="Enter Item Code"
              />
            </div>

            <div>
              <Label htmlFor="itemDescription">Item Description</Label>
              <Input
                id="itemDescription"
                value={itemDescription}
                onChange={e => setItemDescription(e.target.value)}
                placeholder="Enter Item Description"
              />
            </div>

            <div>
              <Label htmlFor="lotNo">Lot No</Label>
              <Input
                id="lotNo"
                value={lotNo}
                onChange={e => setLotNo(e.target.value)}
                placeholder="Enter Lot No"
              />
            </div>

            <div>
              <Label htmlFor="fromDate">From Date</Label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div>
              <Label htmlFor="toDate">To Date</Label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <CardTitle>
                  Report Data ({filteredData.length} records)
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={exportToExcel} variant="outline" size="sm">
                    <FaFileExcel className="mr-2" /> Export Excel
                  </Button>
                  <Button onClick={exportToPdf} variant="outline" size="sm">
                    <FaFilePdf className="mr-2" /> Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <TableSearch onSearch={handleSearchTerm} />
                <div className="flex items-center gap-2">
                  <Label>Show</Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label>entries</Label>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sr No</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Description</TableHead>
                      <TableHead>Lot No</TableHead>
                      <TableHead>Serial No</TableHead>
                      <TableHead>System Qty</TableHead>
                      <TableHead>Adjusted Qty</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Adjusted By</TableHead>
                      <TableHead>Adjusted Date</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((row, index) => {
                      const variance =
                        (row.adjusted_quantity ?? 0) -
                        (row.system_quantity ?? 0);
                      return (
                        <TableRow key={index}>
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell>{row.item_code}</TableCell>
                          <TableCell>{row.item_description || '-'}</TableCell>
                          <TableCell>{row.lot_no}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {row.serial_no}
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Intl.NumberFormat().format(
                              row.system_quantity ?? 0
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Intl.NumberFormat().format(
                              row.adjusted_quantity ?? 0
                            )}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'font-medium',
                              variance < 0
                                ? 'text-red-500'
                                : variance > 0
                                  ? 'text-green-500'
                                  : ''
                            )}
                          >
                            {variance > 0 ? '+' : ''}
                            {new Intl.NumberFormat().format(variance)}
                          </TableCell>
                          <TableCell>{row.adjusted_by}</TableCell>
                          <TableCell>
                            {DateTime.fromISO(row.adjusted_date)
                              .setZone('GMT')
                              .toFormat('dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>{row.system_remarks || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={
                          page === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage(p => Math.min(totalPages, p + 1))
                        }
                        className={
                          page === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </>
      ) : searchClicked ? (
        <Card className="mt-5">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              No records found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search filters
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default FGStockAdjustmentReport;
