'use client';

import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { DateTime } from 'luxon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { getUserID } from '@/utils/getFromSession';
import CustomDropdown from '@/components/CustomDropdown';
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
  production_order_no: string;
  item_code: string;
  item_description: string;
  lot_no: string;
  customer_no: string;
  customer_name: string;
  finished_quantity: number;
  uom: string;
  quantity: number;
  serial_no: string;
  nt: number;
  print_quantity: number;
  reprint_by: string;
  reprint_reason: string;
  printer_ip: string;
  dpi: string;
}

const FGReprintLabelPrinting: React.FC = () => {
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
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [printerOptions, setPrinterOptions] = useState<DropdownOption[]>([]);
  const [isFetchingPrinters, setIsFetchingPrinters] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    setIsFetchingPrinters(true);
    try {
      const response = await fetch(`/api/hht/printer-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch printers');
      }

      const data: PrinterData[] = await response.json();
      setPrinters(data);

      const options: DropdownOption[] = data.map(printer => ({
        value: printer.printer_ip,
        label: `${printer.printer_name} - ${printer.printer_ip}`,
      }));

      setPrinterOptions(options);
    } catch (error: any) {
      console.error('Error fetching printers:', error);
      toast.error('Failed to fetch printers');
    } finally {
      setIsFetchingPrinters(false);
    }
  };

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
    setSelectedPrinter('');
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
      setSelectedItems(new Set(reportData.map(item => item.serial_no)));
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

    if (!selectedPrinter) {
      toast.error('Please select a printer');
      return;
    }

    // Get selected printer data
    const printerData = printers.find(p => p.printer_ip === selectedPrinter);

    if (!printerData) {
      toast.error('Invalid printer selection');
      return;
    }

    setIsLoading(true);

    try {
      const selectedData = reportData.filter(item =>
        selectedItems.has(item.serial_no)
      );

      for (const item of selectedData) {
        const reprintData: ReprintInsertData = {
          production_order_no: item.production_order_no,
          item_code: item.item_code,
          item_description: item.item_description,
          lot_no: item.lot_no,
          customer_no: item.customer_no,
          customer_name: item.customer_name,
          finished_quantity: item.finished_quantity,
          uom: item.uom,
          quantity: item.quantity,
          serial_no: item.serial_no,
          nt: 1,
          print_quantity: item.print_quantity,
          reprint_by: getUserID(),
          reprint_reason: reprintReason.trim(),
          printer_ip: printerData.printer_ip,
          dpi: printerData.dpi,
        };

        const response = await fetch(`/api/reprint/fg-reprint-label-insert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reprintData),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();

        if (result.Status !== 'T') {
          throw new Error(result.Message || 'Failed to insert reprint record');
        }
      }

      toast.success(`Successfully reprinted ${selectedItems.size} label(s)`);
      setShowReprintDialog(false);
      setSelectedItems(new Set());
      setReprintReason('');
      setSelectedPrinter('');

      // Clear search form and results
      setProductionOrderNo('');
      setItemCode('');
      setItemDescription('');
      setLotNo('');
      setFromDate(new Date());
      setToDate(new Date());
      setReportData([]);
      setSearchClicked(false);

      // Refresh data (though it will be empty now)
      handleSearch();
    } catch (error) {
      console.error('Error reprinting labels:', error);
      toast.error('Failed to reprint labels');
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics
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
          <CardTitle>FG Reprint Label Printing</CardTitle>
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
          {/* Analytics Cards */}
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

          {/* Data Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <CardTitle>Label Data ({reportData.length} records)</CardTitle>
                <Button
                  onClick={handleReprintClick}
                  disabled={selectedItems.size === 0}
                  size="sm"
                >
                  Reprint Selected ({selectedItems.size})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedItems.size === reportData.length &&
                            reportData.length > 0
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
                    {reportData.map((row, index) => (
                      <TableRow key={row.serial_no}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(row.serial_no)}
                            onCheckedChange={() => handleSelectItem(row.serial_no)}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
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
            <DialogTitle>Reprint Labels</DialogTitle>
            <DialogDescription>
              Enter reprint details for {selectedItems.size} selected item(s)
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
            <div className="grid gap-2">
              <Label htmlFor="printer">Assign Printer *</Label>
              <CustomDropdown
                options={printerOptions}
                value={selectedPrinter}
                onValueChange={setSelectedPrinter}
                placeholder="Select printer..."
                searchPlaceholder="Search printers..."
                emptyText="No printers found"
                loading={isFetchingPrinters}
                disabled={isFetchingPrinters || printerOptions.length === 0}
              />
              {printerOptions.length === 0 && !isFetchingPrinters && (
                <p className="text-xs text-red-500">
                  No printers available. Please configure printers first.
                </p>
              )}
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
              {isLoading ? 'Processing...' : 'Confirm Reprint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FGReprintLabelPrinting;
