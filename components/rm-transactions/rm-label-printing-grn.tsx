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

import { cn } from '@/lib/utils';
import { getUserID } from '@/utils/getFromSession';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RecentGRN {
  grn_no: string;
}

interface GRNDetails {
  Status: string;
  Message: string;
  grn_no: string;
  vendor_code: string;
  vendor_name: string;
  po_no: string;
  po_date: string;
  grn_done_by: string;
  entry_type: string;
  entry_no: string;
  item_code: string;
  item_description: string;
  lot_no: string;
  location_code: string;
  quantity: number;
  packing_detail: string;
  uom: string;
  mfg_date: string | null;
  exp_date: string | null;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
  printed_qty: number | null;
  remaining_qty: number;
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

const RMLabelPrintingGRN: React.FC = () => {
  const [grnNo, setGrnNo] = useState('');
  const [grnLineItems, setGrnLineItems] = useState<GRNDetails[]>([]);
  const [grnDetails, setGrnDetails] = useState<GRNDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentGRNs, setRecentGRNs] = useState<DropdownOption[]>([]);
  const [isFetchingRecentGRNs, setIsFetchingRecentGRNs] = useState(true);
  const [qty, setQty] = useState<string>('');
  const [baseWeight, setBaseWeight] = useState<string>('');
  const [tareWeight, setTareWeight] = useState<string>('');
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [isGeneratingSerials, setIsGeneratingSerials] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [selectedMfgDate, setSelectedMfgDate] = useState<Date | undefined>();
  const [selectedExpDate, setSelectedExpDate] = useState<Date | undefined>();
  const [expCalendarMonth, setExpCalendarMonth] = useState<Date | undefined>();
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [isPrinting, setIsPrinting] = useState(false);
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [printerOptions, setPrinterOptions] = useState<DropdownOption[]>([]);
  const [isFetchingPrinters, setIsFetchingPrinters] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const mfgDateRef = useRef<HTMLInputElement | null>(null);
  const expDateRef = useRef<HTMLInputElement | null>(null);
  const printerRef = useRef<HTMLButtonElement | null>(null);
  const grnNoRef = useRef<HTMLButtonElement | null>(null);
  const baseWeightRef = useRef<HTMLInputElement>(null);
  const tareWeightRef = useRef<HTMLInputElement>(null);
  const serialNumbersCardRef = useRef<HTMLDivElement>(null);
  const selectedLineItemCardRef = useRef<HTMLDivElement>(null);
  const token = Cookies.get('token');

  const totalWeight =
    baseWeight && tareWeight
      ? (Number(baseWeight) + Number(tareWeight)).toFixed(2)
      : '';

  useEffect(() => {
    grnNoRef.current?.focus();
    fetchRecentGRNs();
    fetchPrinters();
  }, []);

  useEffect(() => {
    if (selectedMfgDate) {
      const year = selectedMfgDate.getFullYear();
      const month = String(selectedMfgDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedMfgDate.getDate()).padStart(2, '0');
      setMfgDate(`${year}-${month}-${day}`);
      const autoExp = new Date(selectedMfgDate);
      autoExp.setFullYear(autoExp.getFullYear() + 1);
      setSelectedExpDate(autoExp);
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
      setExpCalendarMonth(selectedExpDate);
    } else {
      setExpDate('');
      setExpCalendarMonth(undefined);
    }
  }, [selectedExpDate]);

  const fetchRecentGRNs = async () => {
    setIsFetchingRecentGRNs(true);
    try {
      const response = await fetch(`/api/rm/rm-label/recent-grn`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent GRNs');
      }

      const data: RecentGRN[] = await response.json();
      const options: DropdownOption[] = data.map(g => ({
        value: g.grn_no,
        label: g.grn_no,
      }));
      setRecentGRNs(options);
    } catch (error: any) {
      console.error('Error fetching recent GRNs:', error);
      toast.error('Failed to fetch recent GRNs');
    } finally {
      setIsFetchingRecentGRNs(false);
    }
  };

