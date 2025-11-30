'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '@/lib/axios-config';
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
import { Loading } from '@/components/loading';
import Cookies from 'js-cookie';
import { getUserID } from '@/utils/getFromSession';
import TableSearch from '@/utils/tableSearch';
import { logError } from '@/utils/loggingException';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface CompanyFormData {
  companyCode: string;
  companyName: string;
  address?: string;
  city?: string;
  state?: string;
  companyStatus: 'Active' | 'Inactive';
}

interface CompanyData {
  company_id: number;
  company_code: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  company_status: string;
  barcode: string;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
}

const CompanyMasterForm: React.FC = () => {
  const [data, setData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCID, setSelectedCID] = useState<number | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [oldData, setOldData] = useState<CompanyData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const token = Cookies.get('token');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CompanyFormData>({
    defaultValues: {
      companyCode: '',
      companyName: '',
      address: '',
      city: '',
      state: '',
      companyStatus: 'Active',
    },
  });
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axios
      .get('/api/master/company/all-details')
      .then((response: any) => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
        toast.error('Failed to fetch details. Try again');
      });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof CompanyData)[] = [
        'company_id',
        'address',
        'city',
        'state',
        'company_code',
        'company_name',
        'company_status',
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
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handleSave = async (formData: CompanyFormData) => {
    setIsSaving(true);
    try {
      const newCompanyData = {
        companyCode: formData.companyCode.trim(),
        companyName: formData.companyName.trim(),
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        companyStatus: formData.companyStatus,
        createdBy: getUserID().trim(),
      };

      const response = await axios.post(
        '/api/master/company/insert-details',
        newCompanyData
      );
      const responseData = response.data;

      if (responseData.Status === 'F') {
        toast.error(responseData.Message);
        logError(
          responseData.Message.toLocaleString(),
          '',
          'Company Master',
          getUserID()
        );
      } else if (responseData.Status === 'T') {
        toast.success(responseData.Message);
        fetchData();
        handleCancel();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      logError(errorMessage, error, 'Company Master', getUserID());
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowSelect = (index: number) => {
    const selectedData = paginatedData[index];
    setOldData(selectedData);
    setValue('companyCode', selectedData.company_code);
    setValue('companyName', selectedData.company_name);
    setValue('address', selectedData.address || '');
    setValue('city', selectedData.city || '');
    setValue('state', selectedData.state || '');
    setValue(
      'companyStatus',
      (selectedData.company_status === 'Active' ? 'Active' : 'Inactive') as
        | 'Active'
        | 'Inactive'
    );
    setSelectedCID(selectedData.company_id);
    setIsUpdateMode(true);
  };

  const handleCancel = () => {
    reset({
      companyCode: '',
      companyName: '',
      address: '',
      city: '',
      state: '',
      companyStatus: 'Active',
    });
    setSelectedCID(null);
    setIsUpdateMode(false);
    setOldData(null);
  };

  const handleUpdate = async (formData: CompanyFormData) => {
    if (!selectedCID || !oldData) return;

    setIsUpdating(true);
    try {
      const updatedData = {
        companyId: selectedCID,
        companyName: formData.companyName.trim(),
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        companyStatus: formData.companyStatus,
        updatedBy: getUserID().trim(),
      };

      const response = await axios.patch(
        '/api/master/company/update-details',
        updatedData
      );
      const responseData = response.data;

      if (responseData.Status === 'F') {
        toast.error(responseData.Message);
        logError(
          responseData.Message.toLocaleString(),
          '',
          'Company Master Update',
          getUserID()
        );
      } else if (responseData.Status === 'T') {
        fetchData();
        handleCancel();
        toast.success(responseData.Message);

        const changedFields: string[] = [];
        if (oldData.company_name !== formData.companyName)
          changedFields.push(
            `Company Name: ${oldData.company_name} -> ${formData.companyName}`
          );
        if (oldData.address !== (formData.address || ''))
          changedFields.push(
            `Address: ${oldData.address} -> ${formData.address || ''}`
          );
        if (oldData.city !== (formData.city || ''))
          changedFields.push(`City: ${oldData.city} -> ${formData.city || ''}`);
        if (oldData.state !== (formData.state || ''))
          changedFields.push(
            `State: ${oldData.state} -> ${formData.state || ''}`
          );
        if (oldData.company_status !== formData.companyStatus)
          changedFields.push(
            `Status: ${oldData.company_status} -> ${formData.companyStatus}`
          );
      }
    } catch (error: any) {
      console.error('Error updating company:', error);
      const errorMessage = error.response?.data?.message || error.message;
      logError(errorMessage, error, 'Company Master Update', getUserID());
      toast.error('Failed to update details. Try again');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Company Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(isUpdateMode ? handleUpdate : handleSave)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="companyCode">Company Code *</Label>
                <Input
                  id="companyCode"
                  {...register('companyCode')}
                  required
                  disabled={isUpdateMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" {...register('companyName')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Company Address</Label>
                <Input id="address" {...register('address')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register('state')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyStatus">Status *</Label>
                <Select
                  value={watch('companyStatus')}
                  onValueChange={value =>
                    setValue('companyStatus', value as 'Active' | 'Inactive')
                  }
                >
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
                type="submit"
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
                type="submit"
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
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isSaving || isUpdating}
              >
                Cancel
              </Button>
            </div>
          </form>
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
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Action
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Company Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Company Name
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Address
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center">
                        <Loading size="md" label="Loading companies..." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableRow key={row.company_id}>
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
                          {row.company_code}
                        </TableCell>
                        <TableCell>{row.company_name}</TableCell>
                        <TableCell>{row.address ? row.address : ''}</TableCell>
                        <TableCell>{row.city ? row.city : ''}</TableCell>
                        <TableCell>{row.state ? row.state : ''}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              row.company_status === 'Active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {row.company_status || 'Inactive'}
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

export default CompanyMasterForm;
