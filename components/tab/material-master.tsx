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
import CustomDropdown from '../CustomDropdown';
import { toast } from 'sonner';
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
import TableSearch from '@/utils/tableSearch';
import { getUserID } from '@/utils/getFromSession';

interface PlantCode {
  plant_code: string;
}

interface MaterialData {
  id?: number;
  plant_code: string | null;
  material_code: string;
  material_description: string;
  material_type: string;
  material_group: string;
  material_status: string;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
}

interface ApiResponse {
  Status: string;
  Message: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

const MaterialMaster: React.FC = () => {
  const [plantCode, setPlantCode] = useState<string>('');
  const [materialCode, setMaterialCode] = useState<string>('');
  const [materialDescription, setMaterialDescription] = useState<string>('');
  const [materialType, setMaterialType] = useState<string>('');
  const [materialGroup, setMaterialGroup] = useState<string>('');
  const [status, setStatus] = useState<string>('Active');
  const [plantCodes, setPlantCodes] = useState<DropdownOption[]>([]);
  const [materialData, setMaterialData] = useState<MaterialData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [oldData, setOldData] = useState<MaterialData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const token = Cookies.get('token');

  useEffect(() => {
    const executeSequentially = async () => {
      await fetchPlantCodes();
      await delay(50);

      await fetchMaterialData();
      await delay(50);
    };

    executeSequentially();
  }, []);

  const fetchPlantCodes = async () => {
    try {
      const response = await axios.get('/api/master/material/get-plant');
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

  const fetchMaterialData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/master/material/get-details');

      const data: MaterialData[] = response.data;
      setMaterialData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching material data:', error);
      toast.error('Failed to fetch material data');
    } finally {
      setIsLoading(false);
    }
  };

  // Logic for pagination
  const filteredData = useMemo(() => {
    return materialData.filter(item => {
      const searchableFields: (keyof MaterialData)[] = [
        'plant_code',
        'material_code',
        'material_description',
        'material_type',
        'material_group',
        'material_status',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [materialData, searchTerm]);

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
    if (!materialCode.trim()) {
      toast.error('Please fill the material code');
      return;
    }
    if (!materialType.trim()) {
      toast.error('Please fill the material type');
      return;
    }

    try {
      const newMaterialData = {
        plant_code: plantCode.trim(),
        material_code: materialCode.trim(),
        material_description: materialDescription.trim(),
        material_type: materialType.trim(),
        material_group: materialGroup.trim(),
        material_status: status.trim(),
        created_by: getUserID().trim(),
      };

      const response = await axios.post(
        '/api/master/material/insert-details',
        newMaterialData
      );

      const result: ApiResponse = response.data[0];

      if (result.Status === 'T') {
        toast.success(result.Message || 'Material inserted successfully');
        fetchMaterialData();
        handleCancel();
      } else {
        toast.error(result.Message || 'Failed to insert material');
      }
    } catch (error) {
      console.error('Error inserting material:', error);
      toast.error('Failed to insert material');
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) return;
    if (!plantCode.trim()) {
      toast.error('Please select the plant code');
      return;
    }
    if (!materialCode.trim()) {
      toast.error('Please fill the material code');
      return;
    }
    if (!materialType.trim()) {
      toast.error('Please fill the material type');
      return;
    }

    const updatedMaterialData = {
      id: selectedId,
      plant_code: plantCode.trim(),
      material_code: materialCode.trim(),
      material_description: materialDescription.trim(),
      material_type: materialType.trim(),
      material_group: materialGroup.trim(),
      material_status: status.trim(),
      updated_by: getUserID().trim(),
    };

    const changedFields: string[] = [];
    if (oldData?.plant_code !== plantCode)
      changedFields.push(`Plant Code: ${oldData?.plant_code} -> ${plantCode}`);
    if (oldData?.material_code !== materialCode)
      changedFields.push(
        `Material Code: ${oldData?.material_code} -> ${materialCode}`
      );
    if (oldData?.material_description !== materialDescription)
      changedFields.push(
        `Material Description: ${oldData?.material_description} -> ${materialDescription}`
      );
    if (oldData?.material_type !== materialType)
      changedFields.push(
        `Material Type: ${oldData?.material_type} -> ${materialType}`
      );
    if (oldData?.material_status !== status)
      changedFields.push(`Status: ${oldData?.material_status} -> ${status}`);

    try {
      const response = await axios.patch(
        '/api/master/material/update-details',
        updatedMaterialData
      );

      const result: ApiResponse = response.data[0];

      if (result.Status === 'T') {
        toast.success(result.Message || 'Material updated successfully');
        fetchMaterialData();
        handleCancel();
      } else {
        toast.error(result.Message || 'Failed to update material details');
      }
    } catch (error: any) {
      console.error('Error updating material:', error);
      toast.error(error.response?.data?.Message || 'Failed to update material');
    }
  };

  const handleRowSelect = (row: MaterialData) => {
    setOldData(row);
    setPlantCode(row.plant_code || '');
    setMaterialCode(row.material_code);
    setMaterialDescription(row.material_description);
    setMaterialType(row.material_type);
    setMaterialGroup(row.material_group);
    setStatus(row.material_status);
    setSelectedId(row.id || null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPlantCode('');
    setMaterialCode('');
    setMaterialDescription('');
    setMaterialType('');
    setMaterialGroup('');
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
            Material Master
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6" onSubmit={e => e.preventDefault()}>
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
                  htmlFor="materialCode"
                  className="text-sm font-medium text-foreground"
                >
                  Material Code *
                </Label>
                <Input
                  id="materialCode"
                  value={materialCode}
                  onChange={e => setMaterialCode(e.target.value)}
                  required
                  disabled={isEditing}
                  className="border-border"
                  placeholder="Enter material code"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="materialDescription"
                  className="text-sm font-medium text-foreground"
                >
                  Material Description
                </Label>
                <Input
                  id="materialDescription"
                  value={materialDescription}
                  onChange={e => setMaterialDescription(e.target.value)}
                  className="border-border"
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="materialType"
                  className="text-sm font-medium text-foreground"
                >
                  Material Type *
                </Label>
                <Input
                  id="materialType"
                  value={materialType}
                  onChange={e => setMaterialType(e.target.value)}
                  required
                  className="border-border"
                  placeholder="Enter material type"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="materialType"
                  className="text-sm font-medium text-foreground"
                >
                  Material Group *
                </Label>
                <Input
                  id="materialGroup"
                  value={materialGroup}
                  onChange={e => setMaterialGroup(e.target.value)}
                  required
                  className="border-border"
                  placeholder="Enter material Group"
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
                disabled={isEditing}
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
              >
                Save
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!isEditing}
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
              >
                Update
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full border-border hover:bg-accent sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mx-auto w-full border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            Material List
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

          {Array.isArray(materialData) && materialData.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-md border border-border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Plant Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Material Code
                        </th>
                        <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground md:table-cell">
                          Description
                        </th>
                        <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground sm:table-cell">
                          Material Type
                        </th>
                        <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground sm:table-cell">
                          Material Group
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Created by
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Created On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Updated by
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                          Updated On
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center">
                            <Loading size="md" label="Loading materials..." />
                          </td>
                        </tr>
                      ) : (
                        Array.isArray(paginatedData) &&
                        paginatedData.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="hover:bg-muted/50"
                          >
                            <td className="whitespace-nowrap px-6 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRowSelect(item)}
                                className="h-8 border-border px-2 py-1 text-xs"
                              >
                                Select
                              </Button>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.plant_code || '-'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.material_code}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.material_description}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.material_type}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.material_group}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  item.material_status === 'Active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}
                              >
                                {item.material_status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.created_by}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {new Date(item.created_date).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.updated_by}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                              {item.updated_date
                                ? new Date(
                                    item.updated_date
                                  ).toLocaleDateString()
                                : ''}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
                No material data available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialMaster;
