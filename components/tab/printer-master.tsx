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
import { BACKEND_URL } from '@/lib/constants';
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
  PID: number;
  PlantCode: string;
  PrinterName: string;
  PrinterMake: string;
  PrinterSrNo: string;
  PrinterIp: string;
  AssetCode: string;
  DefaultPrinter: string;
  Status: string;
  dpi: string;
  CreatedBy: string;
  CreatedOn: string;
  UpdatedBy: string | null;
  UpdatedOn: string | null;
  CompCode: string | null;
  LineCode: string;
  PlantName: string;
}
interface PlantCode {
  PlantCode: string;
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
      const response = await fetch(
        `${BACKEND_URL}/api/master/get-all-plant-code`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      const data: PlantCode[] = await response.json();
      setPlantCodes(
        data.map(item => ({ value: item.PlantCode, label: item.PlantCode }))
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
        `${BACKEND_URL}/api/master/get-all-printer`,
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
    setPrinterMakeModel(row.PrinterMake);
    setPrinterName(row.PrinterName);
    setPrinterSrNo(row.PrinterSrNo);
    setPrinterIPPort(row.PrinterIp);
    setDpi(row.dpi);
    setAssetCode(row.AssetCode);
    setDefaultPrinter(row.DefaultPrinter);
    setStatus(row.Status);
    setPlantCode(row.PlantCode);
    setIsEditing(true);
    setIsUpdating(true);
    setSelectedUnit(row.PID.toString());
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
    setIsEditing(false);
    setIsUpdating(false);
    setSelectedUnit(null);
  };

  const handleSave = async () => {
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
        PlantCode: plantCode.trim(),
        DeviceName: printerName.trim(),
        DeviceSrNo: printerSrNo.trim(),
        DeviceIp: printerIPPort.trim(),
        DeviceMake: printerMakeModel.trim(),
        AssetCode: assetCode.trim(),
        Status: status.trim(),
        Createdby: getUserID(),
        dpi: dpi.trim(),
        DefaultValue: '',
        LineCode: '',
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/master/insert-printer`,
        newUnitData,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      const { Status, Message } = response.data[0];

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
      const oldUnit = data.find(item => item.PID.toString() === selectedUnit);

      const updatedUnit = {
        DvcID: selectedUnit,
        PlantCode: plantCode || oldUnit?.PlantCode,
        DeviceName: printerName || oldUnit?.PrinterName,
        DeviceSrNo: printerSrNo || oldUnit?.PrinterSrNo,
        DeviceIp: printerIPPort || oldUnit?.PrinterIp,
        DeviceMake: printerMakeModel || oldUnit?.PrinterMake,
        AssetCode: assetCode || oldUnit?.AssetCode,
        Status: status || oldUnit?.Status,
        Updatedby: getUserID(),
        OldPlantCode: oldUnit?.PlantCode || '',
        OldDeviceSrNo: oldUnit?.PrinterSrNo || '',
        OldDeviceIp: oldUnit?.PrinterIp || '',
        LineCode: oldUnit?.LineCode || '',
        dpi: dpi || oldUnit?.dpi,
        DefaultValue: defaultPrinter || oldUnit?.DefaultPrinter,
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/master/update-printer`,
        updatedUnit,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      const { Status, Message } = response.data[0];

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
        'PrinterName',
        'PrinterMake',
        'PrinterSrNo',
        'PrinterIp',
        'AssetCode',
        'DefaultPrinter',
        'Status',
        'CreatedBy',
        'UpdatedBy',
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
        `${BACKEND_URL}/api/master/ping-printer?ip=${ip}`,
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
    
      .ping-button {
        position: relative;
        transition: all 0.3s ease;
        min-width: 80px;
      }
    
      .ping-button.pinging {
        background: #6b7280;
        animation: loading-pulse 1s ease-in-out infinite;
      }
    
      .ping-button.success {
        background: #10B981;
        animation: pulse 1s ease-in-out;
      }
    
      .ping-button.error {
        background: #EF4444;
        animation: pulse 1s ease-in-out;
      }
    
      .ping-button:not(.pinging):hover {
        transform: scale(1.05);
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
          <CardTitle>
            Printer Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* <div className="space-y-2">
                <Label htmlFor="plantCode">Plant Code *</Label>
                <CustomDropdown
                  options={plantCodes}
                  value={plantCode}
                  onValueChange={setPlantCode}
                  placeholder="Select plant code..."
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
               
                />
              </div> */}
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
                />
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
              <Button onClick={handleSave} disabled={isUpdating || isSaving}>
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
                disabled={!isUpdating || isUpdating}
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
                <span>Search:</span>
                <Input
                  className="max-w-sm"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value.trim())}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Printer Name</TableHead>
                  <TableHead>Printer Make</TableHead>
                  <TableHead>Printer SrNo</TableHead>
                  <TableHead>Printer IP</TableHead>
                  <TableHead>Ping</TableHead>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center">
                      <Loading size="md" label="Loading printers..." />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map(row => (
                    <TableRow key={row.PID}>
                      <TableCell>
                        <Button
                          variant={'ghost'}
                          onClick={() => handleRowSelect(row)}
                        >
                          Select
                        </Button>
                      </TableCell>
                      <TableCell>{row.PrinterName}</TableCell>
                      <TableCell>{row.PrinterMake}</TableCell>
                      <TableCell>{row.PrinterSrNo}</TableCell>
                      <TableCell>{row.PrinterIp}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => pingPrinter(row.PrinterIp)}
                          className={`ping-button ${pingStatus[row.PrinterIp] || 'idle'}`}
                          disabled={pingStatus[row.PrinterIp] === 'pinging'}
                        >
                          {pingStatus[row.PrinterIp] === 'pinging'
                            ? '⟳'
                            : pingStatus[row.PrinterIp] === 'success'
                              ? '✓'
                              : pingStatus[row.PrinterIp] === 'error'
                                ? '✕'
                                : 'Ping'}
                        </Button>
                      </TableCell>
                      <TableCell>{row.AssetCode}</TableCell>
                      <TableCell>{row.Status}</TableCell>
                      <TableCell>{row.CreatedBy}</TableCell>
                      <TableCell>
                        {new Date(row.CreatedOn).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{row.UpdatedBy}</TableCell>
                      <TableCell>
                        {row.UpdatedOn
                          ? new Date(row.UpdatedOn).toLocaleDateString()
                          : ''}
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
