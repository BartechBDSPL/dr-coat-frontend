'use client';
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
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
import CustomDropdown from '../CustomDropdown';
import { toast } from 'sonner';

// import insertAuditTrail from '@/utils/insertAudit';
import { delay } from '@/utils/delay';
import TableSearch from '@/utils/tableSearch';
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

interface CompanyOption {
  value: string;
  label: string;
}

interface PlantDetail {
  plant_id: number;
  plant_code: string;
  plant_name: string;
  address: string;
  city: string;
  state: string;
  company_code: string;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
  plant_status: string;
  barcode: string;
}

// Function to get user_id from the JWT token
const getUserID = () => {
  const token = Cookies.get('token');
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.user.user_id;
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
  return 'Guest';
};

const PlantMasterForm = () => {
  const [plantCode, setPlantCode] = useState('');
  const [plantName, setPlantName] = useState('');
  const [plantAddress, setPlantAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('Active');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [data, setData] = useState<PlantDetail[]>([]);
  const [companyNameOptions, setCompanyNameOptions] = useState<CompanyOption[]>(
    []
  );
  const [companyName, setCompanyName] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [oldData, setOldData] = useState<PlantDetail | null>(null);
  // for search and pagination
  const token = Cookies.get('token');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const plantCodeRef = useRef<HTMLInputElement>(null);
  const plantNameRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDataSequentially = async () => {
      await delay(20);
      fetchCompanyNames();
      await delay(50);
      fetchPlantDetails();
      await delay(50);
      // await insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "Plant Master",
      //   Action: `Plant Master Opened by ${getUserID()}`,
      //   NewData: "",
      //   OldData: "",
      //   Remarks: "",
      //   UserId: getUserID(),
      //   PlantCode: ""
      // });
    };
    fetchDataSequentially();
  }, []);

  const fetchCompanyNames = async () => {
    try {
      const response = await axios.get('/api/master/company/all-details');
      const options: CompanyOption[] = response.data
        .filter((company: any) => company.company_status === 'Active')
        .map((company: { company_code: string; company_name: string }) => ({
          value: company.company_code,
          label: company.company_name,
        }));
      setCompanyNameOptions(options);
    } catch (error) {
      console.error('Error fetching company names:', error);
      toast.error('Failed to fetch company names');
    }
  };

  const fetchPlantDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/master/plant/all-details');
      setData(response.data);
    } catch (error: any) {
      console.error('Error fetching plant details:', error);
      toast.error('Failed to fetch plant details');
    } finally {
      setIsLoading(false);
    }
  };

  // Logic for pagination
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof PlantDetail)[] = [
        'plant_id',
        'address',
        'city',
        'company_code',
        'plant_name',
        'plant_code',
        'plant_status',
        'updated_by',
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

  const handleValueChange = (newValue: string) => {
    setCompanyName(newValue);
  };

  const handleCancel = () => {
    setCompanyName('');
    setPlantCode('');
    setPlantName('');
    setPlantAddress('');
    setCity('');
    setState('');
    setStatus('Active');
    setIsUpdateMode(false);
    setSelectedPlantId(null);
    setOldData(null);
  };

  const handleRowSelect = (row: PlantDetail) => {
    setOldData(row);
    setCompanyName(row.company_code);
    setPlantCode(row.plant_code);
    setPlantName(row.plant_name);
    setPlantAddress(row.address);
    setCity(row.city);
    setState(row.state);
    setStatus(row.plant_status);
    setIsUpdateMode(true);
    setSelectedPlantId(row.plant_id);

    // // Insert audit trail for edit action
    // insertAuditTrail({
    //   AppType: "Web",
    //   Activity: "Plant Master",
    //   Action: `Plant Edit Initiated by ${getUserID()}`,
    //   NewData: "",
    //   OldData: JSON.stringify(row),
    //   Remarks: "",
    //   UserId: getUserID(),
    //   PlantCode: row.plant_code
    // });
  };

  const handleSave = async () => {
    if (!companyName) {
      toast.error('Please select the company name');
      return;
    }
    if (!plantCode.trim()) {
      toast.error('Please fill the plant code');
      plantCodeRef.current?.focus();
      return;
    }
    if (!plantName.trim()) {
      toast.error('Please fill the plant name');
      plantNameRef.current?.focus();
      return;
    }
    setIsSaving(true);
    try {
      const newPlantData = {
        companyCode: companyName.trim(),
        plantCode: plantCode.trim(),
        plantName: plantName.trim(),
        address: plantAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        plantStatus: status.trim(),
        createdBy: getUserID(),
      };

      const response = await axios.post(
        '/api/master/plant/insert-details',
        newPlantData
      );
      const responseData = response.data;

      if (responseData.Status === 'T') {
        toast.success(responseData.Message);
        fetchPlantDetails();
        handleCancel();

        // // Insert audit trail for save action
        // insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "Plant Master",
        //   Action: `New Plant Added by ${getUserID()}`,
        //   NewData: JSON.stringify(newPlantData),
        //   OldData: "",
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: plantCode
        // });
      } else if (responseData.Status === 'F') {
        toast.error(responseData.Message);
      }
    } catch (error: any) {
      console.error('Error saving plant details:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!companyName) {
      toast.error('Please select the company name');
      return;
    }
    if (!plantCode.trim()) {
      toast.error('Please fill the plant code');
      plantCodeRef.current?.focus();
      return;
    }
    if (!plantName.trim()) {
      toast.error('Please fill the plant name');
      plantNameRef.current?.focus();
      return;
    }
    if (!selectedPlantId || !oldData) return;
    setIsUpdating(true);
    try {
      const updatedPlantData = {
        plantId: selectedPlantId,
        plantCode: plantCode.trim(),
        plantName: plantName.trim(),
        address: plantAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        plantStatus: status.trim(),
        updatedBy: getUserID(),
      };

      const response = await axios.patch(
        '/api/master/plant/update-details',
        updatedPlantData
      );
      const responseData = response.data;

      if (responseData.Status === 'F') {
        toast.error(responseData.Message);
      } else if (responseData.Status === 'T') {
        toast.success(responseData.Message);
        fetchPlantDetails(); // Refresh the table
        handleCancel(); // Reset the form

        // Prepare audit data
        const changedFields: string[] = [];
        if (oldData.plant_name !== plantName)
          changedFields.push(
            `Plant Name: ${oldData.plant_name} -> ${plantName}`
          );
        if (oldData.address !== plantAddress)
          changedFields.push(`Address: ${oldData.address} -> ${plantAddress}`);
        if (oldData.city !== city)
          changedFields.push(`City: ${oldData.city} -> ${city}`);
        if (oldData.state !== state)
          changedFields.push(`State: ${oldData.state} -> ${state}`);
        if (oldData.plant_status !== status)
          changedFields.push(`Status: ${oldData.plant_status} -> ${status}`);

        // Insert audit trail for update action
        // insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "Plant Master",
        //   Action: `Plant Updated by ${getUserID()}`,
        //   NewData: changedFields.join(", "),
        //   OldData: JSON.stringify(oldData),
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: plantCode
        // });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error('Failed to update plant details');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Plant Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company *</Label>
                <CustomDropdown
                  options={companyNameOptions}
                  value={companyName}
                  onValueChange={handleValueChange}
                  placeholder="Select company..."
                  searchPlaceholder="Search company..."
                  emptyText="No company found."
                  disabled={isUpdateMode}
                />
                <Label className="mt-1 block text-sm text-muted-foreground">
                  Active companies will show here
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantCode">Plant Code *</Label>
                <Input
                  id="plantCode"
                  ref={plantCodeRef}
                  value={plantCode}
                  onChange={e => setPlantCode(e.target.value)}
                  disabled={isUpdateMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantName">Plant Name *</Label>
                <Input
                  id="plantName"
                  ref={plantNameRef}
                  value={plantName}
                  onChange={e => setPlantName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantAddress">Plant Address </Label>
                <Input
                  id="plantAddress"
                  value={plantAddress}
                  onChange={e => setPlantAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State </Label>
                <Input
                  id="state"
                  value={state}
                  onChange={e => setState(e.target.value)}
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
                disabled={isUpdateMode || isSaving}
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
                variant="outline"
                onClick={handleUpdate}
                disabled={!isUpdateMode || isUpdating}
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
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="mx-auto mt-10 w-full">
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
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Action
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Company Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Plant Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Plant Name
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Plant Address
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      City
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      State
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Status
                    </TableHead>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">
                        <Loading size="md" label="Loading plants..." />
                      </TableCell>
                    </TableRow>
                  ) : Array.isArray(paginatedData) &&
                    paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <TableRow key={row.plant_id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={() => handleRowSelect(row)}
                            className="px-2 py-1 text-xs"
                          >
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.company_code}
                        </TableCell>
                        <TableCell>{row.plant_code}</TableCell>
                        <TableCell>{row.plant_name}</TableCell>
                        <TableCell>{row.address}</TableCell>
                        <TableCell>{row.city}</TableCell>
                        <TableCell>{row.state}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              row.plant_status === 'Active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {row.plant_status}
                          </span>
                        </TableCell>
                        <TableCell>{row.created_by}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(row.created_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{row.updated_by || ''}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.updated_date
                            ? new Date(row.updated_date).toLocaleDateString()
                            : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">
                        <div className="flex h-32 items-center justify-center">
                          <span className="text-muted-foreground">
                            No data available
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
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

export default PlantMasterForm;
