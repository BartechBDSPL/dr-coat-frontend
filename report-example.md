```tsx
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { DateTime } from "luxon";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import TableSearch from '@/utills/tableSearch';
import { Badge } from "@/components/ui/badge";
import CustomDropdown from '../CustomDropdown';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DropdownOption {
  value: string;
  label: string;
}

interface ReportData {
  PRODUCTION_PLANT: string | null;
  ORDER_NUMBER: string;
  MATERIAL: string;
  MATERIAL_TEXT: string;
  BATCH: string;
  STORAGE_LOCATION: string;
  SCRAP: number;
  TARGET_QUANTITY: number;
  DELIVERED_QUANTITY: number;
  UNIT_ISO: string;
  PRODUCTION_START_DATE: string;
  PRODUCTION_FINISH_DATE: string;
  ENTERED_BY: string;
  ENTER_DATE: string;
  PrintQty: number;
  SerialNo: string;
  PrintBy: string;
  PrintDate: string;
  ShiftName:string;
  PalletBarcode: string | null;
  PutStatus: string | null;
  PutDate: string | null;
  Location: string | null;
  PickQty: number | null;
  PickBy: string | null;
  LINE: string | null;
  PickDate: string | null;
}

interface ShiftData {
  Shift_Name: string;
  Shift_Description: string;
  FromTime: string;
  ToTime: string;
  Created_By: string;
  Created_Date: string;
  Updated_By: string | null;
  Updated_Date: string | null;
}

const FGLabelPrinting: React.FC = () => {
  const [plantCode, setPlantCode] = useState<string>("");
  const [orderNo, setOrderNo] = useState<string>("");
  const [itemCode, setItemCode] = useState<string>("");
  const [batch, setBatch] = useState<string>("");
  const [repPut, setRepPut] = useState<string>("");
  const [repPick, setRepPick] = useState<string>("");
  const [tank, setTank] = useState<string>("");
  const [line, setLine] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [plantCodes, setPlantCodes] = useState<DropdownOption[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const [shifts, setShifts] = useState<DropdownOption[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>("all");
  const token = Cookies.get('token');

  // Tank and Line mapping
  const tankOptions = [
    { value: "A", label: "Tank A" },
    { value: "E", label: "Tank E" },
    { value: "K", label: "Tank K" },
    { value: "G", label: "Tank G" },
  ];
  
  const lineOptionsMap = {
    "A": [
      { value: "A1", label: "A1" },
      { value: "A2", label: "A2" },
      { value: "A3", label: "A3" },
      { value: "A4", label: "A4" },
    ],
    "E": [
      { value: "E1", label: "E1" },
      { value: "E2", label: "E2" },
      { value: "E3", label: "E3" },
    ],
    "K": [
      { value: "K1", label: "K1" },
      { value: "K2", label: "K2" },
      { value: "K3", label: "K3" },
      { value: "K4", label: "K4" },
    ],
    "G": [
      { value: "G1", label: "G1" },
      { value: "G2", label: "G2" },
      { value: "G3", label: "G3" },
    ],
  };
  
  // Get available lines based on selected tank
  const availableLines = tank ? lineOptionsMap[tank as keyof typeof lineOptionsMap] : [];
  
  // Handle tank change
  const handleTankChange = (value: string) => {
    setTank(value === "all" ? "" : value);
    setLine(""); // Reset line when tank changes
  };

  // Handle shift change
  const handleShiftChange = (value: string) => {
    setSelectedShift(value === "all" ? "all" : value);
  };

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields: (keyof ReportData)[] = [
        'ORDER_NUMBER',
        'MATERIAL',
        'MATERIAL_TEXT',
        'BATCH',
        'SerialNo',
        'Location',
        'PutStatus',
        'PrintBy'
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
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

  const formatOrderNumber = (value: string): string => {
    if (value.length === 0) return value;
    return value.startsWith('000') ? value : '000' + value;
  };

  const formatMaterialCode = (value: string): string => {
    if (value.length === 0) return value;
    return value.startsWith('00000000') ? value : '00000000' + value;
  };

  const handleSearch = async () => {
        if (fromDate && toDate && fromDate > toDate) {
          toast({
            title: "Validation Error",
            description: "From Date cannot be greater than To Date",
            variant: "destructive",
          });
          return;
        }
    setIsLoading(true);
    const formattedOrderNo = formatOrderNumber(orderNo);
    const formattedItemCode = formatMaterialCode(itemCode);

    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/fg-label-printing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          FrmDate: fromDate ? DateTime.fromJSDate(fromDate).toFormat('yyyy-MM-dd') : '',
          ToDate: toDate ? DateTime.fromJSDate(toDate).toFormat('yyyy-MM-dd') : '',
          ORDER_NUMBER: formattedOrderNo,
          MATERIAL: formattedItemCode,
          BATCH: batch,
          Rep_Pick: repPick,
          Rep_Put: repPut,
          LINE: line === "all" ? "" : line,
          TANK: tank || "",
          Shift: selectedShift === "all" ? "" : selectedShift,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: ReportData[] = await response.json();
      setSearchClicked(true); // Move setSearchClicked here
      setReportData(data);
      setPage(1);
    } catch (error) {
      setSearchClicked(true); // Also set it in case of error
      console.error('Error fetching report data:', error);
      toast({ title: "Error", description: "Failed to fetch report data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPlantCode("");
    setOrderNo("");
    setItemCode("");
    setBatch("");
    setRepPut("");
    setRepPick("");
    setTank("");
    setLine("");
    setFromDate(new Date());
    setToDate(new Date());
    setReportData([]);
    setPage(1);
    setSearchClicked(false);
    setSelectedShift("all"); // Reset to "All Shifts" when clearing
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map((row, index) => ({
      'Sr No': index + 1,
      'Order Number': row.ORDER_NUMBER.replace(/^0+/, ''),
      'Material': row.MATERIAL.replace(/^0+/, ''),
      'Material Text': row.MATERIAL_TEXT,
      'Batch': row.BATCH,
      'Print Qty': row.PrintQty,
      'Serial No for BOX': row.SerialNo,
      'Print Date': DateTime.fromISO(row.PrintDate).setZone('GMT').toFormat('yyyy-MM-dd'),
      'Put Status': row.PutStatus ? "Done" : "Pending",
      'Location': row.Location,
      'Pick Status': row.PickBy ? "Done" : "Pending",
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FG Label Printing Report");
    const now = new Date();
    const formattedDateTime = DateTime.now().toFormat("yyyy-MM-dd_HH-mm-ss");
    XLSX.writeFile(workbook, `FG_LABEL_PRINTING_REPORT_${formattedDateTime}.xlsx`);
    // Clear shift after printing
    setSelectedShift("all");
  };

  const exportToPdf = (data: ReportData[], fileName: string): void => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const columns = [
      { header: 'Sr No', dataKey: 'srno' },
      { header: 'Order Number', dataKey: 'ORDER_NUMBER', formatter: (value: string) => value.replace(/^0+/, '') },
      { header: 'Material', dataKey: 'MATERIAL', formatter: (value: string) => value.replace(/^0+/, '') },
      { header: 'Material Text', dataKey: 'MATERIAL_TEXT' },
      { header: 'Batch', dataKey: 'BATCH' },
      { header: 'Print Qty', dataKey: 'PrintQty' },
      { header: 'Serial No for BOX', dataKey: 'SerialNo' },
      { header: 'Print Date', dataKey: 'PrintDate' },
      { header: 'Put Status', dataKey: 'PutStatus' },
      { header: 'Location', dataKey: 'Location' },
      { header: 'Pick Status', dataKey: 'PickStatus' },
    ];
    
    const formattedData = data.map((row, index) => ({
      srno: index + 1,
      ORDER_NUMBER: row.ORDER_NUMBER.replace(/^0+/, ''),
      MATERIAL: row.MATERIAL.replace(/^0+/, ''),
      MATERIAL_TEXT: row.MATERIAL_TEXT,
      BATCH: row.BATCH,
      PrintQty: row.PrintQty,
      SerialNo: row.SerialNo,
      PrintDate: DateTime.fromISO(row.PrintDate).setZone('GMT').toFormat('yyyy-MM-dd'),
      PutStatus: row.PutStatus || 'Pending',
      PickStatus: row.PickBy ? 'Done' : 'Pending',
      Location: row.Location || '-'
    }));

    doc.setFontSize(18);
    doc.text('Primary Pack Label Printing Report', 14, 22);

    (doc as any).autoTable({
      columns: columns,
      body: formattedData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
        10: { cellWidth: 20 },
      },
      headStyles: { fillColor: [66, 66, 66] },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    });
    const formattedDateTime = DateTime.now().toFormat("yyyy-MM-dd_HH-mm-ss");

    doc.save(`FG_LABEL_PRINTING_REPORT_${formattedDateTime}.pdf`);
    // Clear shift after printing
  };

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  // Add dashboard calculations
  const getDashboardStats = () => {
    const totalOrders = new Set(filteredData.map(item => item.ORDER_NUMBER)).size;
    const totalBatch = new Set(filteredData.map(item => item.BATCH)).size;
    const totalMaterials = new Set(filteredData.map(item => item.MATERIAL)).size;
    const totalPallets = new Set(filteredData.map(item => item.PalletBarcode)).size;
    const totalBoxes = filteredData.length;

    return { totalOrders , totalBatch, totalMaterials, totalBoxes,totalPallets };
  };

  const handleItemCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add your item code handling logic here
    setItemCode(e.target.value);
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add your batch handling logic here
    setBatch(e.target.value);
  };

  // Fetch shifts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/master/get-all-shift`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch shifts');
        
        const data: ShiftData[] = await response.json();
        const formattedShifts: DropdownOption[] = [
          { value: "all", label: "All Shifts" },
          ...data.map(shift => ({
            value: shift.Shift_Name,
            label: `${shift.Shift_Name} (${shift.Shift_Description})`,
          }))
        ];
        
        setShifts(formattedShifts);
        setSelectedShift("all"); // Default to "All Shifts"
      } catch (error) {
        console.error('Error fetching shifts:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch shifts"
        });
      }
    };
    
    fetchShifts();
  }, [token]);

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Primary Pack Label Printing Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tank</Label>
              <Select value={tank || "all"} onValueChange={handleTankChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Tank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tanks</SelectItem>
                  {tankOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Line</Label>
              <Select value={line || "all"} onValueChange={(value) => setLine(value === "all" ? "" : value)} disabled={!tank}>
                <SelectTrigger>
                  <SelectValue placeholder={tank ? "Select Line" : "Select Tank first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lines</SelectItem>
                  {availableLines.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shift">Shift</Label>
              <div className="mt-2">
                <CustomDropdown
                  placeholder="Select Shift..."
                  options={shifts}
                  value={selectedShift}
                  onValueChange={handleShiftChange}
                  disabled={false}
                  searchPlaceholder='Search Shift...'
                  emptyText='No shifts found'
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Order No</Label>
              <Input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Input value={itemCode} onChange={handleItemCodeChange} />
            </div>
            <div className="space-y-2">
              <Label>Batch</Label>
              <Input value={batch} onChange={handleBatchChange} />
            </div>
            <div className="space-y-2">
              <Label>Put Away</Label>
              <Select value={repPut} onValueChange={setRepPut}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Put Away Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pick Status</Label>
              <Select value={repPick} onValueChange={setRepPick}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Pick Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? DateTime.fromJSDate(fromDate).toLocaleString(DateTime.DATE_FULL) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => setFromDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? DateTime.fromJSDate(toDate).toLocaleString(DateTime.DATE_FULL) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => setToDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-between sm:flex-row flex-col mt-4">
            <div className="space-x-2">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button variant="outline" onClick={handleClear}>Clear</Button>
            </div>
            <div className="mt-4 sm:mt-0 space-x-2">
              <Button variant="outline" onClick={exportToExcel} disabled={filteredData.length === 0}>
                Export to Excel <FaFileExcel size={17} className="ml-2 text-green-500" />
              </Button>
              <Button variant="outline" onClick={() => exportToPdf(filteredData, 'Primary_Pack_Label_Report')} disabled={filteredData.length === 0}>
                Export To PDF <FaFilePdf size={17} className="ml-2 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(getDashboardStats()).map(([key, value], index) => {
              const gradients = [
              'shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]',
              'shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]',
              'shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]',
              'shadow-[0_0_15px_rgba(52,211,153,0.5)] hover:shadow-[0_0_20px_rgba(52,211,153,0.6)]',
              'shadow-[0_0_15px_rgba(77,211,47,0.5)] hover:shadow-[0_0_20px_rgba(52,211,100,0.6)]'
              ];

              return (
              <Card 
                key={key} 
                className={`transition-shadow duration-300 ${gradients[index]}`}
              >
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                </CardContent>
              </Card>
              );
            })}
            </div>

          <Card className="mt-5">
            <CardHeader className="underline underline-offset-4 text-center">
              Primary Pack Label Printing Report
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <Select
                    defaultValue="10"
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder={itemsPerPage.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TableSearch onSearch={handleSearchTerm} />
                </div>
              </div>
                <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead className="w-[60px]">Sr No</TableHead>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="w-[300px]">Material Text</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Print Qty</TableHead>
                  <TableHead>Serial No for BOX</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead className="w-[200px]">Shift</TableHead>
                  <TableHead className="w-[200px]">Print Date</TableHead>
                  <TableHead>Put Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Pick Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell>{row.ORDER_NUMBER.replace(/^0+/, '')}</TableCell>
                    <TableCell>{row.MATERIAL.replace(/^0+/, '')}</TableCell>
                    <TableCell className="w-[300px]">{row.MATERIAL_TEXT}</TableCell>
                    <TableCell>{row.BATCH}</TableCell>
                    <TableCell>{row.PrintQty}</TableCell>
                    <TableCell>{row.SerialNo}</TableCell>
                    <TableCell>{row.LINE}</TableCell>
                    <TableCell>{row.ShiftName}</TableCell>
                    <TableCell className="w-[200px]">{DateTime.fromISO(row.PrintDate).setZone('GMT').toFormat('yyyy-MM-dd')}</TableCell>
                    <TableCell>
                    <Badge className='dark:text-white  text-black hover:bg-red-500 ' variant={row.PutStatus ? "success" : "destructive"}>
                      {row.PutStatus || "Pending"}
                    </Badge>
                    </TableCell>
                    <TableCell>{row.Location || "-"}</TableCell>
                    <TableCell>
                    <Badge className='dark:text-white text-black hover:bg-red-500' variant={row.PickBy ? "success" : "destructive"}>
                      {row.PickBy ? "Done" : "Pending"}
                    </Badge>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
                </Table>
              <div className="flex justify-between items-center text-sm md:text-md mt-4">
                <div>
                  {filteredData.length > 0 
                    ? `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`
                    : 'No entries to show'}
                </div>
                {filteredData.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(page - 1)}
                          className={page === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= page - 1 && pageNumber <= page + 1)
                        ) {
                          return (
                            <PṇaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={pageNumber === page}
                                onClick={() => setPage(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === page - 2 ||
                          pageNumber === page + 2
                        ) {
                          return <PaginationEllipsis key={pageNumber} />;
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(page + 1)}
                          className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : searchClicked ? (
        <Card className="mt-5">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              No records found for the given date range and search criteria. 
              Try adjusting your filters or selecting a different date range.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default FGLabelPrinting;
```