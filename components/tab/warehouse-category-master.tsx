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
import { toast as sooner } from 'sonner';
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

interface WarehouseCategoryData {
  category_code: string;
  category_desc: string;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
}

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

const WarehouseCategoryMaster: React.FC = () => {
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [data, setData] = useState<WarehouseCategoryData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [oldData, setOldData] = useState<WarehouseCategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // for search and pagination
  const warehouseCategoryCodeRef = useRef<HTMLInputElement>(null);
  const warehouseCategoryDesccRef = useRef<HTMLInputElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const token = Cookies.get('token');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        '/api/master/warehouse-category/get-all'
      );
      setData(response.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch data';
      sooner(errorMessage, {
        style: {
          background: 'hsl(var(--destructive))',
          color: 'hsl(var(--destructive-foreground))',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const executeSequentially = async () => {
      fetchData();
      // await insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "Warehouse Category Master",
      //   Action: `Warehouse Category Master Opened by ${getUserID()}`,
      //   NewData: "",
      //   OldData: "",
      //   Remarks: "",
      //   UserId: getUserID(),
      //   PlantCode: getUserPlant()
      // });
    };
    executeSequentially();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof WarehouseCategoryData)[] = [
        'category_code',
        'category_desc',
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

  const handleRowSelect = (row: WarehouseCategoryData) => {
    setCategoryCode(row.category_code);
    setCategoryDesc(row.category_desc);
    setSelectedCategoryCode(row.category_code);
    setIsEditing(true);
    setOldData(row);
    // insertAuditTrail({
    //   AppType: "Web",
    //   Activity: "Warehouse Category Master",
    //   Action: `Category Edit Initiated by ${getUserID()}`,
    //   NewData: "",
    //   OldData: JSON.stringify(row),
    //   Remarks: "",
    //   UserId: getUserID(),
    //   PlantCode: row.category_code
    // });
  };

  const handleCancel = () => {
    setCategoryCode('');
    setCategoryDesc('');
    setIsEditing(false);
    setSelectedCategoryCode(null);
    setOldData(null);
  };

  const handleSave = async () => {
    if (!categoryCode.trim()) {
      warehouseCategoryCodeRef.current?.focus();
      sooner('Please fill the warehouse category code');
      return;
    }
    if (!categoryDesc.trim()) {
      warehouseCategoryDesccRef.current?.focus();
      sooner('Please fill the warehouse category description');
      return;
    }

    try {
      const newCategoryData = {
        category_code: categoryCode.trim(),
        category_desc: categoryDesc.trim(),
        created_by: getUserID(),
      };

      const response = await axios.post(
        '/api/master/warehouse-category/insert',
        newCategoryData
      );

      if (response.data) {
        if (response.data.Status === 'F') {
          sooner(response.data.Message || 'Failed to insert data', {
            style: {
              background: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))',
            },
          });
          return;
        }

        if (response.data.Status === 'T') {
          sooner(response.data.Message || 'Category inserted successfully', {
            style: {
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            },
          });
          fetchData();
          handleCancel();
        }
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || 'An error occurred';
      sooner(errorMessage, {
        style: {
          background: 'hsl(var(--destructive))',
          color: 'hsl(var(--destructive-foreground))',
        },
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategoryCode || !oldData) return;
    if (!categoryCode.trim()) {
      warehouseCategoryCodeRef.current?.focus();
      sooner('Please fill the warehouse category code');
      return;
    }
    if (!categoryDesc.trim()) {
      warehouseCategoryDesccRef.current?.focus();
      sooner('Please fill the warehouse category description');
      return;
    }
    try {
      const updatedCategoryData = {
        category_code: selectedCategoryCode,
        category_desc: categoryDesc.trim(),
        updated_by: getUserID(),
      };

      const response = await axios.patch(
        '/api/master/warehouse-category/update',
        updatedCategoryData
      );

      if (response.data) {
        if (response.data.Status === 'F') {
          sooner(response.data.Message || 'Failed to update data', {
            style: {
              background: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))',
            },
          });
          return;
        }

        if (response.data.Status === 'T') {
          sooner(response.data.Message || 'Category updated successfully', {
            style: {
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            },
          });
          fetchData();
          handleCancel();

          const changedFields: string[] = [];
          if (oldData.category_desc !== categoryDesc)
            changedFields.push(
              `Category Desc: ${oldData.category_desc} -> ${categoryDesc}`
            );

          // insertAuditTrail({
          //   AppType: "Web",
          //   Activity: "Warehouse Category Master",
          //   Action: `Category Updated by ${getUserID()}`,
          //   NewData: changedFields.join(", "),
          //   OldData: JSON.stringify(oldData),
          //   Remarks: "",
          //   UserId: getUserID(),
          //   PlantCode: categoryCode
          // });
        }
      }
    } catch (error: any) {
      console.error('Error updating data:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update category';
      sooner(errorMessage, {
        style: {
          background: 'hsl(var(--destructive))',
          color: 'hsl(var(--destructive-foreground))',
        },
      });
    }
  };

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle>
            Warehouse Category Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="categoryCode">Warehouse Category Code *</Label>
                <Input
                  id="categoryCode"
                  ref={warehouseCategoryCodeRef}
                  value={categoryCode}
                  onChange={e => setCategoryCode(e.target.value)}
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDesc">Warehouse Category Desc *</Label>
                <Input
                  id="categoryDesc"
                  ref={warehouseCategoryDesccRef}
                  value={categoryDesc}
                  onChange={e => setCategoryDesc(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col justify-end space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                onClick={handleSave}
                disabled={isEditing}
                className="w-full sm:w-auto"
              >
                Save
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!isEditing}
                className="w-full sm:w-auto"
              >
                Update
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="mx-auto mt-10 w-full">
        <CardContent>
          <div className="mt-8">
            <div className="mb-4 flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
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
              <div className="flex w-full items-center space-x-2 md:w-auto">
                <TableSearch onSearch={handleSearch} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[80px]">Select</TableHead>
                    <TableHead className="min-w-[120px]">
                      WH Category Code
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      WH Category Desc
                    </TableHead>
                    <TableHead className="min-w-[100px]">Created by</TableHead>
                    <TableHead className="min-w-[120px]">Created on</TableHead>
                    <TableHead className="min-w-[100px]">Updated by</TableHead>
                    <TableHead className="min-w-[120px]">Updated on</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <Loading
                          size="md"
                          label="Loading warehouse categories..."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    Array.isArray(paginatedData) &&
                    paginatedData.map((row, index) => (
                      <TableRow key={`${row.category_code}-${index}`}>
                        <TableCell>
                          <Button
                            variant={'ghost'}
                            onClick={() => handleRowSelect(row)}
                            className="text-xs sm:text-sm"
                          >
                            Select
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs sm:text-sm">
                          {row.category_code}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {row.category_desc}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {row.created_by}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {row.created_date
                            ? new Date(row.created_date).toLocaleDateString()
                            : ''}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {row.updated_by}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
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
            <div className="mt-4 flex flex-col items-center justify-between space-y-2 text-xs sm:flex-row sm:space-y-0 sm:text-sm">
              <div className="text-center sm:text-left">
                {filteredData.length > 0
                  ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length} entries`
                  : 'No entries to show'}
              </div>
              {filteredData.length > 0 && (
                <Pagination>
                  <PaginationContent className="flex-wrap justify-center">
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
                              className="text-xs sm:text-sm"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <PaginationEllipsis
                            key={pageNumber}
                            className="text-xs sm:text-sm"
                          />
                        );
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

export default WarehouseCategoryMaster;
