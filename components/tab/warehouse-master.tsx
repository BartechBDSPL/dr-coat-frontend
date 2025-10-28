'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import axios from '@/lib/axios-config';
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
import TableSearch from '@/utils/tableSearch';
interface PlantCode {
  plant_code: string;
}

interface CategoryCode {
  category_code: string;
}

interface WarehouseData {
  id?: number;
  plant_code: string | null;
  warehouse_code: string;
  warehouse_desc: string;
  warehouse_category: string;
  warehouse_address: string;
  warehouse_status: string;
}

interface ApiResponse {
  Status: string;
  Message: string;
}

interface DropdownOption {
  value: string;
  label: string;
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

const WarehouseMaster: React.FC = () => {
  const [plantCode, setPlantCode] = useState<string>('');
  const [categoryCode, setCategoryCode] = useState<string>('');
  const [warehouseCode, setWarehouseCode] = useState<string>('');
  const [warehouseDesc, setWarehouseDesc] = useState<string>('');
  const [warehouseAddress, setWarehouseAddress] = useState<string>('');
  const [status, setStatus] = useState<string>('Active');
  const [plantCodes, setPlantCodes] = useState<DropdownOption[]>([]);
  const [categoryCodes, setCategoryCodes] = useState<DropdownOption[]>([]);
  const [warehouseData, setWarehouseData] = useState<WarehouseData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [oldData, setOldData] = useState<WarehouseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const token = Cookies.get('token');
  useEffect(() => {
    const executeSequentially = async () => {
      await fetchPlantCodes();
      await delay(50);

      await fetchCategoryCodes();
      await delay(50);

      await fetchWarehouseData();
      await delay(50);

      // await insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "Warehouse Master",
      //   Action: `Warehouse Master Opened by ${getUserID()}`,
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
      const response = await axios.get(
        '/api/master/warehouse/get-all-plant-code'
      );
      setPlantCodes(
        response.data.map((item: PlantCode) => ({
          value: item.plant_code,
          label: item.plant_code,
        }))
      );
    } catch (error) {
      console.error('Error fetching plant codes:', error);
      toast.error('Failed to fetch plant codes');
    }
  };

  const fetchCategoryCodes = async () => {
    try {
      const response = await axios.get(
        '/api/master/warehouse/get-all-warehouse-category-code'
      );
      setCategoryCodes(
        response.data.map((item: CategoryCode) => ({
          value: item.category_code,
          label: item.category_code,
        }))
      );
    } catch (error) {
      console.error('Error fetching category codes:', error);
      toast.error('Failed to fetch category codes');
    }
  };

  const fetchWarehouseData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/master/warehouse/wh-all-details');

      const data: WarehouseData[] = response.data;
      setWarehouseData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
      toast.error('Failed to fetch warehouse data');
    } finally {
      setIsLoading(false);
    }
  };
  // Logic for pagination

