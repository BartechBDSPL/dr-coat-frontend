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
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { DateTime } from 'luxon';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

interface ReportData {
  po_no: string;
  grn_no: string;
  item_code: string;
  item_description: string | null;
  lot_no: string;
  serial_no: string;
  quantity: number;
  base_weight: number;
  tare_weight: number;
  gross_weight: number;
  print_by: string;
  print_date: string;
}

const RMLabelPrintingReport: React.FC = () => {
  const [grnNo, setGrnNo] = useState<string>('');
  const [itemCode, setItemCode] = useState<string>('');
  const [lotNo, setLotNo] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
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
        'po_no',
        'grn_no',
        'item_code',
        'item_description',
        'lot_no',
        'serial_no',
        'print_by',
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
      const response = await fetch(`/api/reports/rm-label-printing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grn_no: grnNo.trim(),
          item_code: itemCode.trim(),
          lot_no: lotNo.trim(),
          from_date: fromDate
            ? DateTime.fromJSDate(fromDate).toFormat('yyyy-MM-dd')
            : '',
          to_date: toDate
            ? DateTime.fromJSDate(toDate).toFormat('yyyy-MM-dd')
            : '',
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
    setGrnNo('');
    setItemCode('');
    setLotNo('');
    setFromDate(new Date());
    setToDate(new Date());
    setReportData([]);
    setPage(1);
    setSearchClicked(false);
    setSearchTerm('');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row, index) => ({
        'Sr No': index + 1,
        'PO No': row.po_no,
        'GRN No': row.grn_no,
        'Item Code': row.item_code,
        'Item Description': row.item_description || '-',
        'Lot No': row.lot_no,
        'Serial No': row.serial_no,
        Quantity: row.quantity ?? 0,
        'Base Weight': row.base_weight ?? 0,
        'Tare Weight': row.tare_weight ?? 0,
        'Gross Weight': row.gross_weight ?? 0,
        'Print By': row.print_by,
        'Print Date': DateTime.fromISO(row.print_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'RM Label Printing Report'
    );
    const formattedDateTime = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss');
    XLSX.writeFile(
      workbook,
      `RM_LABEL_PRINTING_REPORT_${formattedDateTime}.xlsx`
    );
    toast.success('Excel exported successfully');
  };

  const exportToPdf = (): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a3') as any;
      const columns = [
        { header: 'Sr No', dataKey: 'srno' },
        { header: 'PO No', dataKey: 'po_no' },
        { header: 'GRN No', dataKey: 'grn_no' },
        { header: 'Item Code', dataKey: 'item_code' },
        { header: 'Item Description', dataKey: 'item_description' },
        { header: 'Lot No', dataKey: 'lot_no' },
        { header: 'Serial No', dataKey: 'serial_no' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Base Wt', dataKey: 'base_weight' },
        { header: 'Tare Wt', dataKey: 'tare_weight' },
        { header: 'Gross Wt', dataKey: 'gross_weight' },
        { header: 'Print By', dataKey: 'print_by' },
        { header: 'Print Date', dataKey: 'print_date' },
      ];

      const formattedData = filteredData.map((row, index) => ({
        srno: index + 1,
        po_no: row.po_no,
        grn_no: row.grn_no,
        item_code: row.item_code,
        item_description: row.item_description || '-',
        lot_no: row.lot_no,
        serial_no: row.serial_no,
        quantity: row.quantity ?? 0,
        base_weight: row.base_weight ?? 0,
        tare_weight: row.tare_weight ?? 0,
        gross_weight: row.gross_weight ?? 0,
        print_by: row.print_by,
        print_date: DateTime.fromISO(row.print_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
      }));

      doc.setFontSize(18);
      doc.text('RM Label Printing Report', 14, 22);

      autoTable(doc, {
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: { fontSize: 6.5, cellPadding: 1.5 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          3: { cellWidth: 22 },
          4: { cellWidth: 38 },
          5: { cellWidth: 25 },
          6: { cellWidth: 32 },
          7: { cellWidth: 16 },
          8: { cellWidth: 16 },
          9: { cellWidth: 16 },
          10: { cellWidth: 16 },
          11: { cellWidth: 18 },
          12: { cellWidth: 32 },
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
      doc.save(`RM_LABEL_PRINTING_REPORT_${formattedDateTime}.pdf`);
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

  const getDashboardStats = () => {
    const totalPOs = new Set(filteredData.map(item => item.po_no)).size;
    const totalGRNs = new Set(filteredData.map(item => item.grn_no)).size;
    const totalItemsCount = new Set(filteredData.map(item => item.item_code))
      .size;
    const totalLots = new Set(filteredData.map(item => item.lot_no)).size;
    const totalLabels = filteredData.length;
    const totalQuantity = filteredData.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    );

    return {
      totalPOs,
      totalGRNs,
      totalItems: totalItemsCount,
      totalLots,
      totalLabels,
      totalQuantity,
    };
  };

  const stats = getDashboardStats();

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>RM Label Printing Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="grnNo">GRN No</Label>
              <Input
                id="grnNo"
                value={grnNo}
                onChange={e => setGrnNo(e.target.value)}
                placeholder="Enter GRN No"
              />
            </div>

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
              <Label htmlFor="lotNo">Lot No</Label>
              <Input
                id="lotNo"
                value={lotNo}
                onChange={e => setLotNo(e.target.value)}
                placeholder="Enter Lot No"
              />
            </div>

            <div>
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !fromDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? (
                      DateTime.fromJSDate(fromDate).toLocaleString(
                        DateTime.DATE_FULL
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !toDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? (
                      DateTime.fromJSDate(toDate).toLocaleString(
                        DateTime.DATE_FULL
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total POs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPOs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total GRNs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGRNs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Lots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLots}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Labels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLabels}</div>
              </CardContent>
            </Card>
          </div>

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
                      <TableHead>PO No</TableHead>
                      <TableHead>GRN No</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Description</TableHead>
                      <TableHead>Lot No</TableHead>
                      <TableHead>Serial No</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Base Weight</TableHead>
                      <TableHead>Tare Weight</TableHead>
                      <TableHead>Gross Weight</TableHead>
                      <TableHead>Print By</TableHead>
                      <TableHead>Print Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {row.po_no}
                        </TableCell>
                        <TableCell>{row.grn_no}</TableCell>
                        <TableCell>{row.item_code}</TableCell>
                        <TableCell>{row.item_description || '-'}</TableCell>
                        <TableCell>{row.lot_no}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {row.serial_no}
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat().format(row.quantity ?? 0)}
                        </TableCell>
                        <TableCell>{row.base_weight ?? 0}</TableCell>
                        <TableCell>{row.tare_weight ?? 0}</TableCell>
                        <TableCell>{row.gross_weight ?? 0}</TableCell>
                        <TableCell>{row.print_by}</TableCell>
                        <TableCell>
                          {DateTime.fromISO(row.print_date)
                            .setZone('GMT')
                            .toFormat('dd/MM/yyyy HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
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

export default RMLabelPrintingReport;
