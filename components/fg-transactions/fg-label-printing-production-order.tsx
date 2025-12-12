'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Printer } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';
import {
  Pagination,
  PaginationContent,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateTime } from 'luxon';
import { getUserID } from '@/utils/getFromSession';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RecentProductionOrder {
  production_order_no: string;
}

interface ProductionOrderDetails {
  Status: string;
  Message: string;
  id: number;
  qc_status: string;
  production_order_no: string;
  line_no: string;
  item_code: string;
  item_description: string;
  quantity: number;
  customer_no: string;
  customer_name: string;
  due_date: string;
  location_code: string;
  starting_date: string;
  ending_date: string;
  uom_code: string;
  remaining_quantity: number;
  finished_quantity: number;
  sub_contracting_order_no: string;
  sub_contractor_code: string;
  entry_no: string;
  lot_no: string;
  printed_qty: number | null;
  remaining_qty: number;
  created_by: string | null;
  created_date: string;
  updated_by?: string;
  updated_date?: string;
}

interface WeightInfo {
  baseWeight: number;
  tareWeight: number;
  totalWeight: number;
}

interface SerialNumber {
  serialNo: string;
  qty: number;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface PrinterData {
  printer_name: string;
  printer_ip: string;
  dpi: string;
}

const FGLabelPrintingProductionOrder: React.FC = () => {
  const [productionOrderNo, setProductionOrderNo] = useState('');
  const [orderDetails, setOrderDetails] =
    useState<ProductionOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<DropdownOption[]>([]);
  const [qty, setQty] = useState<string>('');
  const [baseWeight, setBaseWeight] = useState<string>('');
  const [tareWeight, setTareWeight] = useState<string>('');
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [isGeneratingSerials, setIsGeneratingSerials] = useState(false);
  const [isFetchingRecentOrders, setIsFetchingRecentOrders] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [selectedMfgDate, setSelectedMfgDate] = useState<Date | undefined>();
  const [selectedExpDate, setSelectedExpDate] = useState<Date | undefined>();
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [isPrinting, setIsPrinting] = useState(false);
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [printerOptions, setPrinterOptions] = useState<DropdownOption[]>([]);
  const [isFetchingPrinters, setIsFetchingPrinters] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const mfgDateRef = useRef<HTMLButtonElement | null>(null);
  const expDateRef = useRef<HTMLButtonElement | null>(null);
  const printerRef = useRef<HTMLButtonElement | null>(null);
  const orderNoRef = useRef<HTMLButtonElement | null>(null);
  const baseWeightRef = useRef<HTMLInputElement>(null);
  const tareWeightRef = useRef<HTMLInputElement>(null);
  const serialNumbersCardRef = useRef<HTMLDivElement>(null);
  const token = Cookies.get('token');

  const totalWeight =
    baseWeight && tareWeight
      ? (Number(baseWeight) + Number(tareWeight)).toFixed(2)
      : '';

  useEffect(() => {
    orderNoRef.current?.focus();
    fetchRecentOrders();
    fetchPrinters();
  }, []);

  useEffect(() => {
    if (selectedMfgDate) {
      const year = selectedMfgDate.getFullYear();
      const month = String(selectedMfgDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedMfgDate.getDate()).padStart(2, '0');
      setMfgDate(`${year}-${month}-${day}`);
    } else {
      setMfgDate('');
    }
  }, [selectedMfgDate]);

  useEffect(() => {
    if (selectedExpDate) {
      const year = selectedExpDate.getFullYear();
      const month = String(selectedExpDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedExpDate.getDate()).padStart(2, '0');
      setExpDate(`${year}-${month}-${day}`);
    } else {
      setExpDate('');
    }
  }, [selectedExpDate]);

  const fetchRecentOrders = async () => {
    setIsFetchingRecentOrders(true);
    try {
      const response = await fetch(
        `/api/transactions/production-order/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recent orders');
      }

      const data: RecentProductionOrder[] = await response.json();

      const dropdownOptions: DropdownOption[] = data.map(order => ({
        value: order.production_order_no,
        label: order.production_order_no,
      }));

      setRecentOrders(dropdownOptions);
    } catch (error: any) {
      console.error('Error fetching recent orders:', error);
      toast.error('Failed to fetch recent orders');
    } finally {
      setIsFetchingRecentOrders(false);
    }
  };

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

  const handleGetDetails = async () => {
    if (!productionOrderNo.trim()) {
      toast.error('Please enter or select a production order number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/transactions/production-order/details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            production_order_no: productionOrderNo.trim(),
            created_by: getUserID(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to fetch production order details'
        );
      }

      const data: ProductionOrderDetails = await response.json();

      if (data.Status === 'F') {
        toast.error(data.Message || 'Failed to fetch order details');
        setOrderDetails(null);
        return;
      }

      setOrderDetails(data);
      setSerialNumbers([]);
      setQty(data.remaining_qty.toString());
      setBaseWeight('');
      setTareWeight('');
      toast.success(data.Message || 'Order details fetched successfully');
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error(error.message || 'Failed to fetch order details');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBaseWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const baseWeightValue = Number(value);

    if (value === '') {
      setBaseWeight('');
      setSerialNumbers([]);
      return;
    }

    if (baseWeightValue <= 0) {
      toast.error('Base weight must be greater than 0');
      return;
    }

    if (!orderDetails) {
      toast.error('Please fetch order details first');
      return;
    }

    const totalQty = Number(qty);

    if (baseWeightValue > totalQty) {
      toast.error(
        `Base weight cannot be greater than total quantity (${totalQty})`
      );
      return;
    }

    setBaseWeight(value);
    setSerialNumbers([]);
  };

  const handleTareWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const tareWeightValue = Number(value);

    if (value === '') {
      setTareWeight('');
      setSerialNumbers([]);
      return;
    }

    if (tareWeightValue < 0) {
      toast.error('Tare weight cannot be negative');
      return;
    }

    setTareWeight(value);
    setSerialNumbers([]);
  };

  const generateSerialNumbers = async () => {
    if (!baseWeight || Number(baseWeight) <= 0) {
      toast.error('Please enter a valid base weight');
      return;
    }

    if (!tareWeight || Number(tareWeight) < 0) {
      toast.error('Please enter a valid tare weight');
      return;
    }

    if (!qty || Number(qty) <= 0) {
      toast.error('Please enter a valid total quantity');
      return;
    }

    if (!orderDetails) {
      toast.error('Please fetch order details first');
      return;
    }

    const totalQty = Number(qty);
    const baseWeightValue = Number(baseWeight);

    const numFullLabels = Math.floor(totalQty / baseWeightValue);
    const remainder = totalQty % baseWeightValue;
    const totalLabels = numFullLabels + (remainder > 0 ? 1 : 0);

    if (totalLabels <= 0) {
      toast.error('Total quantity must be at least equal to base weight');
      return;
    }

    setIsGeneratingSerials(true);

    try {
      const response = await fetch(
        `/api/transactions/production-order/serial-no`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            production_order_no: orderDetails.production_order_no,
            item_code: orderDetails.item_code,
            lot_no: orderDetails.lot_no,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch serial number');
      }

      const { sr_no } = await response.json();
      const startingSerialNo = sr_no + 1;

      const generatedSerials: SerialNumber[] = [];

      for (let i = 0; i < numFullLabels; i++) {
        const serialNo = `${orderDetails.production_order_no}|${orderDetails.item_code}|${orderDetails.lot_no}|${startingSerialNo + i}`;

        generatedSerials.push({
          serialNo,
          qty: baseWeightValue,
        });
      }

      if (remainder > 0) {
        const serialNo = `${orderDetails.production_order_no}|${orderDetails.item_code}|${orderDetails.lot_no}|${startingSerialNo + numFullLabels}`;

        generatedSerials.push({
          serialNo,
          qty: remainder,
        });
      }

      setSerialNumbers(generatedSerials);
      setCurrentPage(1);
      toast.success(
        `Generated ${totalLabels} label${totalLabels > 1 ? 's' : ''}`
      );

      setTimeout(() => {
        serialNumbersCardRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error generating serial numbers:', error);
      toast.error(error.message || 'Failed to generate serial numbers');
    } finally {
      setIsGeneratingSerials(false);
    }
  };

  const handleSerialQtyChange = (index: number, value: string) => {
    const qtyValue = Number(value);

    if (qtyValue < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    const updatedSerials = [...serialNumbers];
    updatedSerials[index].qty = qtyValue;

    const totalSerialQty = updatedSerials.reduce(
      (sum, serial) => sum + serial.qty,
      0
    );
    const expectedQty = Number(qty);

    if (totalSerialQty > expectedQty) {
      toast.error(
        `Total quantity (${totalSerialQty.toFixed(2)}) cannot exceed the expected quantity (${expectedQty.toFixed(2)}). Please adjust the quantities.`,
        {
          duration: 5000,
        }
      );
      return;
    }

    setSerialNumbers(updatedSerials);
  };

  const validateTotalQuantity = (): boolean => {
    if (!orderDetails || !qty) return false;

    const totalSerialQty =
      Math.round(
        serialNumbers.reduce((sum, serial) => sum + serial.qty, 0) * 100
      ) / 100;
    const expectedQty = Math.round(Number(qty) * 100) / 100;

    if (Math.abs(totalSerialQty - expectedQty) > 0.01) {
      toast.error(
        `Total quantity (${totalSerialQty.toFixed(2)}) must equal entered quantity (${expectedQty.toFixed(2)})`
      );
      return false;
    }

    return true;
  };

  const handlePrintLabels = async () => {
    if (serialNumbers.length === 0) {
      toast.error('Please generate serial numbers first');
      return;
    }

    if (!validateTotalQuantity()) {
      return;
    }

    const missingFields: string[] = [];
    if (!productionOrderNo.trim()) missingFields.push('productionOrderNo');
    if (!baseWeight.trim()) missingFields.push('baseWeight');
    if (!tareWeight.trim()) missingFields.push('tareWeight');
    if (!qty.trim()) missingFields.push('qty');
    if (!selectedMfgDate) missingFields.push('mfgDate');
    if (!selectedExpDate) missingFields.push('expDate');
    if (!selectedPrinter) missingFields.push('printer');

    setInvalidFields(new Set(missingFields));

    if (missingFields.length > 0) {
      const fieldLabels: { [key: string]: string } = {
        productionOrderNo: 'Production Order No',
        baseWeight: 'Base Weight',
        tareWeight: 'Tare Weight',
        qty: 'Total Quantity',
        mfgDate: 'Manufacturing Date',
        expDate: 'Expiry Date',
        printer: 'Assign Printer',
      };
      toast.error(
        `Please fill the following required fields: ${missingFields.map(f => fieldLabels[f]).join(', ')}`
      );
      // Smooth scroll and focus the first invalid field for improved UX
      const firstInvalid = missingFields[0];
      switch (firstInvalid) {
        case 'productionOrderNo':
          orderNoRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          orderNoRef.current?.focus();
          break;
        case 'baseWeight':
          baseWeightRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          baseWeightRef.current?.focus();
          break;
        case 'tareWeight':
          tareWeightRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          tareWeightRef.current?.focus();
          break;
        case 'mfgDate':
          mfgDateRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          mfgDateRef.current?.focus();
          break;
        case 'expDate':
          expDateRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          expDateRef.current?.focus();
          break;
        case 'printer':
          printerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          printerRef.current?.focus();
          break;
      }
      return;
    }

    if (
      selectedMfgDate &&
      selectedExpDate &&
      selectedExpDate < selectedMfgDate
    ) {
      toast.error('Expiry date cannot be older than manufacturing date');
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const confirmPrintLabels = async () => {
    setIsConfirmDialogOpen(false);

    const printerData = printers.find(p => p.printer_ip === selectedPrinter);

    if (!printerData) {
      toast.error('Invalid printer selection');
      return;
    }

    setIsPrinting(true);

    try {
      const serialNo = serialNumbers.map(s => s.serialNo).join('$');
      const printQuantity = serialNumbers.map(s => s.qty.toString()).join('$');
      const numLabels = serialNumbers.length;

      const payload = {
        production_order_no: orderDetails!.production_order_no,
        item_code: orderDetails!.item_code,
        item_description: orderDetails!.item_description,
        lot_no: orderDetails!.lot_no,
        customer_no: orderDetails!.customer_no,
        customer_name: orderDetails!.customer_name || '',
        finished_quantity: orderDetails!.finished_quantity,
        uom: orderDetails!.uom_code,
        quantity: orderDetails!.quantity,
        serial_no: serialNo,
        print_by: getUserID(),
        print_quantity: printQuantity,
        mfg_date: mfgDate,
        exp_date: expDate,
        printed_qty: Number(qty),
        remaining_qty: orderDetails!.remaining_qty - Number(qty),
        printer_ip: printerData.printer_ip,
        dpi: printerData.dpi,
        base_weight: Number(baseWeight),
        tare_weight: Number(tareWeight),
        total_weight: Number(totalWeight),
      };

      const response = await fetch(
        `/api/transactions/fg-label-printing-insert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to print labels');
      }

      const data = await response.json();

      if (data.Status === 'F') {
        toast.error(data.Message || 'Failed to print labels');
        return;
      }

      toast.success(data.Message || 'Labels printed successfully!');

      setProductionOrderNo('');
      setOrderDetails(null);
      setQty('');
      setBaseWeight('');
      setTareWeight('');
      setSerialNumbers([]);
      setCurrentPage(1);
      setMfgDate('');
      setExpDate('');
      setSelectedMfgDate(undefined);
      setSelectedExpDate(undefined);
      setSelectedPrinter('');
      setInvalidFields(new Set());
      orderNoRef.current?.focus();

      fetchRecentOrders();
    } catch (error: any) {
      console.error('Error printing labels:', error);
      toast.error(error.message || 'Failed to print labels');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReset = () => {
    setProductionOrderNo('');
    setOrderDetails(null);
    setQty('');
    setBaseWeight('');
    setTareWeight('');
    setSerialNumbers([]);
    setCurrentPage(1);
    setMfgDate('');
    setExpDate('');
    setSelectedMfgDate(undefined);
    setSelectedExpDate(undefined);
    setSelectedPrinter('');
    setInvalidFields(new Set());
    orderNoRef.current?.focus();
  };

  const handleOrderNoChange = (value: string) => {
    setProductionOrderNo(value.trim());
  };

  const handleOrderNoCustomChange = (value: string) => {
    setProductionOrderNo(value.trim());
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSerials = serialNumbers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(serialNumbers.length / itemsPerPage);

  return (
    <div className="mt-5 space-y-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes field-blink {
            0%, 100% {
              opacity: 1;
              background-color: transparent;
              border-color: hsl(var(--input));
            }
            50% {
              opacity: 1;
              background-color: rgba(255, 0, 0, 0.16);
              border-color: #ff0000;
              box-shadow: 0 0 12px rgba(255, 0, 0, 0.2);
            }
          }
          .field-blink {
            animation: field-blink 0.7s ease-in-out 6;
            border-width: 1px;
          }
          .field-blink:focus {
            outline: 3px solid rgba(255, 0, 0, 0.18);
            outline-offset: 2px;
          }
        `,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Production Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="productionOrderNo">
                Production Order No <span className="text-red-500">*</span>
              </Label>
              <div
                className={
                  invalidFields.has('productionOrderNo') ? 'field-blink' : ''
                }
              >
                <CustomDropdown
                  aria-invalid={invalidFields.has('productionOrderNo')}
                  options={recentOrders}
                  value={productionOrderNo}
                  onValueChange={handleOrderNoChange}
                  onCustomValueChange={handleOrderNoCustomChange}
                  placeholder="Select or enter production order"
                  searchPlaceholder="Search orders..."
                  emptyText="No recent orders found"
                  allowCustomValue={true}
                  loading={isFetchingRecentOrders}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleGetDetails}
                disabled={!productionOrderNo.trim() || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Details
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {orderDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="production_order_no">Production Order No</Label>
                <Input
                  id="production_order_no"
                  value={orderDetails.production_order_no}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_code">Item Code</Label>
                <Input id="item_code" value={orderDetails.item_code} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_description">Item Description</Label>
                <Input
                  id="item_description"
                  value={orderDetails.item_description}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot_no">Lot No</Label>
                <Input id="lot_no" value={orderDetails.lot_no} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" value={orderDetails.quantity} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uom_code">UOM</Label>
                <Input id="uom_code" value={orderDetails.uom_code} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_code">Location Code</Label>
                <Input
                  id="location_code"
                  value={orderDetails.location_code}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qc_status">QC Status</Label>
                <Input id="qc_status" value={orderDetails.qc_status} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={orderDetails.customer_name || '-'}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="starting_date">Starting Date</Label>
                <Input
                  id="starting_date"
                  value={new Date(
                    orderDetails.starting_date
                  ).toLocaleDateString()}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ending_date">Ending Date</Label>
                <Input
                  id="ending_date"
                  value={new Date(
                    orderDetails.ending_date
                  ).toLocaleDateString()}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry_no">Entry No</Label>
                <Input id="entry_no" value={orderDetails.entry_no} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {orderDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Label Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Description</TableHead>
                      <TableHead>Lot No</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Remaining Print Qty</TableHead>
                      <TableHead>Total Qty</TableHead>
                      <TableHead>
                        Base Weight ({orderDetails.uom_code}){' '}
                        <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead>
                        Tare Weight ({orderDetails.uom_code}){' '}
                        <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead>
                        Total Weight ({orderDetails.uom_code})
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{orderDetails.item_code}</TableCell>
                      <TableCell>{orderDetails.item_description}</TableCell>
                      <TableCell>{orderDetails.lot_no}</TableCell>
                      <TableCell>{orderDetails.uom_code}</TableCell>
                      <TableCell>{orderDetails.remaining_qty}</TableCell>
                      <TableCell>
                        <Input
                          id="qty"
                          type="number"
                          value={qty}
                          disabled
                          className="w-32 bg-muted"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          id="baseWeight"
                          ref={baseWeightRef}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={baseWeight}
                          onChange={handleBaseWeightChange}
                          onWheel={e => e.currentTarget.blur()}
                          placeholder="Enter base weight"
                          className={cn(
                            'w-36',
                            invalidFields.has('baseWeight') ? 'field-blink' : ''
                          )}
                          aria-invalid={invalidFields.has('baseWeight')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          id="tareWeight"
                          ref={tareWeightRef}
                          type="number"
                          min="0"
                          step="0.01"
                          value={tareWeight}
                          onChange={handleTareWeightChange}
                          onWheel={e => e.currentTarget.blur()}
                          placeholder="Enter tare weight"
                          className={cn(
                            'w-36',
                            invalidFields.has('tareWeight') ? 'field-blink' : ''
                          )}
                          aria-invalid={invalidFields.has('tareWeight')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          id="totalWeight"
                          type="text"
                          value={totalWeight}
                          disabled
                          className="w-32 bg-muted font-semibold"
                          placeholder="Auto-calculated"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={generateSerialNumbers}
                disabled={
                  !baseWeight ||
                  Number(baseWeight) <= 0 ||
                  !tareWeight ||
                  Number(tareWeight) < 0 ||
                  !qty ||
                  Number(qty) <= 0 ||
                  isGeneratingSerials
                }
              >
                {isGeneratingSerials && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Serial Numbers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {orderDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Date & Printer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mfgDate">
                  Manufacturing Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      aria-invalid={invalidFields.has('mfgDate')}
                      ref={mfgDateRef}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedMfgDate && 'text-muted-foreground',
                        invalidFields.has('mfgDate') && 'field-blink'
                      )}
                    >
                      {selectedMfgDate ? (
                        DateTime.fromJSDate(selectedMfgDate).toLocaleString(
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
                      selected={selectedMfgDate}
                      onSelect={date => {
                        setSelectedMfgDate(date);
                        if (date && selectedExpDate) {
                          const mfg = new Date(date);
                          mfg.setHours(0, 0, 0, 0);
                          const exp = new Date(selectedExpDate);
                          exp.setHours(0, 0, 0, 0);
                          if (exp < mfg) {
                            setSelectedExpDate(undefined);
                            toast.error(
                              'Expiry date reset as it was before the new manufacturing date'
                            );
                          }
                        }
                      }}
                      disableFutureDates={true}
                      fromYear={1900}
                      toYear={2050}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expDate">
                  Expiry Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      aria-invalid={invalidFields.has('expDate')}
                      ref={expDateRef}
                      disabled={!selectedMfgDate}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedExpDate && 'text-muted-foreground',
                        invalidFields.has('expDate') && 'field-blink',
                        !selectedMfgDate && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {selectedExpDate ? (
                        DateTime.fromJSDate(selectedExpDate).toLocaleString(
                          DateTime.DATE_FULL
                        )
                      ) : (
                        <span>
                          {selectedMfgDate
                            ? 'Pick a date'
                            : 'Select manufacturing date first'}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedExpDate}
                      onSelect={setSelectedExpDate}
                      disabled={date => {
                        if (!selectedMfgDate) return true;
                        const mfg = new Date(selectedMfgDate);
                        mfg.setHours(0, 0, 0, 0);
                        const checkDate = new Date(date);
                        checkDate.setHours(0, 0, 0, 0);
                        return checkDate < mfg;
                      }}
                      fromDate={selectedMfgDate}
                      fromYear={1900}
                      toYear={2050}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="printer">
                  Assign Printer <span className="text-red-500">*</span>
                </Label>
                <div
                  className={invalidFields.has('printer') ? 'field-blink' : ''}
                >
                  <CustomDropdown
                    options={printerOptions}
                    value={selectedPrinter}
                    onValueChange={setSelectedPrinter}
                    ref={printerRef}
                    aria-invalid={invalidFields.has('printer')}
                    placeholder="Select printer..."
                    searchPlaceholder="Search printers..."
                    emptyText="No printers found"
                    loading={isFetchingPrinters}
                    disabled={isFetchingPrinters || printerOptions.length === 0}
                  />
                </div>
                {printerOptions.length === 0 && !isFetchingPrinters && (
                  <p className="text-xs text-red-500">
                    No printers available. Please configure printers first.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {serialNumbers.length > 0 && (
        <Card ref={serialNumbersCardRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Serial Numbers</CardTitle>
              <Button
                onClick={handlePrintLabels}
                className="gap-2"
                disabled={isPrinting}
              >
                {isPrinting && <Loader2 className="h-4 w-4 animate-spin" />}
                <Printer className="h-4 w-4" />
                Print Labels
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="itemsPerPage">Records per page:</Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={value => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead className="w-32">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSerials.map((serial, index) => (
                    <TableRow key={startIndex + index}>
                      <TableCell className="font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {serial.serialNo}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={serial.qty}
                          onChange={e =>
                            handleSerialQtyChange(
                              startIndex + index,
                              e.target.value
                            )
                          }
                          onWheel={e => e.currentTarget.blur()}
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={2} className="text-right font-semibold">
                      Total Quantity:
                    </TableCell>
                    <TableCell className="font-semibold">
                      {serialNumbers
                        .reduce((sum, s) => sum + s.qty, 0)
                        .toFixed(2)}{' '}
                      / {Number(qty).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent
          className="w-full rounded-lg p-6 shadow-xl sm:max-w-2xl"
          role="alertdialog"
          aria-labelledby="confirm-print-title"
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              <Printer className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle
                  id="confirm-print-title"
                  className="flex items-center gap-2"
                >
                  Confirm Print Labels
                </DialogTitle>
                <DialogDescription>
                  Please verify the details below before printing. This action
                  will update stock and print labels to the selected printer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tare Weight</p>
              <p className="text-base font-medium">
                {tareWeight} {orderDetails?.uom_code}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Weight</p>
              <p className="text-base font-medium">
                {totalWeight} {orderDetails?.uom_code}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Base Weight</p>
              <p className="text-base font-medium">
                {baseWeight} {orderDetails?.uom_code}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Serials to Print</p>
              <p className="text-base font-medium">{serialNumbers.length}</p>
            </div>
          </div>
          <div className="mt-4 rounded-md bg-muted p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">
                  Production Order
                </p>
                <p className="font-medium">
                  {orderDetails?.production_order_no}
                </p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Item Code</p>
                <p className="font-medium">{orderDetails?.item_code}</p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Lot No</p>
                <p className="font-medium">{orderDetails?.lot_no}</p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Qty</p>
                <p className="font-medium">{orderDetails?.quantity}</p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Printer</p>
                <p className="font-medium">
                  {printers.find(p => p.printer_ip === selectedPrinter)
                    ?.printer_name || selectedPrinter}
                </p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">
                  Vendor / Customer
                </p>
                <p className="font-medium">
                  {orderDetails?.customer_name || '-'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                aria-label="Cancel print"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmPrintLabels}
                disabled={isPrinting}
                aria-label="Confirm and print"
                autoFocus
              >
                {isPrinting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Print
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FGLabelPrintingProductionOrder;