  const fetchPrinters = async () => {
    setIsFetchingPrinters(true);
    try {
      const response = await fetch(`/api/hht/printer-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch printers');
      }

      const data: PrinterData[] = await response.json();
      setPrinters(data);
      const options: DropdownOption[] = data.map(p => ({
        value: p.printer_ip,
        label: `${p.printer_name} - ${p.printer_ip}`,
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
    if (!grnNo.trim()) {
      toast.error('Please enter or select a GRN number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/transactions/grn/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grn_no: grnNo.trim(), created_by: getUserID() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch GRN details');
      }

      const raw = await response.json();

      // Handle Status F returned as object
      if (!Array.isArray(raw)) {
        toast.error(raw.Message || raw.error || 'Failed to fetch GRN details');
        setGrnLineItems([]);
        setGrnDetails(null);
        return;
      }

      const data: GRNDetails[] = raw;

      if (data.length === 0) {
        toast.error('No GRN line items found');
        setGrnLineItems([]);
        setGrnDetails(null);
        return;
      }

      // Check first item status
      if (data[0].Status === 'F') {
        toast.error(data[0].Message || 'Failed to fetch GRN details');
        setGrnLineItems([]);
        setGrnDetails(null);
        return;
      }

      setGrnLineItems(data);
      setGrnDetails(null);
      setSerialNumbers([]);
      setBaseWeight('');
      setTareWeight('');
      setQty('');
      setSelectedMfgDate(undefined);
      setSelectedExpDate(undefined);
      toast.success(
        `GRN details fetched — ${data.length} line item${data.length > 1 ? 's' : ''} found`
      );
    } catch (error: any) {
      console.error('Error fetching GRN details:', error);
      toast.error(error.message || 'Failed to fetch GRN details');
      setGrnDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLineItem = (item: GRNDetails) => {
    setGrnDetails(item);
    setSerialNumbers([]);
    setBaseWeight('');
    setTareWeight('');
    setQty(item.remaining_qty.toString());

    setTimeout(() => {
      selectedLineItemCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);

    if (item.mfg_date) {
      const mfg = new Date(item.mfg_date);
      if (!isNaN(mfg.getTime())) setSelectedMfgDate(mfg);
    } else {
      setSelectedMfgDate(undefined);
    }

    if (item.exp_date) {
      const exp = new Date(item.exp_date);
      if (!isNaN(exp.getTime())) setSelectedExpDate(exp);
    } else {
      setSelectedExpDate(undefined);
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

    if (!grnDetails) {
      toast.error('Please fetch GRN details first');
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

  const handleTotalQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const qtyValue = Number(value);
    if (value === '') {
      setQty('');
      setSerialNumbers([]);
      return;
    }
    if (qtyValue <= 0) {
      toast.error('Total quantity must be greater than 0');
      return;
    }
    if (!grnDetails) {
      toast.error('Please fetch GRN details first');
      return;
    }
    if (qtyValue > grnDetails.remaining_qty) {
      toast.error(
        `Total quantity cannot exceed remaining print quantity (${grnDetails.remaining_qty})`
      );
      return;
    }
    setQty(value);
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

    if (!grnDetails) {
      toast.error('Please fetch GRN details first');
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
      const response = await fetch(`/api/rm/rm-label/find-sr-no`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_code: grnDetails.item_code,
          lot_no: grnDetails.lot_no,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to find SR number');
      }

      const { sr_no } = await response.json();
      const startingSerialNo = sr_no + 1;

      const generatedSerials: SerialNumber[] = [];

      for (let i = 0; i < numFullLabels; i++) {
        generatedSerials.push({
          serialNo: `${grnDetails.item_code}|${grnDetails.lot_no}|${startingSerialNo + i}`,
          qty: baseWeightValue,
        });
      }

      if (remainder > 0) {
        generatedSerials.push({
          serialNo: `${grnDetails.item_code}|${grnDetails.lot_no}|${startingSerialNo + numFullLabels}`,
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

    const totalSerialQty = updatedSerials.reduce((sum, s) => sum + s.qty, 0);
    const expectedQty = Number(qty);

    if (totalSerialQty > expectedQty) {
      toast.error(
        `Total quantity (${totalSerialQty.toFixed(2)}) cannot exceed the expected quantity (${expectedQty.toFixed(2)}). Please adjust the quantities.`,
        { duration: 5000 }
      );
      return;
    }

    setSerialNumbers(updatedSerials);
  };

  const validateTotalQuantity = (): boolean => {
    if (!grnDetails || !qty) return false;

    const totalSerialQty =
      Math.round(serialNumbers.reduce((sum, s) => sum + s.qty, 0) * 100) / 100;
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
    if (!grnNo.trim()) missingFields.push('grnNo');
    if (!baseWeight.trim()) missingFields.push('baseWeight');
    if (!tareWeight.trim()) missingFields.push('tareWeight');
    if (!qty.trim()) missingFields.push('qty');
    if (!selectedMfgDate) missingFields.push('mfgDate');
    if (!selectedExpDate) missingFields.push('expDate');
    if (!selectedPrinter) missingFields.push('printer');

    setInvalidFields(new Set(missingFields));

    if (missingFields.length > 0) {
      const fieldLabels: { [key: string]: string } = {
        grnNo: 'GRN No',
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
      const firstInvalid = missingFields[0];
      switch (firstInvalid) {
        case 'grnNo':
          grnNoRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          grnNoRef.current?.focus();
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
      const printedQty = Number(qty);
      const currentPrinted = grnDetails!.printed_qty ?? 0;
      const remainingQty = grnDetails!.quantity - currentPrinted - printedQty;

      const payload = {
        grn_no: grnDetails!.grn_no,
        entry_no: grnDetails!.entry_no,
        item_code: grnDetails!.item_code,
        item_description: grnDetails!.item_description,
        lot_no: grnDetails!.lot_no,
        vendor_code: grnDetails!.vendor_code,
        vendor_name: grnDetails!.vendor_name,
        base_weight: Number(baseWeight),
        tare_weight: Number(tareWeight),
        quantity: grnDetails!.quantity,
        po_no: grnDetails!.po_no,
        uom: grnDetails!.uom,
        serial_no: serialNo,
        print_by: getUserID(),
        print_quantity: printQuantity,
        mfg_date: mfgDate,
        exp_date: expDate,
        printed_qty: printedQty,
        remaining_qty: remainingQty < 0 ? 0 : remainingQty,
        printer_ip: printerData.printer_ip,
        dpi: printerData.dpi,
      };

      const response = await fetch(`/api/rm/rm-label/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to print labels');
      }

      const data = await response.json();

      if (data.Status === 'F') {
        toast.error(data.Message || 'Failed to print labels');
        return;
      }

      toast.success(data.Message || 'Labels printed successfully!');
      handleReset();
      fetchRecentGRNs();
    } catch (error: any) {
      console.error('Error printing labels:', error);
      toast.error(error.message || 'Failed to print labels');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReset = () => {
    setGrnNo('');
    setGrnLineItems([]);
    setGrnDetails(null);
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
    grnNoRef.current?.focus();
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
              background-color: rgba(255, 0, 0, 0.3);
              border-color: #ff0000;
              box-shadow: 0 0 12px rgba(255, 0, 0, 0.4);
            }
          }
          .field-blink {
            animation: field-blink 0.7s ease-in-out 8;
            border-width: 1px;
          }
          .field-blink:focus {
            outline: 3px solid rgba(255, 0, 0, 0.25);
            outline-offset: 2px;
          }
        `,
        }}
      />

      {/* ── GRN Search ── */}
      <Card>
        <CardHeader>
          <CardTitle>GRN Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="grnNo">
                GRN No <span className="text-red-500">*</span>
              </Label>
              <div className={invalidFields.has('grnNo') ? 'field-blink' : ''}>
                <CustomDropdown
                  aria-invalid={invalidFields.has('grnNo')}
                  options={recentGRNs}
                  value={grnNo}
                  onValueChange={v => setGrnNo(v.trim())}
                  onCustomValueChange={v => setGrnNo(v.trim())}
                  placeholder="Select or enter GRN number"
                  searchPlaceholder="Search GRNs..."
                  emptyText="No recent GRNs found"
                  allowCustomValue={true}
                  loading={isFetchingRecentGRNs}
                  disabled={isLoading}
                  ref={grnNoRef}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleGetDetails}
                disabled={!grnNo.trim() || isLoading}
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

      {/* ── GRN Line Items Selection ── */}
      {grnLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>GRN Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>GRN No</Label>
                <Input value={grnLineItems[0].grn_no} disabled />
              </div>
              <div className="space-y-2">
                <Label>Vendor Code</Label>
                <Input value={grnLineItems[0].vendor_code} disabled />
              </div>
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input value={grnLineItems[0].vendor_name} disabled />
              </div>
              <div className="space-y-2">
                <Label>PO No</Label>
                <Input value={grnLineItems[0].po_no} disabled />
              </div>
              <div className="space-y-2">
                <Label>PO Date</Label>
                <Input value={grnLineItems[0].po_date} disabled />
              </div>
              <div className="space-y-2">
                <Label>GRN Done By</Label>
                <Input value={grnLineItems[0].grn_done_by} disabled />
              </div>
            </div>

            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Select a line item to print labels for:
            </p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry No</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Lot No</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Printed Qty</TableHead>
                    <TableHead>Remaining Qty</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Packing Detail</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grnLineItems.map((item, idx) => (
                    <TableRow
                      key={idx}
                      className={
                        grnDetails?.entry_no === item.entry_no &&
                        grnDetails?.lot_no === item.lot_no
                          ? 'bg-primary/10'
                          : ''
                      }
                    >
                      <TableCell>{item.entry_no || '-'}</TableCell>
                      <TableCell>{item.item_code}</TableCell>
                      <TableCell>{item.item_description}</TableCell>
                      <TableCell>{item.lot_no || '-'}</TableCell>
                      <TableCell>{item.location_code}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.printed_qty ?? 0}</TableCell>
                      <TableCell>{item.remaining_qty}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell>{item.packing_detail}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={
                            grnDetails?.entry_no === item.entry_no &&
                            grnDetails?.lot_no === item.lot_no
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => handleSelectLineItem(item)}
                          disabled={item.remaining_qty <= 0}
                        >
                          {grnDetails?.entry_no === item.entry_no &&
                          grnDetails?.lot_no === item.lot_no
                            ? 'Selected'
                            : item.remaining_qty <= 0
                              ? 'Done'
                              : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── GRN Information ── */}
      {grnDetails && (
        <Card ref={selectedLineItemCardRef}>
          <CardHeader>
            <CardTitle>Selected Line Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>GRN No</Label>
                <Input value={grnDetails.grn_no} disabled />
              </div>
              <div className="space-y-2">
                <Label>Entry No</Label>
                <Input value={grnDetails.entry_no || '-'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Entry Type</Label>
                <Input value={grnDetails.entry_type} disabled />
              </div>
              <div className="space-y-2">
                <Label>Item Code</Label>
                <Input value={grnDetails.item_code} disabled />
              </div>
              <div className="space-y-2">
                <Label>Item Description</Label>
                <Input value={grnDetails.item_description} disabled />
              </div>
              <div className="space-y-2">
                <Label>Lot No</Label>
                <Input value={grnDetails.lot_no || '-'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Location Code</Label>
                <Input value={grnDetails.location_code} disabled />
              </div>
              <div className="space-y-2">
                <Label>UOM</Label>
                <Input value={grnDetails.uom} disabled />
              </div>
              <div className="space-y-2">
                <Label>Total Quantity</Label>
                <Input value={grnDetails.quantity} disabled />
              </div>
              <div className="space-y-2">
                <Label>Printed Qty</Label>
                <Input value={grnDetails.printed_qty ?? 0} disabled />
              </div>
              <div className="space-y-2">
                <Label>Remaining Qty</Label>
                <Input value={grnDetails.remaining_qty} disabled />
              </div>
              <div className="space-y-2">
                <Label>Packing Detail</Label>
                <Input value={grnDetails.packing_detail} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Label Generation ── */}
      {grnDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Label Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
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
                        Base Weight ({grnDetails.uom}){' '}
                        <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead>
                        Tare Weight ({grnDetails.uom}){' '}
                        <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead>Total Weight ({grnDetails.uom})</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{grnDetails.item_code}</TableCell>
                      <TableCell>{grnDetails.item_description}</TableCell>
                      <TableCell>{grnDetails.lot_no || '-'}</TableCell>
                      <TableCell>{grnDetails.uom}</TableCell>
                      <TableCell>{grnDetails.remaining_qty}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={qty}
                          onChange={handleTotalQtyChange}
                          onWheel={e => e.currentTarget.blur()}
                          placeholder="Enter total qty"
                          className={cn(
                            'w-32',
                            invalidFields.has('qty') ? 'field-blink' : ''
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          ref={baseWeightRef}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={baseWeight}
                          onChange={handleBaseWeightChange}
                          onWheel={e => e.currentTarget.blur()}
                          placeholder="Base weight"
                          className={cn(
                            'w-36',
                            invalidFields.has('baseWeight') ? 'field-blink' : ''
                          )}
                          aria-invalid={invalidFields.has('baseWeight')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          ref={tareWeightRef}
                          type="number"
                          min="0"
                          step="0.01"
                          value={tareWeight}
                          onChange={handleTareWeightChange}
                          onWheel={e => e.currentTarget.blur()}
                          placeholder="Tare weight"
                          className={cn(
                            'w-36',
                            invalidFields.has('tareWeight') ? 'field-blink' : ''
                          )}
                          aria-invalid={invalidFields.has('tareWeight')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
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

      {/* ── Date & Printer ── */}
      {grnDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Date &amp; Printer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Manufacturing Date */}
              <div className="space-y-2">
                <Label>
                  Manufacturing Date <span className="text-red-500">*</span>
                </Label>
                <input
                  type="date"
                  ref={mfgDateRef}
                  value={mfgDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => {
                    const val = e.target.value;
                    if (val) {
                      const date = new Date(val + 'T00:00:00');
                      setSelectedMfgDate(date);
                      if (selectedExpDate) {
                        const exp = new Date(selectedExpDate);
                        exp.setHours(0, 0, 0, 0);
                        if (exp < date) {
                          setSelectedExpDate(undefined);
                          toast.error(
                            'Expiry date reset as it was before the new manufacturing date'
                          );
                        }
                      }
                    } else {
                      setSelectedMfgDate(undefined);
                    }
                  }}
                  className={cn(
                    'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    invalidFields.has('mfgDate') && 'field-blink'
                  )}
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label>
                  Expiry Date <span className="text-red-500">*</span>
                </Label>
                <input
                  type="date"
                  ref={expDateRef}
                  value={expDate}
                  min={mfgDate}
                  disabled={!selectedMfgDate}
                  onChange={e => {
                    const val = e.target.value;
                    if (val) {
                      setSelectedExpDate(new Date(val + 'T00:00:00'));
                    } else {
                      setSelectedExpDate(undefined);
                    }
                  }}
                  className={cn(
                    'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    invalidFields.has('expDate') && 'field-blink'
                  )}
                />
              </div>

              {/* Printer */}
              <div className="space-y-2">
                <Label>
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

      {/* ── Serial Numbers Table ── */}
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
                <Label>Records per page:</Label>
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

      {/* ── Confirm Dialog ── */}
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
              <p className="text-sm text-muted-foreground">Base Weight</p>
              <p className="text-base font-medium">
                {baseWeight} {grnDetails?.uom}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tare Weight</p>
              <p className="text-base font-medium">
                {tareWeight} {grnDetails?.uom}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Weight</p>
              <p className="text-base font-medium">
                {totalWeight} {grnDetails?.uom}
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
                <p className="text-xs text-muted-foreground">GRN No</p>
                <p className="font-medium">{grnDetails?.grn_no}</p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Item Code</p>
                <p className="font-medium">{grnDetails?.item_code}</p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Lot No</p>
                <p className="font-medium">{grnDetails?.lot_no || '-'}</p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Qty</p>
                <p className="font-medium">{grnDetails?.quantity}</p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Printer</p>
                <p className="font-medium">
                  {printers.find(p => p.printer_ip === selectedPrinter)
                    ?.printer_name || selectedPrinter}
                </p>
              </div>
              <div className="space-y-0">
                <p className="text-xs text-muted-foreground">Vendor</p>
                <p className="font-medium">{grnDetails?.vendor_name || '-'}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmPrintLabels}
                disabled={isPrinting}
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

export default RMLabelPrintingGRN;
