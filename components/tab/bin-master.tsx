'use client';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
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
import CustomDropdown from '../CustomDropdown';
import { toast } from 'sonner';
import { Loader2, FileText, Download, Upload, Info } from 'lucide-react';
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
import TableSearch from '@/utils/tableSearch';

interface WarehouseCode {
  warehouse_code: string;
}

interface WarehouseLocation {
  id: number;
  warehouse_code: string;
  rack: string;
  bin: string;
  location_status: string;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
}

const BinMaster: React.FC = () => {
  const [warehouseValue, setWarehouseValue] = useState('');
  const [warehouseCodes, setWarehouseCodes] = useState<WarehouseCode[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [rack, setRack] = useState('');
  const [bin, setBin] = useState('');
  const [status, setStatus] = useState('Active');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<WarehouseLocation | null>(null);
  const [oldData, setOldData] = useState<WarehouseLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token');
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rackRef = useRef<HTMLInputElement>(null);
  const binRef = useRef<HTMLInputElement>(null);

  // Function to get User_ID from the JWT token
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
    return '';
  };

  useEffect(() => {
    const fetchDataSequentially = async () => {
      await fetchWarehouseCodes();
      await fetchLocations();
    };
    fetchDataSequentially();
  }, []);

  const fetchWarehouseCodes = async () => {
    try {
      const response = await axios.get(`/api/master/get-all-wh-code`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setWarehouseCodes(response.data);
      } else {
        toast.error('Failed to fetch warehouse codes');
      }
    } catch (error) {
      toast.error('Failed to fetch warehouse codes');
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/master/get-all-wh-location`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setLocations(response.data);
      } else {
        toast.error('Failed to fetch warehouse locations');
      }
    } catch (error) {
      toast.error('Failed to fetch warehouse locations');
    } finally {
      setLoading(false);
    }
  };

  // Logic for pagination
  const filteredData = useMemo(() => {
    return locations.filter(item => {
      const searchableFields: (keyof WarehouseLocation)[] = [
        'rack',
        'warehouse_code',
        'bin',
        'updated_by',
        'created_by',
        'location_status',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [locations, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handleSave = async () => {
    if (!warehouseValue.trim()) {
      toast.error('Please select the warehouse');
      return;
    }
    if (!rack.trim()) {
      toast.error('Please enter the rack');
      rackRef.current?.focus();
      return;
    }
    if (!bin.trim()) {
      toast.error('Please enter the bin');
      binRef.current?.focus();
      return;
    }
    if (!status.trim()) {
      toast.error('Please select the status');
      return;
    }

    const userID = getUserID();
    if (!userID) {
      toast.error('Failed to retrieve user ID');
      return;
    }

    const newLocationData = {
      warehouse_code: warehouseValue.trim(),
      rack: rack.trim(),
      bin: bin.trim(),
      user: userID.trim(),
      location_status: status.trim(),
    };

    setIsSaving(true);
    try {
      const response = await axios.post(
        `/api/masters/wh-location/insert`,
        newLocationData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.Status === 'F') {
        toast.error(
          response.data.Message || 'Failed to save warehouse location'
        );
        return;
      }

      toast.success(
        response.data.Message || 'Warehouse location added successfully'
      );
      fetchLocations();
      handleClear();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Failed to save warehouse location'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedLocation) return;
    if (!warehouseValue.trim()) {
      toast.error('Please select the warehouse');
      return;
    }
    if (!rack.trim()) {
      toast.error('Please enter the rack');
      rackRef.current?.focus();
      return;
    }
    if (!bin.trim()) {
      toast.error('Please enter the bin');
      binRef.current?.focus();
      return;
    }
    if (!status.trim()) {
      toast.error('Please select the status');
      return;
    }

    const userID = getUserID();
    if (!userID) {
      toast.error('Failed to retrieve user ID');
      return;
    }

    const updatedLocationData = {
      id: selectedLocation.id,
      warehouse_code: warehouseValue.trim(),
      rack: rack.trim(),
      bin: bin.trim(),
      user: userID.trim(),
      location_status: status.trim(),
    };

    setIsUpdating(true);
    try {
      const response = await axios.patch(
        `/api/master/update-wh-location`,
        updatedLocationData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.Status === 'F') {
        toast.error(
          response.data.Message || 'Failed to update warehouse location'
        );
        return;
      }

      toast.success(
        response.data.Message || 'Warehouse location updated successfully'
      );
      fetchLocations();
      handleClear();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Failed to update warehouse location'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClear = () => {
    setWarehouseValue('');
    setRack('');
    setBin('');
    setStatus('Active');
    setSelectedLocation(null);
    setOldData(null);
    setIsUpdating(false);
  };

  const handleRowSelect = (index: number) => {
    const selectedData = paginatedData[index];
    setSelectedLocation(selectedData);
    setOldData(selectedData);
    setWarehouseValue(selectedData.warehouse_code);
    setRack(selectedData.rack);
    setBin(selectedData.bin || '');
    setStatus(selectedData.location_status || 'Active');
    setIsUpdating(true);
  };

  const warehouseOptions = warehouseCodes.map(code => ({
    value: code.warehouse_code,
    label: code.warehouse_code,
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    // Validate file extension
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setFileUploading(true);

    try {
      const userID = getUserID();
      const formData = new FormData();
      formData.append('excelFile', selectedFile);
      if (userID) {
        formData.append('username', userID);
      }

      const response = await axios.post(
        `/api/master/upload-wh-location-excel`,
        formData,
        {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.Status === 'F') {
        toast.error(
          response.data.Message || 'Failed to upload warehouse locations'
        );
      } else {
        toast.success(
          response.data.Message || 'Warehouse locations uploaded successfully'
        );
        await fetchLocations();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setFileUploading(false);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById(
        'excel-upload'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const downloadSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/bin_wh_upload.xlsx';
    link.download = 'bin_wh_upload.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Bin Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <CustomDropdown
                  options={warehouseOptions}
                  value={warehouseValue}
                  onValueChange={setWarehouseValue}
                  placeholder="Select warehouse..."
                  searchPlaceholder="Search warehouse..."
                  emptyText="No warehouse found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rack">Rack *</Label>
                <Input
                  ref={rackRef}
                  id="rack"
                  required
                  value={rack}
                  onChange={e => setRack(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bin">Bin *</Label>
                <Input
                  ref={binRef}
                  id="bin"
                  value={bin}
                  onChange={e => setBin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
              <Button
                onClick={handleSave}
                disabled={isUpdating || isSaving}
                type="submit"
                className="w-full sm:w-auto"
              >
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
                className="w-full sm:w-auto"
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
              <Button
                onClick={handleClear}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Excel Upload Card */}
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <span>Bulk Upload Bin Locations</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Info className="mr-2 h-4 w-4" />
                    File Info
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excel File Requirements</AlertDialogTitle>
                    <AlertDialogDescription>
                      <p className="mb-2">
                        Your Excel file must contain the following headers:
                      </p>
                      <ul className="list-disc space-y-1 pl-5">
                        <li>warehouse_code</li>
                        <li>rack</li>
                        <li>bin</li>
                        <li>location_status</li>
                      </ul>
                      <p className="mt-2">
                        If your file doesn't match this format, it will be
                        rejected.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
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
          <div className="space-y-4">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={fileUploading}
                />
              </div>
              <Button
                onClick={handleUploadFile}
                disabled={fileUploading || !selectedFile}
                className="w-full sm:w-auto"
              >
                {fileUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <div className="flex items-center rounded-md bg-muted p-2">
                <FileText className="mr-2 h-4 w-4" />
                <span className="text-sm">{selectedFile.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto mt-5 w-full">
        <CardContent className="p-4 md:p-6">
          <div className="mt-4 md:mt-8">
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
                <TableSearch onSearch={handleSearch} />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">Action</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Warehouse Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Rack
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">Bin</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">Status</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Created by
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Created On
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Updated by
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Updated On
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        <Loading size="md" label="Loading locations..." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Button
                            variant={'ghost'}
                            onClick={() => handleRowSelect(index)}
                            className="px-2 py-1 text-xs"
                          >
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.warehouse_code}
                        </TableCell>
                        <TableCell>{row.rack}</TableCell>
                        <TableCell>{row.bin || ''}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              row.location_status === 'Active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {row.location_status}
                          </span>
                        </TableCell>
                        <TableCell>{row.created_by}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(row.created_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {row.updated_by ? row.updated_by : ''}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.updated_date
                            ? new Date(row.updated_date).toLocaleDateString()
                            : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Component */}
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
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BinMaster;
