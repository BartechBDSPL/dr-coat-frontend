'use client';
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import axios from '@/lib/axios-config';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { toast as sooner } from 'sonner';
import { delay } from '@/utils/delay';
import { Loading } from '@/components/loading';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2 } from 'lucide-react';

interface PrinterData {
  id?: number;
  plant_code: string;
  printer_name: string;
  printer_make: string;
  printer_sr_no: string;
  printer_ip: string;
  asset_code: string;
  dpi: string;
  company_code: string | null;
  line_code: string;
  created_by: string;
  status?: string;
}
interface PlantCode {
  plant_code: string;
}

const getUserID = () => {
  const token = Cookies.get('token');
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.user.User_ID;
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
  return 'Guest';
};
interface DropdownOption {
  value: string;
  label: string;
}

interface PingStatus {
  [key: string]: 'idle' | 'pinging' | 'success' | 'error';
}

const PalletMaster: React.FC = () => {
  const [printerMakeModel, setPrinterMakeModel] = useState<string>('');
  const [printerName, setPrinterName] = useState<string>('');
  const [printerSrNo, setPrinterSrNo] = useState<string>('');
  const [printerIPPort, setPrinterIPPort] = useState<string>('');
  const [plantCode, setPlantCode] = useState<string>('');
  const [plantCodes, setPlantCodes] = useState<DropdownOption[]>([]);

  const [dpi, setDpi] = useState<string>('');
  const [assetCode, setAssetCode] = useState<string>('');
  const [defaultPrinter, setDefaultPrinter] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [data, setData] = useState<PrinterData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printerMakeModelRef = useRef<HTMLInputElement>(null);
  const printerNameRef = useRef<HTMLInputElement>(null);
  const printerSrNoRef = useRef<HTMLInputElement>(null);
  const printerIPPortRef = useRef<HTMLInputElement>(null);
  const dpiRef = useRef<HTMLInputElement>(null);
  const assetCodeRef = useRef<HTMLInputElement>(null);
  const defaultPrinterRef = useRef<HTMLInputElement>(null);
  const token = Cookies.get('token');
  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pingStatus, setPingStatus] = useState<PingStatus>({});

  useEffect(() => {
    const executeSequentially = async () => {
      await delay(20);
      await fetchData();
      await delay(50);
      await fetchPlantCodes();
      await delay(50);
      // await insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "UOM Master",
      //   Action: `UOM Master Opened by ${getUserID()}`,
      //   NewData: "",
      //   OldData: "",
      //   Remarks: "",
      //   UserId: getUserID(),
      //   PlantCode: getUserPlant()
      // });
    };
    executeSequentially();
  }, []);

  const fetchPlantCodes = async () => {
    try {
      const response = await fetch('/api/master/get-all-plant-code', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data: PlantCode[] = await response.json();
      setPlantCodes(
        data.map(item => ({ value: item.plant_code, label: item.plant_code }))
      );
    } catch (error) {
      console.error('Error fetching plant codes:', error);
      toast.error('Failed to fetch plant codes');
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<PrinterData[]>(
        '/api/master/printer/get-all-printer',
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);
  const handleRowSelect = (row: PrinterData) => {
    setPrinterMakeModel(row.printer_make);
    setPrinterName(row.printer_name);
    setPrinterSrNo(row.printer_sr_no);
    setPrinterIPPort(row.printer_ip);
    setDpi(row.dpi);
    setAssetCode(row.asset_code);
    setDefaultPrinter('');
    setStatus(row.status || 'active');
    setPlantCode(row.plant_code);
    setIsEditing(true);
    setSelectedUnit(row.id?.toString() || row.printer_sr_no);
    
    // Scroll to top of the page to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // insertAuditTrail({
    //   AppType: "Web",
    //   Activity: "Pallet Master",
    //   Action: `Pallet Edit Initiated by ${getUserID()}`,
    //   NewData: "",
    //   OldData: JSON.stringify(row),
    //   Remarks: "",
    //   UserId: getUserID(),
    //   PlantCode: getUserPlant()
    // });
  };

  const handleCancel = () => {
    setPrinterMakeModel('');
    setPrinterName('');
    setPrinterSrNo('');
    setPrinterIPPort('');
    setDpi('');
    setAssetCode('');
    setDefaultPrinter('');
    setStatus('');
    setPlantCode('');
    setIsEditing(false);
    setSelectedUnit(null);
  };

  const handleSave = async () => {
    if (!plantCode) {
      sooner('Please select the plant code');
      return;
    }
    if (!printerMakeModel) {
      sooner('Please fill the printer make-model');
      printerMakeModelRef.current?.focus();
      return;
    }
    if (!printerName) {
      sooner('Please fill the printer name');
      printerNameRef.current?.focus();
      return;
    }
    if (!printerSrNo) {
      sooner('Please fill the printer serial number');
      printerSrNoRef.current?.focus();
      return;
    }
    if (!printerIPPort) {
      sooner('Please fill the printer IP:Port');
      printerIPPortRef.current?.focus();
      return;
    }
    if (!dpi) {
      sooner('Please fill the DPI');
      dpiRef.current?.focus();
      return;
    }
    if (!assetCode) {
      sooner('Please fill the asset code');
      assetCodeRef.current?.focus();
      return;
    }
    if (!status) {
      sooner('Please select the status');
      return;
    }
    setIsSaving(true);
    try {
      const newUnitData = {
        plant_code: plantCode.trim(),
        printer_name: printerName.trim(),
        printer_sr_no: printerSrNo.trim(),
        printer_ip: printerIPPort.trim(),
        printer_make: printerMakeModel.trim(),
        asset_code: assetCode.trim(),
        status: status.trim(),
        dpi: dpi.trim(),
        line_code: '',
        company_code: '',
      };

      const response = await axios.post(
        '/api/master/printer/insert-printer',
        newUnitData,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      const { Status, Message } = response.data;

      if (Status === 'T') {
        toast(Message, {
          description: 'Printer added successfully',
          position: 'top-right',
        });
        fetchData();
        handleCancel();
        // insertAuditTrail({
        //   AppType: 'Web',
        //   Activity: 'UOM Master',
        //   Action: `New UOM Added by ${getUserID()}`,
        //   NewData: JSON.stringify(newUnitData),
        //   OldData: '',
        //   Remarks: '',
        //   UserId: getUserID(),
        //   PlantCode: getUserPlant(),
        // });
      } else if (Status === 'F') {
        toast(Message, { description: 'Error', position: 'top-right' });
      } else {
        toast('Unexpected Error', {
          description: 'Error',
          position: 'top-right',
        });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || error.message;
      toast(errorMessage, { description: 'Error', position: 'top-right' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUnit) return;
    if (!plantCode) {
      sooner('Please select the plant code');
      return;
    }
    if (!printerMakeModel) {
      sooner('Please fill the printer make-model');
      printerMakeModelRef.current?.focus();
      return;
    }
    if (!printerName) {
      sooner('Please fill the printer name');
      printerNameRef.current?.focus();
      return;
    }
    if (!printerSrNo) {
      sooner('Please fill the printer serial number');
      printerSrNoRef.current?.focus();
      return;
    }
    if (!printerIPPort) {
      sooner('Please fill the printer IP:Port');
      printerIPPortRef.current?.focus();
      return;
    }
    if (!dpi) {
      sooner('Please fill the DPI');
      dpiRef.current?.focus();
      return;
    }
    if (!assetCode) {
      sooner('Please fill the asset code');
      assetCodeRef.current?.focus();
      return;
    }

    if (!status) {
      sooner('Please select the status');
      return;
    }
    setIsUpdating(true);
    try {
      const oldUnit = data.find(item => item.id?.toString() === selectedUnit || item.printer_sr_no === selectedUnit);

      const updatedUnit = {
        id: selectedUnit,
        plant_code: plantCode || oldUnit?.plant_code,
        printer_name: printerName || oldUnit?.printer_name,
        printer_sr_no: printerSrNo || oldUnit?.printer_sr_no,
        printer_ip: printerIPPort || oldUnit?.printer_ip,
        printer_make: printerMakeModel || oldUnit?.printer_make,
        asset_code: assetCode || oldUnit?.asset_code,
        status: status || oldUnit?.status,
        old_plant_code: oldUnit?.plant_code || '',
        old_printer_sr_no: oldUnit?.printer_sr_no || '',
        old_printer_ip: oldUnit?.printer_ip || '',
        line_code: oldUnit?.line_code || '',
        dpi: dpi || oldUnit?.dpi,
        company_code: oldUnit?.company_code || '',
      };

      const response = await axios.post(
        '/api/master/printer/update-printer',
        updatedUnit,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      const { Status, Message } = response.data;

      if (Status === 'T') {
        toast(Message, {
          description: 'Printer updated successfully',
          position: 'top-right',
        });
        fetchData();
        handleCancel();

        // insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "UOM Master",
        //   Action: `UOM Updated by ${getUserID()}`,
        //   NewData: JSON.stringify(updatedUnit),
        //   OldData: JSON.stringify({ Unit: selectedUnit, Description: unitDesc }),
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: getUserPlant()
        // });
      } else if (Status === 'F') {
        toast(Message, { description: 'Error', position: 'top-right' });
      } else {
        toast('Unexpected Error', {
          description: 'Error',
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error updating data:', error);
      toast('Failed to update Pallet Barcode', {
        description: 'Error',
        position: 'top-right',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof PrinterData)[] = [
        'printer_name',
        'printer_make',
        'printer_sr_no',
        'printer_ip',
        'asset_code',
        'status',
        'created_by',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const pingPrinter = async (printerIp: string) => {
    const ip = printerIp.split(':')[0];
    setPingStatus(prev => ({ ...prev, [printerIp]: 'pinging' }));

    try {
      const response = await axios.get(
        `/api/master/printer/ping-printer?ip=${ip}`,
        {
          headers: { authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      const pingData = response.data;

      if (pingData.alive && pingData.packets.received > 0) {
        setPingStatus(prev => ({ ...prev, [printerIp]: 'success' }));
        toast.success(
          `Printer at ${printerIp} is online! Response time: ${pingData.time}ms`
        );
      } else {
        setPingStatus(prev => ({ ...prev, [printerIp]: 'error' }));
        toast.warning(
          `Printer at ${printerIp} is not responding. Packets received: ${pingData.packets.received}/${pingData.packets.transmitted}`
        );
      }
    } catch (error) {
      console.error('Ping error:', error);
      setPingStatus(prev => ({ ...prev, [printerIp]: 'error' }));
      toast.error(
        `Failed to ping printer at ${printerIp}. Please check network connectivity.`
      );
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setPingStatus(prev => ({ ...prev, [printerIp]: 'idle' }));
    }, 5000);
  };

  // Update the ping button styles for better visibility
  const pingButtonStyles = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    
      @keyframes loading-pulse {
        0% {
          background-color: #6b7280;
        }
        50% {
          background-color: #9ca3af;
        }
        100% {
          background-color: #6b7280;
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    
      .ping-button {
        position: relative;
        transition: all 0.3s ease;
        min-width: 70px;
        font-weight: 500;
      }
    
      .ping-button.pinging {
        background: #6b7280 !important;
        color: white !important;
        border-color: #6b7280 !important;
      }

      .ping-button.pinging::after {
        content: '';
        animation: spin 1s linear infinite;
      }
    
      .ping-button.success {
        background: #10B981 !important;
        color: white !important;
        border-color: #10B981 !important;
        animation: pulse 0.5s ease-in-out;
      }
    
      .ping-button.error {
        background: #EF4444 !important;
        color: white !important;
        border-color: #EF4444 !important;
        animation: pulse 0.5s ease-in-out;
      }
    
      .ping-button:not(.pinging):not(.success):not(.error):hover {
        transform: scale(1.05);
        border-color: hsl(var(--primary));
        color: hsl(var(--primary));
      }
    `;

  // Add the styles to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = pingButtonStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              Printer Master{' '}
              <span className="text-sm font-normal text-muted-foreground">
                (* Fields Are Mandatory)
              </span>
            </div>
            {isEditing && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Editing Mode
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="plantCode">Plant Code *</Label>
                <Select 
                  value={plantCode} 
                  onValueChange={setPlantCode}
                  disabled={isEditing}
                >
                  <SelectTrigger className={isEditing ? 'bg-muted cursor-not-allowed' : ''}>
                    <SelectValue placeholder="Select plant code..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plantCodes.map(plant => (
                      <SelectItem key={plant.value} value={plant.value}>
                        {plant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Plant code cannot be changed
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerMakeModel">Printer Make-Model *</Label>
                <Input
                  id="printerMakeModel"
                  value={printerMakeModel}
                  onChange={e => setPrinterMakeModel(e.target.value)}
                  required
                  ref={printerMakeModelRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerName">Printer Name *</Label>
                <Input
                  id="printerName"
                  value={printerName}
                  onChange={e => setPrinterName(e.target.value)}
                  required
                  ref={printerNameRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerSrNo">Printer SrNo *</Label>
                <Input
                  id="printerSrNo"
                  value={printerSrNo}
                  onChange={e => setPrinterSrNo(e.target.value)}
                  required
                  ref={printerSrNoRef}
                  disabled={isEditing}
                  className={isEditing ? 'bg-muted cursor-not-allowed' : ''}
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Serial number cannot be changed
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerIPPort">Printer IP:Port *</Label>
                <Input
                  id="printerIPPort"
                  value={printerIPPort}
                  onChange={e => setPrinterIPPort(e.target.value)}
                  required
                  ref={printerIPPortRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dpi">Dpi *</Label>
                <Input
                  id="dpi"
                  value={dpi}
                  onChange={e => setDpi(e.target.value)}
                  required
                  ref={dpiRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetCode">Asset Code *</Label>
                <Input
                  id="assetCode"
                  value={assetCode}
                  onChange={e => setAssetCode(e.target.value)}
                  required
                  ref={assetCodeRef}
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="status">Default Printer *</Label>
                <Select value={defaultPrinter} onValueChange={setDefaultPrinter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Yes or No " />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={handleSave} disabled={isEditing || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!isEditing || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="mx-auto mt-10 w-full">
        <CardContent>
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="search">Search:</Label>
                <Input
                  id="search"
                  className="max-w-sm"
                  placeholder="Search by name, make, serial no, IP..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value.trim())}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {filteredData.length} printer{filteredData.length !== 1 ? 's' : ''}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Action</TableHead>
                  <TableHead>Printer Name</TableHead>
                  <TableHead>Printer Make</TableHead>
                  <TableHead>Serial No</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>DPI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plant Code</TableHead>
                  <TableHead className="w-[100px]">Ping</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      <Loading size="md" label="Loading printers..." />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No printers found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map(row => (
                    <TableRow 
                      key={row.id || row.printer_sr_no}
                      className={selectedUnit === (row.id?.toString() || row.printer_sr_no) ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Button
                          size="sm"
                          variant={selectedUnit === (row.id?.toString() || row.printer_sr_no) ? 'default' : 'outline'}
                          onClick={() => handleRowSelect(row)}
                        >
                          {selectedUnit === (row.id?.toString() || row.printer_sr_no) ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{row.printer_name}</TableCell>
                      <TableCell>{row.printer_make}</TableCell>
                      <TableCell>{row.printer_sr_no}</TableCell>
                      <TableCell>{row.printer_ip}</TableCell>
                      <TableCell>{row.asset_code}</TableCell>
                      <TableCell>{row.dpi}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          row.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell>{row.plant_code}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pingPrinter(row.printer_ip)}
                          className={`ping-button ${pingStatus[row.printer_ip] || 'idle'}`}
                          disabled={pingStatus[row.printer_ip] === 'pinging'}
                        >
                          {pingStatus[row.printer_ip] === 'pinging'
                            ? '⟳'
                            : pingStatus[row.printer_ip] === 'success'
                              ? '✓'
                              : pingStatus[row.printer_ip] === 'error'
                                ? '✕'
                                : 'Ping'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Component */}
            <div className="md:text-md mt-4 flex items-center justify-between text-sm">
              <div>
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
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PalletMaster;
