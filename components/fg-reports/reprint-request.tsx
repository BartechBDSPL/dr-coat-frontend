'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { CalendarIcon, AlertCircle, Eye } from 'lucide-react';
import { DateTime } from 'luxon';
import { Loading } from '@/components/loading';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { getUserID } from '@/utils/getFromSession';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import TableSearch from '@/utils/tableSearch';
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

interface DropdownOption {
  value: string;
  label: string;
}

interface PrinterData {
  printer_name: string;
  printer_ip: string;
  dpi: string;
}

interface ReprintData {
  production_order_no: string;
  item_code: string;
  item_description: string;
  lot_no: string;
  customer_no: string;
  customer_name: string;
  finished_quantity: number;
  uom: string;
  reprint_by: string;
  quantity: number;
  serial_no: string;
  print_quantity: number;
  print_date: string;
  reprint_reason: string;
}

interface ReprintInsertData {
  request_by: string;
  serial_no: string;
  reprint_reason: string;
}

const ReprintRequest: React.FC = () => {
  const [productionOrderNo, setProductionOrderNo] = useState<string>('');
  const [itemCode, setItemCode] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [lotNo, setLotNo] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<ReprintData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showReprintDialog, setShowReprintDialog] = useState(false);
  const [reprintReason, setReprintReason] = useState('');
  const token = Cookies.get('token');

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [approvedItemsPerPage, setApprovedItemsPerPage] = useState(10);
  const [approvedCurrentPage, setApprovedCurrentPage] = useState(1);
  const [approvedSearchTerm, setApprovedSearchTerm] = useState('');
  const [isLoadingApproved, setIsLoadingApproved] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedPrintRequest, setSelectedPrintRequest] = useState<any>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      const searchableFields: (keyof ReprintData)[] = [
        'production_order_no',
        'item_code',
        'item_description',
        'lot_no',
        'customer_no',
        'customer_name',
        'serial_no',
        'uom',
        'reprint_by',
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

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  const handleSearchTable = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1);
  }, []);

  const fetchApprovedRequests = async () => {
    setIsLoadingApproved(true);
    try {
      const response = await fetch(
        '/api/transactions/reprint-request-get-printing-pending',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setApprovedRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching approved requests:', error);
      toast.error('Failed to fetch approved requests');
      setApprovedRequests([]);
    } finally {
      setIsLoadingApproved(false);
    }
  };

  const fetchPrinters = async () => {
    try {
      const response = await fetch('/api/hht/printer-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch printers');
      const data: PrinterData[] = await response.json();
      setPrinters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching printers:', error);
      toast.error('Failed to fetch printers');
    }
  };

  useEffect(() => {
    fetchApprovedRequests();
    fetchPrinters();
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const filteredApprovedData = useMemo(() => {
    return approvedRequests.filter(item => {
      const searchableFields = [
        'request_by',
        'serial_no',
        'status',
        'approved_by',
        'reprint_reason',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value
            .toString()
            .toLowerCase()
            .includes(approvedSearchTerm.toLowerCase())
        );
      });
    });
  }, [approvedRequests, approvedSearchTerm]);

  const paginatedApprovedData = useMemo(() => {
    const startIndex = (approvedCurrentPage - 1) * approvedItemsPerPage;
    return filteredApprovedData.slice(
      startIndex,
      startIndex + approvedItemsPerPage
    );
  }, [filteredApprovedData, approvedCurrentPage, approvedItemsPerPage]);

  const totalApprovedPages = useMemo(
    () => Math.ceil(filteredApprovedData.length / approvedItemsPerPage),
    [filteredApprovedData, approvedItemsPerPage]
  );

  const handleApprovedSearch = useCallback((term: string) => {
    setApprovedSearchTerm(term.trim());
    setApprovedCurrentPage(1);
  }, []);

  const handleApprovedPageChange = useCallback((newPage: number) => {
    setApprovedCurrentPage(newPage);
  }, []);

  const handleApprovedItemsPerPageChange = useCallback((value: string) => {
    setApprovedItemsPerPage(Number(value));
    setApprovedCurrentPage(1);
  }, []);

  const handleSearch = async () => {
    if (fromDate && toDate && fromDate > toDate) {
      toast.error('From Date cannot be greater than To Date');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/reprint/fg-reprint-label-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          production_order_no: productionOrderNo.trim(),
          item_code: itemCode.trim(),
          item_description: itemDescription.trim(),
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
      const data: ReprintData[] = await response.json();
      setSearchClicked(true);
      setReportData(data);
      setSelectedItems(new Set());
      setCurrentPage(1);
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
    setProductionOrderNo('');
    setItemCode('');
    setItemDescription('');
    setLotNo('');
    setFromDate(new Date());
    setToDate(new Date());
    setReportData([]);
    setSearchClicked(false);
    setSelectedItems(new Set());
    setReprintReason('');
    setSearchTerm('');
    setCurrentPage(1);
    setItemsPerPage(10);
  };

  const handleSelectItem = (serialNo: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(serialNo)) {
      newSelected.delete(serialNo);
    } else {
      newSelected.add(serialNo);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredData.map(item => item.serial_no)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleReprintClick = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to reprint');
      return;
    }
    setShowReprintDialog(true);
  };

  const handleReprintConfirm = async () => {
    if (!reprintReason.trim()) {
      toast.error('Please enter a reason for reprinting');
      return;
    }

    setIsLoading(true);

    try {
      const serialNumbers = Array.from(selectedItems).join('$');

      const reprintData = {
        request_by: getUserID(),
        serial_no: serialNumbers,
        reprint_reason: reprintReason.trim(),
      };

      const response = await fetch(`/api/transactions/reprint-request-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reprintData),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();

      if (result.Status === 'F') {
        toast.error(result.Message || 'Failed to submit reprint request');
        return;
      }

      if (result.Status !== 'T') {
        toast.error('Unexpected response from server');
        return;
      }

      toast.success(
        `Successfully submitted reprint request for ${selectedItems.size} label(s)`
      );
      setShowReprintDialog(false);
      setSelectedItems(new Set());
      setReprintReason('');

      setProductionOrderNo('');
      setItemCode('');
      setItemDescription('');
      setLotNo('');
      setFromDate(new Date());
      setToDate(new Date());
      setReportData([]);
      setSearchClicked(false);

      // Refresh the pending print requests after successful submission
      fetchApprovedRequests();
    } catch (error) {
      console.error('Error submitting reprint request:', error);
      toast.error('Failed to submit reprint request');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintClick = (request: any) => {
    setSelectedPrintRequest(request);
    setShowPrintDialog(true);
  };

  const handlePrintConfirm = async () => {
    if (!selectedPrinter) {
      toast.error('Please select a printer');
      return;
    }

    if (!selectedPrintRequest) return;

    const printerData = printers.find(p => p.printer_ip === selectedPrinter);

    if (!printerData) {
      toast.error('Invalid printer selection');
      return;
    }

    setIsPrinting(true);

    try {
      const response = await fetch('/api/reprint/fg-reprint-label-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sr_no: selectedPrintRequest.sr_no,
          reprint_by: getUserID(),
          printer_name: printerData.printer_name,
          printer_ip: printerData.printer_ip,
          serial_no: selectedPrintRequest.serial_no,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();

      if (result.Status === 'F') {
        toast.error(result.Message || 'Failed to print labels');
        return;
      }

      toast.success(result.Message || 'Labels printed successfully');
      setShowPrintDialog(false);
      setSelectedPrintRequest(null);
      setSelectedPrinter('');
      fetchApprovedRequests();
    } catch (error) {
      console.error('Error printing labels:', error);
      toast.error('Failed to print labels');
    } finally {
      setIsPrinting(false);
    }
  };

  const getDashboardStats = () => {
    const totalOrders = new Set(
      reportData.map(item => item.production_order_no)
    ).size;
    const totalItems = new Set(reportData.map(item => item.item_code)).size;
    const totalLots = new Set(reportData.map(item => item.lot_no)).size;
    const totalLabels = reportData.length;

    const uniqueCustomers = new Set(reportData.map(item => item.customer_no))
      .size;

    return {
      totalOrders,
      totalItems,
      totalLots,
      totalLabels,
      uniqueCustomers,
    };
  };

  const stats = getDashboardStats();

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Reprint Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="productionOrderNo">Production Order No</Label>
              <Input
                id="productionOrderNo"
                value={productionOrderNo}
                onChange={e => setProductionOrderNo(e.target.value)}
                placeholder="Enter Production Order No"
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.uniqueCustomers}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <CardTitle>
                  Label Data ({filteredData.length} records)
                </CardTitle>
                <Button
                  onClick={handleReprintClick}
                  disabled={selectedItems.size === 0}
                  size="sm"
                >
                  Request Reprint ({selectedItems.size})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Show</span>
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
                  <span className="text-sm">entries</span>
                </div>
                <div className="flex w-full items-center space-x-2 sm:w-auto">
                  <TableSearch onSearch={handleSearchTable} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedItems.size === filteredData.length &&
                            filteredData.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sr No</TableHead>
                      <TableHead>Production Order No</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Description</TableHead>
                      <TableHead>Lot No</TableHead>
                      <TableHead>Customer No</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Serial No</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Print Quantity</TableHead>
                      <TableHead>Print Date</TableHead>
                      <TableHead>Print By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row, index) => (
                      <TableRow key={row.serial_no}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(row.serial_no)}
                            onCheckedChange={() =>
                              handleSelectItem(row.serial_no)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{row.production_order_no}</TableCell>
                        <TableCell>{row.item_code}</TableCell>
                        <TableCell>{row.item_description}</TableCell>
                        <TableCell>{row.lot_no}</TableCell>
                        <TableCell>{row.customer_no}</TableCell>
                        <TableCell>{row.customer_name}</TableCell>
                        <TableCell>{row.serial_no}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{row.uom}</TableCell>
                        <TableCell>{row.print_quantity}</TableCell>
                        <TableCell>
                          {DateTime.fromISO(row.print_date)
                            .setZone('GMT')
                            .toFormat('yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>{row.reprint_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col items-center justify-between gap-4 text-sm sm:flex-row md:text-base">
                <div className="text-center sm:text-left">
                  {filteredData.length > 0
                    ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length} entries`
                    : 'No entries to show'}
                </div>
                {filteredData.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={pageNumber === currentPage}
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <PaginationEllipsis key={pageNumber} />;
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
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

      <Dialog open={showReprintDialog} onOpenChange={setShowReprintDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submit Reprint Request</DialogTitle>
            <DialogDescription>
              Submit reprint request for {selectedItems.size} selected item(s).
              Request will be processed after approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Reprint *</Label>
              <Textarea
                id="reason"
                value={reprintReason}
                onChange={e => setReprintReason(e.target.value)}
                placeholder="Enter reason for reprinting labels"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReprintDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReprintConfirm} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>
            Approved Requests - Pending Print ({filteredApprovedData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Show</span>
              <Select
                value={approvedItemsPerPage.toString()}
                onValueChange={handleApprovedItemsPerPageChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={approvedItemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">entries</span>
            </div>
            <div className="flex w-full items-center space-x-2 sm:w-auto">
              <TableSearch onSearch={handleApprovedSearch} />
            </div>
          </div>

          {isLoadingApproved ? (
            <div className="flex justify-center py-10">
              <Loading size="md" label="Loading approved requests..." />
            </div>
          ) : filteredApprovedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                No approved requests pending print
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Action
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Sr No
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Requested By
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Request Date
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        View Serials
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Total Serials
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Approved By
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Approved Date
                      </TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-foreground">
                        Reason
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApprovedData.map(request => (
                      <TableRow key={request.sr_no}>
                        <TableCell>
                          {request.approved_by && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintClick(request)}
                              className="h-8 border-border px-2 py-1 text-xs hover:bg-primary/20"
                            >
                              Print
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.sr_no}
                        </TableCell>
                        <TableCell>{request.request_by}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {DateTime.fromISO(request.request_date)
                            .setZone('GMT')
                            .toFormat('yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSerials(request.serial_no.split('$'));
                              setDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-primary/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>{request.total_number_of_serial}</TableCell>
                        <TableCell>{request.approved_by || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {request.approved_date
                            ? DateTime.fromISO(request.approved_date)
                                .setZone('GMT')
                                .toFormat('yyyy-MM-dd HH:mm:ss')
                            : '-'}
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={request.reprint_reason}
                        >
                          {request.reprint_reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col items-center justify-between gap-4 text-sm sm:flex-row md:text-base">
                <div className="text-center sm:text-left">
                  {filteredApprovedData.length > 0
                    ? `Showing ${(approvedCurrentPage - 1) * approvedItemsPerPage + 1} to ${Math.min(approvedCurrentPage * approvedItemsPerPage, filteredApprovedData.length)} of ${filteredApprovedData.length} entries`
                    : 'No entries to show'}
                </div>
                {filteredApprovedData.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handleApprovedPageChange(approvedCurrentPage - 1)
                          }
                          className={
                            approvedCurrentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalApprovedPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalApprovedPages ||
                          (pageNumber >= approvedCurrentPage - 1 &&
                            pageNumber <= approvedCurrentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={pageNumber === approvedCurrentPage}
                                onClick={() =>
                                  handleApprovedPageChange(pageNumber)
                                }
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === approvedCurrentPage - 2 ||
                          pageNumber === approvedCurrentPage + 2
                        ) {
                          return <PaginationEllipsis key={pageNumber} />;
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handleApprovedPageChange(approvedCurrentPage + 1)
                          }
                          className={
                            approvedCurrentPage === totalApprovedPages
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Print Labels</DialogTitle>
            <DialogDescription>
              Select a printer to print{' '}
              {selectedPrintRequest?.total_number_of_serial} label(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="serial-numbers">
                Serial Numbers ({selectedPrintRequest?.total_number_of_serial})
              </Label>
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
                {selectedPrintRequest?.serial_no
                  .split('$')
                  .map((serial: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
                    >
                      <span className="min-w-[2rem] text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="flex-1 font-mono text-sm text-foreground">
                        {serial}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="printer">Select Printer *</Label>
              <Select
                value={selectedPrinter}
                onValueChange={setSelectedPrinter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a printer" />
                </SelectTrigger>
                <SelectContent>
                  {printers.map(printer => (
                    <SelectItem
                      key={printer.printer_ip}
                      value={printer.printer_ip}
                    >
                      {printer.printer_name} - {printer.printer_ip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPrintDialog(false);
                setSelectedPrinter('');
                setSelectedPrintRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePrintConfirm}
              disabled={isPrinting || !selectedPrinter}
            >
              {isPrinting ? 'Printing...' : 'Print'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Serial Numbers ({selectedSerials.length})
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
            {selectedSerials.map((serial, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md border border-border bg-muted p-3"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="flex-1 font-mono text-sm text-foreground">
                  {serial}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReprintRequest;
