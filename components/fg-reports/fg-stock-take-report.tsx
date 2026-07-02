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
import { Badge } from '@/components/ui/badge';
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
  stock_take_no: number;
  item_code: string;
  item_description: string | null;
  lot_no: string;
  serial_no: string;
  system_location: string;
  physical_location: string;
  system_quantity: number;
  physical_quantity: number;
  stock_take_by: string;
  stock_take_date: string;
  stock_take_status: string;
}

const FGStockTakeReport: React.FC = () => {
  const [stockTakeNo, setStockTakeNo] = useState<string>('');
  const [itemCode, setItemCode] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [lotNo, setLotNo] = useState<string>('');
  const [stockTakeStatus, setStockTakeStatus] = useState<string>('');
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
        'physical_location',
        'system_location',
        'stock_take_by',
        'stock_take_status',
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
      const response = await fetch(`/api/reports/fg-stock-take`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stock_take_no: stockTakeNo ? Number(stockTakeNo) : null,
          item_code: itemCode.trim() || null,
          item_description: itemDescription.trim() || null,
          lot_no: lotNo.trim() || null,
          stock_take_status: stockTakeStatus.trim() || null,
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
    setStockTakeNo('');
    setItemCode('');
    setItemDescription('');
    setLotNo('');
    setStockTakeStatus('');
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
        'Stock Take No': row.stock_take_no,
        'Item Code': row.item_code,
        'Item Description': row.item_description || '-',
        'Lot No': row.lot_no,
        'Serial No': row.serial_no,
        'System Location': row.system_location,
        'Physical Location': row.physical_location,
        'System Quantity': row.system_quantity ?? 0,
        'Physical Quantity': row.physical_quantity ?? 0,
        Variance: (row.physical_quantity ?? 0) - (row.system_quantity ?? 0),
        'Stock Take By': row.stock_take_by,
        'Stock Take Date': DateTime.fromISO(row.stock_take_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
        Status: row.stock_take_status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FG Stock Take Report');
    const formattedDateTime = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss');
    XLSX.writeFile(workbook, `FG_STOCK_TAKE_REPORT_${formattedDateTime}.xlsx`);
    toast.success('Excel exported successfully');
  };

  const exportToPdf = (): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a3') as any;
      const columns = [
        { header: 'Sr No', dataKey: 'srno' },
        { header: 'Stock Take No', dataKey: 'stock_take_no' },
        { header: 'Item Code', dataKey: 'item_code' },
        { header: 'Item Description', dataKey: 'item_description' },
        { header: 'Lot No', dataKey: 'lot_no' },
        { header: 'Serial No', dataKey: 'serial_no' },
        { header: 'System Location', dataKey: 'system_location' },
        { header: 'Physical Location', dataKey: 'physical_location' },
        { header: 'System Qty', dataKey: 'system_quantity' },
        { header: 'Physical Qty', dataKey: 'physical_quantity' },
        { header: 'Variance', dataKey: 'variance' },
        { header: 'Stock Take By', dataKey: 'stock_take_by' },
        { header: 'Stock Take Date', dataKey: 'stock_take_date' },
        { header: 'Status', dataKey: 'stock_take_status' },
      ];

      const formattedData = filteredData.map((row, index) => ({
        srno: index + 1,
        stock_take_no: row.stock_take_no,
        item_code: row.item_code,
        item_description: row.item_description || '-',
        lot_no: row.lot_no,
        serial_no: row.serial_no,
        system_location: row.system_location,
        physical_location: row.physical_location,
        system_quantity: row.system_quantity ?? 0,
        physical_quantity: row.physical_quantity ?? 0,
        variance: (row.physical_quantity ?? 0) - (row.system_quantity ?? 0),
        stock_take_by: row.stock_take_by,
        stock_take_date: DateTime.fromISO(row.stock_take_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
        stock_take_status: row.stock_take_status,
      }));

      doc.setFontSize(18);
      doc.text('FG Stock Take Report', 14, 22);

      autoTable(doc, {
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: { fontSize: 6, cellPadding: 1.5 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          3: { cellWidth: 35 },
          4: { cellWidth: 22 },
          5: { cellWidth: 35 },
          6: { cellWidth: 25 },
          7: { cellWidth: 25 },
          8: { cellWidth: 18 },
          9: { cellWidth: 18 },
          10: { cellWidth: 18 },
          11: { cellWidth: 20 },
          12: { cellWidth: 30 },
          13: { cellWidth: 15 },
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
      doc.save(`FG_STOCK_TAKE_REPORT_${formattedDateTime}.pdf`);
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
    const totalStockTakes = new Set(
      filteredData.map(item => item.stock_take_no)
    ).size;
    const totalItemsCount = new Set(filteredData.map(item => item.item_code))
      .size;
    const totalLots = new Set(filteredData.map(item => item.lot_no)).size;
    const totalSerials = filteredData.length;
    const totalSystemQty = filteredData.reduce(
      (sum, item) => sum + (item.system_quantity ?? 0),
      0
    );
    const totalPhysicalQty = filteredData.reduce(
      (sum, item) => sum + (item.physical_quantity ?? 0),
      0
    );

    return {
      totalStockTakes,
      totalItems: totalItemsCount,
      totalLots,
      totalSerials,
      totalSystemQty,
      totalPhysicalQty,
    };
  };

  const stats = getDashboardStats();

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>FG Stock Take Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="stockTakeNo">Stock Take No</Label>
              <Input
                id="stockTakeNo"
                type="number"
                value={stockTakeNo}
                onChange={e => setStockTakeNo(e.target.value)}
                placeholder="Enter Stock Take No"
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
              <Label htmlFor="stockTakeStatus">Status</Label>
              <Input
                id="stockTakeStatus"
                value={stockTakeStatus}
                onChange={e => setStockTakeStatus(e.target.value)}
                placeholder="e.g. O"
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stock Takes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalStockTakes}
                </div>
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
                  Total Serials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSerials}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  System Qty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat().format(stats.totalSystemQty)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Physical Qty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat().format(stats.totalPhysicalQty)}
                </div>
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
                      <TableHead>Stock Take No</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Description</TableHead>
                      <TableHead>Lot No</TableHead>
                      <TableHead>Serial No</TableHead>
                      <TableHead>System Location</TableHead>
                      <TableHead>Physical Location</TableHead>
                      <TableHead>System Qty</TableHead>
                      <TableHead>Physical Qty</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Stock Take By</TableHead>
                      <TableHead>Stock Take Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((row, index) => {
                      const variance =
                        (row.physical_quantity ?? 0) -
                        (row.system_quantity ?? 0);
                      return (
                        <TableRow key={index}>
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {row.stock_take_no}
                          </TableCell>
                          <TableCell>{row.item_code}</TableCell>
                          <TableCell>{row.item_description || '-'}</TableCell>
                          <TableCell>{row.lot_no}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {row.serial_no}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {row.system_location}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {row.physical_location}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Intl.NumberFormat().format(
                              row.system_quantity ?? 0
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Intl.NumberFormat().format(
                              row.physical_quantity ?? 0
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
                          <TableCell>{row.stock_take_by}</TableCell>
                          <TableCell>
                            {DateTime.fromISO(row.stock_take_date)
                              .setZone('GMT')
                              .toFormat('dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.stock_take_status === 'O'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {row.stock_take_status}
                            </Badge>
                          </TableCell>
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

export default FGStockTakeReport;
