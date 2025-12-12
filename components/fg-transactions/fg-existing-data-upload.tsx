'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import {
  Loader2,
  Upload,
  Printer,
  RefreshCw,
  Download,
  Info,
  CalendarIcon,
  Warehouse,
  MapPin,
  Package,
  Check,
} from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface DropdownOption {
  value: string;
  label: string;
}

interface ItemDetails {
  item_code: string;
  item_description: string;
  lot_no: string;
  mfg_date: string;
  exp_date: string;
  quantity: number;
  printed_quantity: number;
  remaining_quantity: number;
  print_status: string;
  uploaded_by: string;
  uom?: string;
}

interface SerialNumber {
  serialNo: string;
  qty: number;
}

interface PrinterData {
  printer_name: string;
  printer_ip: string;
  dpi: string;
}

interface WarehouseData {
  warehouse_code: string;
}

interface BinSuggestion {
  warehouse_code: string;
  bin: string;
  rack: string;
  quantity: number;
}

const FGExistingDataUpload: React.FC = () => {
  const requiredHeaders = [
    'item_code',
    'item_description',
    'lot_no',
    'quantity',
  ];
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemCodes, setItemCodes] = useState<DropdownOption[]>([]);
  const [selectedItemCode, setSelectedItemCode] = useState<string>('');
  const [isFetchingItemCodes, setIsFetchingItemCodes] = useState(false);
  const [lotNumbers, setLotNumbers] = useState<DropdownOption[]>([]);
  const [selectedLotNo, setSelectedLotNo] = useState<string>('');
  const [isFetchingLotNumbers, setIsFetchingLotNumbers] = useState(false);
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null);
  const [baseWeight, setBaseWeight] = useState<string>('');
  const [tareWeight, setTareWeight] = useState<string>('');
  const [totalQty, setTotalQty] = useState<string>('');
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [isGeneratingSerials, setIsGeneratingSerials] = useState(false);
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [printerOptions, setPrinterOptions] = useState<DropdownOption[]>([]);
  const [isFetchingPrinters, setIsFetchingPrinters] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [selectedMfgDate, setSelectedMfgDate] = useState<Date | undefined>();
  const [selectedExpDate, setSelectedExpDate] = useState<Date | undefined>();

  const [enablePutAway, setEnablePutAway] = useState(false);
  const [warehouses, setWarehouses] = useState<DropdownOption[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [isFetchingWarehouses, setIsFetchingWarehouses] = useState(false);
  const [binSuggestions, setBinSuggestions] = useState<BinSuggestion[]>([]);
  const [isFetchingBins, setIsFetchingBins] = useState(false);
  const [selectedBin, setSelectedBin] = useState<BinSuggestion | null>(null);
  const [isBinDialogOpen, setIsBinDialogOpen] = useState(false);

  const serialNumbersCardRef = useRef<HTMLDivElement>(null);
  const baseWeightRef = useRef<HTMLInputElement>(null);
  const tareWeightRef = useRef<HTMLInputElement>(null);

  const token = Cookies.get('token');

  const totalWeight =
    baseWeight && tareWeight
      ? (Number(baseWeight) + Number(tareWeight)).toFixed(2)
      : '';

  useEffect(() => {
    fetchItemCodes();
    fetchPrinters();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedItemCode) {
      fetchLotNumbers(selectedItemCode);
      setLotNumbers([]);
      setSelectedLotNo('');
      setItemDetails(null);
      setSerialNumbers([]);
      setBaseWeight('');
      setTareWeight('');
      setTotalQty('');
      setSelectedMfgDate(undefined);
      setSelectedExpDate(undefined);
      setMfgDate('');
      setExpDate('');
    }
  }, [selectedItemCode]);

  useEffect(() => {
    if (selectedItemCode && selectedLotNo) {
      fetchDetails(selectedItemCode, selectedLotNo);
    }
  }, [selectedLotNo]);

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

  const fetchItemCodes = async () => {
    setIsFetchingItemCodes(true);
    try {
      const response = await fetch(
        `/api/existing-data/get-item-codes?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          cache: 'no-store',
        }
      );
      const data = await response.json();
      if (data.Status === 'T') {
        const options = data.data.map((item: any) => ({
          value: item.item_code,
          label: item.item_code,
        }));
        setItemCodes(options);
      }
    } catch (error) {
      console.error('Error fetching item codes:', error);
    } finally {
      setIsFetchingItemCodes(false);
    }
  };

  const fetchLotNumbers = async (itemCode: string) => {
    setIsFetchingLotNumbers(true);
    try {
      const response = await fetch('/api/existing-data/get-lot-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item_code: itemCode }),
      });
      const data = await response.json();
      if (data.Status === 'T') {
        const options = data.data.map((item: any) => ({
          value: item.lot_no,
          label: item.lot_no,
        }));
        setLotNumbers(options);
      }
    } catch (error) {
      console.error('Error fetching lot numbers:', error);
    } finally {
      setIsFetchingLotNumbers(false);
    }
  };

  const fetchDetails = async (itemCode: string, lotNo: string) => {
    try {
      const response = await fetch('/api/existing-data/get-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item_code: itemCode, lot_no: lotNo }),
      });
      const data = await response.json();
      if (data.Status === 'T') {
        setItemDetails(data.data);
        setTotalQty(data.data.remaining_quantity.toString());
      } else {
        toast.error(data.Message || 'Failed to fetch details');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Error fetching details');
    }
  };

  const fetchPrinters = async () => {
    setIsFetchingPrinters(true);
    try {
      const response = await fetch(`/api/hht/printer-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setPrinters(data);
        const options = data.map((printer: any) => ({
          value: printer.printer_ip,
          label: `${printer.printer_name} - ${printer.printer_ip}`,
        }));
        setPrinterOptions(options);
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
    } finally {
      setIsFetchingPrinters(false);
    }
  };

  const fetchWarehouses = async () => {
    setIsFetchingWarehouses(true);
    try {
      const response = await fetch('/api/master/get-all-wh-code');
      const data = await response.json();

      if (Array.isArray(data)) {
        const options = data.map((wh: WarehouseData) => ({
          value: wh.warehouse_code,
          label: wh.warehouse_code,
        }));
        setWarehouses(options);
      } else if (data.Status === 'T' && Array.isArray(data.data)) {
        const options = data.data.map((wh: WarehouseData) => ({
          value: wh.warehouse_code,
          label: wh.warehouse_code,
        }));
        setWarehouses(options);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setIsFetchingWarehouses(false);
    }
  };

  const fetchBinSuggestions = async (warehouseCode: string) => {
    setIsFetchingBins(true);
    try {
      const response = await fetch('/api/hht/fg-put-away-location-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          warehouse_code: warehouseCode,
          item_code: selectedItemCode,
        }),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        if (data.length > 0) {
          setBinSuggestions(data);
          setIsBinDialogOpen(true);
        } else {
          toast.error('No bin suggestions found');
          setBinSuggestions([]);
        }
      } else if (data.Status === 'T' && Array.isArray(data.data)) {
        setBinSuggestions(data.data);
        setIsBinDialogOpen(true);
      } else {
        toast.error(data.Message || 'No bin suggestions found');
        setBinSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching bin suggestions:', error);
      toast.error('Error fetching bin suggestions');
    } finally {
      setIsFetchingBins(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setIsLoadingFile(true);

      const reader = new FileReader();
      reader.onloadstart = () => {
        setIsLoadingFile(true);
      };
      reader.onload = () => {
        setFile(selectedFile);
        setIsLoadingFile(false);
      };
      reader.onerror = () => {
        toast.error('Error reading file');
        setIsLoadingFile(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('uploaded_by', getUserID() || 'System');

    try {
      const response = await fetch('/api/existing-data/upload-excel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (data.Status === 'T') {
        toast.success(data.Message);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchItemCodes();
      } else {
        toast.error(data.Message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading file');
    } finally {
      setIsUploading(false);
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

    if (!itemDetails) {
      toast.error('Please fetch item details first');
      return;
    }

    const totalQtyNum = Number(totalQty);

    if (baseWeightValue > totalQtyNum) {
      toast.error(
        `Base weight cannot be greater than total quantity (${totalQtyNum})`
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

  const handleTotalQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const totalQtyValue = Number(value);

    if (value === '') {
      setTotalQty('');
      setSerialNumbers([]);
      return;
    }

    if (totalQtyValue <= 0) {
      toast.error('Total quantity must be greater than 0');
      return;
    }

    if (itemDetails && totalQtyValue > itemDetails.remaining_quantity) {
      toast.error(
        `Total quantity cannot exceed remaining quantity (${itemDetails.remaining_quantity})`
      );
      return;
    }

    setTotalQty(value);
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

    if (!totalQty || Number(totalQty) <= 0) {
      toast.error('Please enter a valid total quantity');
      return;
    }

    if (!itemDetails) {
      toast.error('Please fetch item details first');
      return;
    }

    const totalQtyNum = Number(totalQty);
    const baseWeightValue = Number(baseWeight);

    if (totalQtyNum > itemDetails.remaining_quantity) {
      toast.error('Total quantity cannot exceed remaining quantity');
      return;
    }

    const numFullLabels = Math.floor(totalQtyNum / baseWeightValue);
    const remainder = totalQtyNum % baseWeightValue;
    const totalLabels = numFullLabels + (remainder > 0 ? 1 : 0);

    if (totalLabels <= 0) {
      toast.error('Total quantity must be at least equal to base weight');
      return;
    }

    setIsGeneratingSerials(true);
    try {
      const response = await fetch('/api/existing-data/find-serial-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_code: selectedItemCode,
          lot_no: selectedLotNo,
        }),
      });
      const data = await response.json();

      let startSerial = 1;
      if (data.Status === 'T' && data.data) {
        startSerial = data.data.sr_no + 1;
      }

      const generatedSerials: SerialNumber[] = [];

      for (let i = 0; i < numFullLabels; i++) {
        const serialNo = `${selectedItemCode}|${selectedLotNo}|${startSerial + i}`;
        generatedSerials.push({
          serialNo,
          qty: baseWeightValue,
        });
      }

      if (remainder > 0) {
        const serialNo = `${selectedItemCode}|${selectedLotNo}|${startSerial + numFullLabels}`;
        generatedSerials.push({
          serialNo,
          qty: parseFloat(remainder.toFixed(3)),
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
    } catch (error) {
      console.error('Error generating serials:', error);
      toast.error('Error generating serial numbers');
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
    const expectedQty = Number(totalQty);

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
    if (!itemDetails || !totalQty) return false;

    const totalSerialQty =
      Math.round(
        serialNumbers.reduce((sum, serial) => sum + serial.qty, 0) * 100
      ) / 100;
    const expectedQty = Math.round(Number(totalQty) * 100) / 100;

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
    if (!selectedItemCode) missingFields.push('itemCode');
    if (!selectedLotNo) missingFields.push('lotNo');
    if (!baseWeight.trim()) missingFields.push('baseWeight');
    if (!tareWeight.trim()) missingFields.push('tareWeight');
    if (!totalQty.trim()) missingFields.push('totalQty');
    if (!selectedMfgDate) missingFields.push('mfgDate');
    if (!selectedExpDate) missingFields.push('expDate');
    if (!selectedPrinter) missingFields.push('printer');

    setInvalidFields(new Set(missingFields));

    if (missingFields.length > 0) {
      const fieldLabels: { [key: string]: string } = {
        itemCode: 'Item Code',
        lotNo: 'Lot Number',
        baseWeight: 'Base Weight',
        tareWeight: 'Tare Weight',
        totalQty: 'Total Quantity',
        mfgDate: 'Manufacturing Date',
        expDate: 'Expiry Date',
        printer: 'Assign Printer',
      };
      toast.error(
        `Please fill the following required fields: ${missingFields.map(f => fieldLabels[f]).join(', ')}`
      );
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const confirmPrintLabels = async () => {
    setIsConfirmDialogOpen(false);

    const printerData = printers.find(p => p.printer_ip === selectedPrinter);
    if (!printerData) {
      toast.error('Invalid printer selected');
      return;
    }

    setIsPrinting(true);
    try {
      const serialsStr = serialNumbers.map(s => s.serialNo).join('$');
      const qtysStr = serialNumbers.map(s => s.qty).join('$');

      const payload = {
        item_code: itemDetails?.item_code,
        item_description: itemDetails?.item_description,
        lot_no: itemDetails?.lot_no,
        quantity: parseFloat(totalQty),
        uom: itemDetails?.uom || 'KG',
        serial_no: serialsStr,
        print_quantity: qtysStr,
        mfg_date: mfgDate,
        exp_date: expDate,
        warehouse_code: selectedWarehouse || '',
        put_location: selectedBin?.bin || '',
        print_by: getUserID() || 'Admin',
        printer_ip: selectedPrinter,
        dpi: parseInt(printerData.dpi),
        base_weight: Number(baseWeight),
        tare_weight: Number(tareWeight),
        total_weight: Number(totalWeight),
      };

      const response = await fetch('/api/existing-data/insert-label-printing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.Status === 'T') {
        toast.success(data.Message || 'Labels printed successfully!');

        setSerialNumbers([]);
        setBaseWeight('');
        setTareWeight('');
        setTotalQty('');
        setSelectedMfgDate(undefined);
        setSelectedExpDate(undefined);
        setMfgDate('');
        setExpDate('');
        setSelectedPrinter('');
        setInvalidFields(new Set());
        setSelectedWarehouse('');
        setSelectedBin(null);
        fetchDetails(selectedItemCode, selectedLotNo);
      } else {
        toast.error(data.Message || 'Printing failed');
      }
    } catch (error) {
      console.error('Printing error:', error);
      toast.error('Error printing labels');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReset = () => {
    setSelectedItemCode('');
    setSelectedLotNo('');
    setItemDetails(null);
    setBaseWeight('');
    setTareWeight('');
    setTotalQty('');
    setSerialNumbers([]);
    setCurrentPage(1);
    setSelectedMfgDate(undefined);
    setSelectedExpDate(undefined);
    setMfgDate('');
    setExpDate('');
    setSelectedPrinter('');
    setInvalidFields(new Set());
    setSelectedWarehouse('');
    setSelectedBin(null);
  };

  const downloadSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/exisiting_sample_data.xlsx';
    link.download = 'exisiting_sample_data.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSerials = serialNumbers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(serialNumbers.length / itemsPerPage);

  const uomDisplay = itemDetails?.uom || 'KG';

  return (
    <div className="space-y-6">
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
              opacity: 0.8;
              background-color: rgba(239, 68, 68, 0.15);
              border-color: rgb(239, 68, 68);
            }
          }
          .field-blink {
            animation: field-blink 1s ease-in-out 3;
          }
        `,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Existing Data Excel
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Info className="mr-2 h-4 w-4" />
                    Sample Format
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excel Upload Format</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please ensure your Excel file has the following columns:
                      <br />
                      <br />
                      <strong>Required Columns:</strong>
                      <ul className="mt-2 list-disc pl-5">
                        {requiredHeaders.map(header => (
                          <li key={header}>{header}</li>
                        ))}
                      </ul>
                      <br />
                      <strong>Note:</strong> All columns are mandatory. Download
                      the sample file for reference.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button onClick={downloadSampleFile} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Sample
                    </Button>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" size="sm" onClick={downloadSampleFile}>
                <Download className="mr-2 h-4 w-4" />
                Download Sample
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel-upload">Excel File</Label>
              <Input
                id="excel-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isLoadingFile || isUploading}
              />
              {isLoadingFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Loading file...</span>
                </div>
              )}
              {file && !isLoadingFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </div>
              )}
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !file || isLoadingFile}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Existing Data Label Printing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Item Code <span className="text-red-500">*</span>
              </Label>
              <div
                className={invalidFields.has('itemCode') ? 'field-blink' : ''}
              >
                <CustomDropdown
                  options={itemCodes}
                  value={selectedItemCode}
                  onValueChange={setSelectedItemCode}
                  placeholder="Select Item Code"
                  searchPlaceholder="Search item code..."
                  emptyText="No item codes found"
                  loading={isFetchingItemCodes}
                  disabled={isFetchingItemCodes}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Lot Number <span className="text-red-500">*</span>
              </Label>
              <div className={invalidFields.has('lotNo') ? 'field-blink' : ''}>
                <CustomDropdown
                  options={lotNumbers}
                  value={selectedLotNo}
                  onValueChange={setSelectedLotNo}
                  placeholder="Select Lot Number"
                  searchPlaceholder="Search lot number..."
                  emptyText="No lot numbers found"
                  loading={isFetchingLotNumbers}
                  disabled={!selectedItemCode || isFetchingLotNumbers}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {itemDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="item_code">Item Code</Label>
                <Input id="item_code" value={itemDetails.item_code} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_description">Item Description</Label>
                <Input
                  id="item_description"
                  value={itemDetails.item_description}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot_no">Lot No</Label>
                <Input id="lot_no" value={itemDetails.lot_no} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Total Quantity</Label>
                <Input id="quantity" value={itemDetails.quantity} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printed_quantity">Printed Quantity</Label>
                <Input
                  id="printed_quantity"
                  value={itemDetails.printed_quantity}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remaining_quantity">Remaining Quantity</Label>
                <Input
                  id="remaining_quantity"
                  value={itemDetails.remaining_quantity}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {itemDetails && (
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
                      <TableHead>Remaining Qty</TableHead>
                      <TableHead>
                        Total Qty <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead>
                        Base Weight ({uomDisplay}){' '}
                        <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead>
                        Tare Weight ({uomDisplay}){' '}
                        <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead>Total Weight ({uomDisplay})</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{itemDetails.item_code}</TableCell>
                      <TableCell>{itemDetails.item_description}</TableCell>
                      <TableCell>{itemDetails.lot_no}</TableCell>
                      <TableCell>{itemDetails.remaining_quantity}</TableCell>
                      <TableCell>
                        <Input
                          id="totalQty"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={totalQty}
                          onChange={handleTotalQtyChange}
                          onWheel={e => e.currentTarget.blur()}
                          placeholder="Enter total qty"
                          className={cn(
                            'w-32',
                            invalidFields.has('totalQty') ? 'field-blink' : ''
                          )}
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
                  !totalQty ||
                  Number(totalQty) <= 0 ||
                  isGeneratingSerials
                }
              >
                {isGeneratingSerials ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Generate Serial Numbers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {itemDetails && (
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
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedMfgDate && 'text-muted-foreground',
                        invalidFields.has('mfgDate') && 'field-blink'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                      disabled={!selectedMfgDate}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedExpDate && 'text-muted-foreground',
                        invalidFields.has('expDate') && 'field-blink',
                        !selectedMfgDate && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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

      {itemDetails && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Put Away (Optional)
              </CardTitle>
              {(selectedWarehouse || selectedBin) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedWarehouse('');
                    setSelectedBin(null);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <CustomDropdown
                  options={warehouses}
                  value={selectedWarehouse}
                  onValueChange={value => {
                    setSelectedWarehouse(value);
                    setSelectedBin(null);
                  }}
                  placeholder="Select warehouse..."
                  searchPlaceholder="Search warehouses..."
                  emptyText="No warehouses found"
                  loading={isFetchingWarehouses}
                  disabled={isFetchingWarehouses}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bin">Bin Location</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => {
                    if (!selectedWarehouse) {
                      toast.error('Please select a warehouse first');
                      return;
                    }
                    if (!selectedItemCode) {
                      toast.error('Please select an item code first');
                      return;
                    }
                    fetchBinSuggestions(selectedWarehouse);
                  }}
                  disabled={
                    !selectedWarehouse || !selectedItemCode || isFetchingBins
                  }
                >
                  {isFetchingBins ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  {selectedBin ? (
                    <span>
                      {selectedBin.bin} ({selectedBin.rack})
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select bin...</span>
                  )}
                </Button>
              </div>
              {selectedBin && (
                <div className="space-y-2">
                  <Label>Selected Bin Info</Label>
                  <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">
                      Bin: {selectedBin.bin} | Rack: {selectedBin.rack} | Qty:{' '}
                      {selectedBin.quantity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isBinDialogOpen} onOpenChange={setIsBinDialogOpen}>
        <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Bin Location Suggestions
            </DialogTitle>
            <DialogDescription>
              Select a bin location for put away. These are suggested bins based
              on the warehouse and item code.
              {binSuggestions.length > 0 && (
                <span className="ml-1 font-medium">
                  ({binSuggestions.length} locations found)
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Warehouse Code</TableHead>
                  <TableHead>Bin</TableHead>
                  <TableHead>Rack</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {binSuggestions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No bin suggestions available
                    </TableCell>
                  </TableRow>
                ) : (
                  binSuggestions.map((bin, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>{bin.warehouse_code}</TableCell>
                      <TableCell>{bin.bin}</TableCell>
                      <TableCell>{bin.rack}</TableCell>
                      <TableCell>{bin.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant={
                            selectedBin?.bin === bin.bin ? 'default' : 'outline'
                          }
                          onClick={() => {
                            setSelectedBin(bin);
                            setIsBinDialogOpen(false);
                            toast.success(`Selected bin: ${bin.bin}`);
                          }}
                        >
                          {selectedBin?.bin === bin.bin ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBinDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      / {Number(totalQty).toFixed(2)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Print Labels</DialogTitle>
            <DialogDescription>
              Are you sure you want to print the labels?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>Item Code:</strong> {itemDetails?.item_code}
            </p>
            <p>
              <strong>Lot No:</strong> {itemDetails?.lot_no}
            </p>
            <p>
              <strong>Base Weight:</strong> {baseWeight} {uomDisplay}
            </p>
            <p>
              <strong>Tare Weight:</strong> {tareWeight} {uomDisplay}
            </p>
            <p>
              <strong>Total Weight:</strong> {totalWeight} {uomDisplay}
            </p>
            <p>
              <strong>Manufacturing Date:</strong>{' '}
              {selectedMfgDate
                ? DateTime.fromJSDate(selectedMfgDate).toLocaleString(
                    DateTime.DATE_FULL
                  )
                : '-'}
            </p>
            <p>
              <strong>Expiry Date:</strong>{' '}
              {selectedExpDate
                ? DateTime.fromJSDate(selectedExpDate).toLocaleString(
                    DateTime.DATE_FULL
                  )
                : '-'}
            </p>
            <p>
              <strong>Total Serial Numbers:</strong> {serialNumbers.length}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmPrintLabels} disabled={isPrinting}>
              {isPrinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FGExistingDataUpload;
