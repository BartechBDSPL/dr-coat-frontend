'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { DateTime } from 'luxon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import TableSearch from '@/utils/tableSearch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MaterialReceiptData {
  stock_transfer_number: string;
  item_code: string;
  item_description: string;
  lot_no: string;
  serial_no: string;
  material_receipt: string;
  material_receipt_by: string;
  material_receipt_date: string;
}

const FGMaterialReceiptReport: React.FC = () => {
  const [stockTransferNumber, setStockTransferNumber] = useState<string>('');
  const [itemCode, setItemCode] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [lotNo, setLotNo] = useState<string>('');
  const [lineNo, setLineNo] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<MaterialReceiptData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const token = Cookies.get('token');

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields: (keyof MaterialReceiptData)[] = [
        'stock_transfer_number',
        'item_code',
        'item_description',
        'lot_no',
        'serial_no',
        'material_receipt_by',
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
      const response = await fetch(`/api/reports/fg-material-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stock_transfer_number: stockTransferNumber.trim(),
          item_code: itemCode.trim(),
          item_description: itemDescription.trim(),
          lot_no: lotNo.trim(),
          line_no: lineNo.trim(),
          from_date: fromDate
            ? DateTime.fromJSDate(fromDate).toFormat('yyyy-MM-dd')
            : '',
          to_date: toDate
            ? DateTime.fromJSDate(toDate).toFormat('yyyy-MM-dd')
            : '',
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: MaterialReceiptData[] = await response.json();
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
    setStockTransferNumber('');
    setItemCode('');
    setItemDescription('');
    setLotNo('');
    setLineNo('');
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
        'Stock Transfer Number': row.stock_transfer_number,
        'Item Code': row.item_code,
        'Item Description': row.item_description,
        'Lot No': row.lot_no,
        'Serial No': row.serial_no,
        'Material Receipt': row.material_receipt,
        'Material Receipt By': row.material_receipt_by,
        'Material Receipt Date': DateTime.fromISO(row.material_receipt_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Material Receipt');
    const formattedDateTime = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss');
    XLSX.writeFile(workbook, `FG_MATERIAL_RECEIPT_${formattedDateTime}.xlsx`);
    toast.success('Excel exported successfully');
  };

  const exportToPdf = (): void => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4') as any;
      const columns = [
        { header: 'Sr No', dataKey: 'srno' },
        { header: 'Transfer No', dataKey: 'stock_transfer_number' },
        { header: 'Item Code', dataKey: 'item_code' },
        { header: 'Item Description', dataKey: 'item_description' },
        { header: 'Lot No', dataKey: 'lot_no' },
        { header: 'Serial No', dataKey: 'serial_no' },
        { header: 'Receipt', dataKey: 'material_receipt' },
        { header: 'Receipt By', dataKey: 'material_receipt_by' },
        { header: 'Receipt Date', dataKey: 'material_receipt_date' },
      ];

      const formattedData = filteredData.map((row, index) => ({
        srno: index + 1,
        stock_transfer_number: row.stock_transfer_number,
        item_code: row.item_code,
        item_description: row.item_description,
        lot_no: row.lot_no,
        serial_no: row.serial_no,
        material_receipt: row.material_receipt,
        material_receipt_by: row.material_receipt_by,
        material_receipt_date: DateTime.fromISO(row.material_receipt_date)
          .setZone('GMT')
          .toFormat('yyyy-MM-dd HH:mm:ss'),
      }));

      doc.setFontSize(18);
      doc.text('FG Material Receipt Report', 14, 22);

      autoTable(doc, {
        columns: columns,
        body: formattedData,
        startY: 30,
        styles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 30 },
          5: { cellWidth: 40 },
          6: { cellWidth: 20 },
          7: { cellWidth: 25 },
          8: { cellWidth: 35 },
        },
        headStyles: { fillColor: [66, 66, 66] },
      });

      // Add page numbers after table is generated
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
      doc.save(`FG_MATERIAL_RECEIPT_${formattedDateTime}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  // Analytics
  const getDashboardStats = () => {
    const totalTransfers = new Set(
      filteredData.map(item => item.stock_transfer_number)
    ).size;
    const totalItems = new Set(filteredData.map(item => item.item_code)).size;
    const totalLots = new Set(filteredData.map(item => item.lot_no)).size;
    const totalReceipts = filteredData.length;
    const uniqueReceivedBy = new Set(
      filteredData.map(item => item.material_receipt_by)
    ).size;

    return {
      totalTransfers,
      totalItems,
      totalLots,
      totalReceipts,
      uniqueReceivedBy,
    };
  };

  const stats = getDashboardStats();

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>FG Material Receipt Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="stockTransferNumber">Stock Transfer Number</Label>
              <Input
                id="stockTransferNumber"
                value={stockTransferNumber}
                onChange={e => setStockTransferNumber(e.target.value)}
                placeholder="Enter Stock Transfer Number"
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
              <Label htmlFor="lineNo">Line No</Label>
              <Input
                id="lineNo"
                value={lineNo}
                onChange={e => setLineNo(e.target.value)}
                placeholder="Enter Line No"
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
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transfers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransfers}</div>
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
                  Total Receipts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReceipts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique Receivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.uniqueReceivedBy}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
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
                      <TableHead>Sr No</TableHead>
                      <TableHead>Stock Transfer Number</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Description</TableHead>
                      <TableHead>Lot No</TableHead>
                      <TableHead>Serial No</TableHead>
                      <TableHead>Material Receipt</TableHead>
                      <TableHead>Material Receipt By</TableHead>
                      <TableHead>Material Receipt Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((row, index) => (
                      <TableRow key={`${row.serial_no}-${index}`}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{row.stock_transfer_number}</TableCell>
                        <TableCell>{row.item_code}</TableCell>
                        <TableCell>{row.item_description}</TableCell>
                        <TableCell>{row.lot_no}</TableCell>
                        <TableCell>{row.serial_no}</TableCell>
                        <TableCell>{row.material_receipt}</TableCell>
                        <TableCell>{row.material_receipt_by}</TableCell>
                        <TableCell>
                          {DateTime.fromISO(row.material_receipt_date)
                            .setZone('GMT')
                            .toFormat('yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
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
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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

export default FGMaterialReceiptReport;