  const filteredData = useMemo(() => {
    return warehouseData.filter(item => {
      const searchableFields: (keyof WarehouseData)[] = [
        'plant_code',
        'warehouse_category',
        'warehouse_code',
        'warehouse_desc',
        'warehouse_status',
        'warehouse_address',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [warehouseData, searchTerm]);

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
    if (!plantCode.trim()) {
      toast.error('Please select the plant code');
      return;
    }
    if (!categoryCode.trim()) {
      toast.error('Please select the category code');
      return;
    }
    if (!warehouseCode.trim()) {
      toast.error('Please fill the warehouse code');
      return;
    }

    setIsSaving(true);
    try {
      const newWarehouseData = {
        PlantCode: plantCode.trim(),
        WarehouseCode: warehouseCode.trim(),
        WarehouseDesc: warehouseDesc.trim(),
        WarehouseAddress: warehouseAddress.trim(),
        WarehouseCategory: categoryCode.trim(),
        WStatus: status.trim(),
        User: getUserID(),
      };

      const response = await axios.post(
        '/api/master/warehouse/wh-insert-details',
        newWarehouseData
      );

      const result: ApiResponse = response.data;

      if (result.Status === 'T') {
        toast.success(result.Message || 'Warehouse inserted successfully');
        fetchWarehouseData();
        handleCancel();
      } else {
        toast.error(result.Message || 'Failed to insert warehouse');
      }
    } catch (error) {
      console.error('Error inserting warehouse:', error);
      toast.error('Failed to insert warehouse');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) return;
    if (!plantCode.trim()) {
      toast.error('Please select the plant code');
      return;
    }
    if (!categoryCode.trim()) {
      toast.error('Please select the category code');
      return;
    }
    if (!warehouseCode.trim()) {
      toast.error('Please fill the warehouse code');
      return;
    }

    setIsUpdating(true);
    const updatedWarehouseData = {
      PlantCode: plantCode.trim(),
      WarehouseCode: warehouseCode.trim(),
      WarehouseDesc: warehouseDesc.trim(),
      WarehouseAddress: warehouseAddress.trim(),
      WarehouseCategory: categoryCode.trim(),
      WStatus: status.trim(),
      User: getUserID(),
    };

    const changedFields: string[] = [];
    if (oldData?.plant_code !== plantCode)
      changedFields.push(`Plant Code: ${oldData?.plant_code} -> ${plantCode}`);
    if (oldData?.warehouse_code !== warehouseCode)
      changedFields.push(
        `Warehouse Code: ${oldData?.warehouse_code} -> ${warehouseCode}`
      );
    if (oldData?.warehouse_desc !== warehouseDesc)
      changedFields.push(
        `Warehouse Desc: ${oldData?.warehouse_desc} -> ${warehouseDesc}`
      );
    if (oldData?.warehouse_address !== warehouseAddress)
      changedFields.push(
        `Warehouse Address: ${oldData?.warehouse_address} -> ${warehouseAddress}`
      );
    if (oldData?.warehouse_category !== categoryCode)
      changedFields.push(
        `Warehouse Category: ${oldData?.warehouse_category} -> ${categoryCode}`
      );
    if (oldData?.warehouse_status !== status)
      changedFields.push(`Status: ${oldData?.warehouse_status} -> ${status}`);

    try {
      const response = await axios.patch(
        '/api/master/warehouse/wh-update-details',
        {
          ID: selectedId,
          ...updatedWarehouseData,
        }
      );

      const result: ApiResponse = response.data;

      if (result.Status === 'T') {
        toast.success(result.Message || 'Warehouse updated successfully');
        fetchWarehouseData();
        handleCancel();
      } else {
        toast.error(result.Message || 'Failed to update warehouse details');
      }
    } catch (error: any) {
      console.error('Error updating warehouse:', error);
      toast.error(
        error.response?.data?.Message || 'Failed to update warehouse'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRowSelect = (row: WarehouseData) => {
    setOldData(row);
    setPlantCode(row.plant_code || '');
    setCategoryCode(row.warehouse_category);
    setWarehouseCode(row.warehouse_code);
    setWarehouseDesc(row.warehouse_desc);
    setWarehouseAddress(row.warehouse_address);
    setStatus(row.warehouse_status);
    setSelectedId(row.id || null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPlantCode('');
    setCategoryCode('');
    setWarehouseCode('');
    setWarehouseDesc('');
    setWarehouseAddress('');
    setStatus('Active');
    setIsEditing(false);
    setSelectedId(null);
    setOldData(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card className="mx-auto w-full border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            Warehouse Master
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label
                  htmlFor="plantCode"
                  className="text-sm font-medium text-foreground"
                >
                  Plant Code *
                </Label>
                <CustomDropdown
                  options={plantCodes}
                  value={plantCode}
                  onValueChange={setPlantCode}
                  placeholder="Select plant code..."
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
                  disabled={isEditing}
                />
                <Label className="mt-1 block text-sm text-muted-foreground">
                  Only active plants will be visible here
                </Label>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="warehouseCategoryCode"
                  className="text-sm font-medium text-foreground"
                >
                  Warehouse Category Code *
                </Label>
                <CustomDropdown
                  options={categoryCodes}
                  value={categoryCode}
                  onValueChange={setCategoryCode}
                  placeholder="Select category code..."
                  searchPlaceholder="Search category code..."
                  emptyText="No category code found."
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="warehouseCode"
                  className="text-sm font-medium text-foreground"
                >
                  Warehouse Code *
                </Label>
                <Input
                  id="warehouseCode"
                  value={warehouseCode}
                  onChange={e => setWarehouseCode(e.target.value)}
                  required
                  disabled={isEditing}
                  className="border-border"
                  placeholder="Enter warehouse code"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="warehouseDescription"
                  className="text-sm font-medium text-foreground"
                >
                  Warehouse Description
                </Label>
                <Input
                  id="warehouseDescription"
                  value={warehouseDesc}
                  onChange={e => setWarehouseDesc(e.target.value)}
                  className="border-border"
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="warehouseAddress"
                  className="text-sm font-medium text-foreground"
                >
                  Warehouse Address
                </Label>
                <Input
                  id="warehouseAddress"
                  value={warehouseAddress}
                  onChange={e => setWarehouseAddress(e.target.value)}
                  className="border-border"
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-foreground"
                >
                  Status *
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
              <Button
                onClick={handleSave}
                disabled={isEditing || isSaving}
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
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
                disabled={!isEditing || isUpdating}
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
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
                onClick={handleCancel}
                variant="outline"
                className="w-full border-border hover:bg-accent sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="mx-auto w-full border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            Warehouse List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select
                defaultValue="10"
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="h-8 w-[70px] border-border">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <div className="w-full sm:w-auto">
              <TableSearch onSearch={handleSearch} />
            </div>
          </div>

          {Array.isArray(warehouseData) && warehouseData.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-md border border-border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-foreground">
                          Select
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Plant Code
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground sm:table-cell">
                          Warehouse Category
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Warehouse Code
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground md:table-cell">
                          Description
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground lg:table-cell">
                          Address
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            <Loading size="md" label="Loading warehouses..." />
                          </TableCell>
                        </TableRow>
                      ) : (
                        Array.isArray(paginatedData) &&
                        paginatedData.map((item, index) => (
                          <TableRow
                            key={item.id || index}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRowSelect(item)}
                                className="h-8 border-border px-2 py-1 text-xs"
                              >
                                Select
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.plant_code || '-'}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {item.warehouse_category}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.warehouse_code}
                            </TableCell>
                            <TableCell className="hidden text-sm md:table-cell">
                              {item.warehouse_desc}
                            </TableCell>
                            <TableCell className="hidden text-sm lg:table-cell">
                              {item.warehouse_address}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  item.warehouse_status === 'Active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}
                              >
                                {item.warehouse_status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Component */}
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-muted-foreground">
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
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'} border-border`}
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
                                className={`cursor-pointer border-border ${pageNumber === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
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
                          className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'} border-border`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No warehouse data available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseMaster;
