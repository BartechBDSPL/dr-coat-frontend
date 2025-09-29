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
import { BACKEND_URL } from '@/lib/constants';
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

interface UnitData {
  unit: string;
  description: string;
  created_date: string;
  created_by: string;
  updated_by: string | null;
  updated_date: string | null;
}

interface UpdateApiResponse {
  Status: 'T' | 'F';
  Message: string;
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

const UOMMaster: React.FC = () => {
  const [unit, setUnit] = useState<string>('');
  const [unitDesc, setUnitDesc] = useState<string>('');
  const [data, setData] = useState<UnitData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const unitRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);
  const token = Cookies.get('token');
  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const executeSequentially = async () => {
      await fetchData();
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<UnitData[]>(
        `${BACKEND_URL}/api/master/all-uom-details`,
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

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);
  const handleRowSelect = (row: UnitData) => {
    setUnit(row.unit);
    setUnitDesc(row.description);
    setSelectedUnit(row.unit);
    setIsEditing(true);
    // insertAuditTrail({
    //   AppType: "Web",
    //   Activity: "UOM Master",
    //   Action: `UOM Edit Initiated by ${getUserID()}`,
    //   NewData: "",
    //   OldData: JSON.stringify(row),
    //   Remarks: "",
    //   UserId: getUserID(),
    //   PlantCode: getUserPlant()
    // });
  };

  const handleCancel = () => {
    setUnit('');
    setUnitDesc('');
    setIsEditing(false);
    setSelectedUnit(null);
  };

  const handleSave = async () => {
    if (!unit) {
      toast.error('Please fill the unit for UOM');
      unitRef.current?.focus();
      return;
    }
    if (!unitDesc) {
      toast.error('Please fill the unit description for UOM');
      descRef.current?.focus();
      return;
    }

    try {
      const newUnitData = {
        unit,
        description: unitDesc,
        user: getUserID(),
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/master/insert-uom-details`,
        newUnitData,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      const { Status, Message } = response.data;

      if (Status === 'F') {
        toast.error(Message);
      } else if (Status === 'T') {
        toast.success(Message);
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
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.Message || error.message;
      toast.error(errorMessage);
    }
  };
  const handleUpdate = async () => {
    if (!selectedUnit) return;
    if (!unit) {
      toast.error('Please fill the unit for UOM');
      unitRef.current?.focus();
      return;
    }
    if (!unitDesc) {
      toast.error('Please fill the unit description for UOM');
      descRef.current?.focus();
      return;
    }
    try {
      const updatedUnit = {
        unit,
        description: unitDesc,
        user: getUserID(),
      };

      const response = await axios.patch<UpdateApiResponse>(
        `${BACKEND_URL}/api/master/update-uom-details`,
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
        toast.success(Message);
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
        toast.error(Message);
      } else {
        toast.error('Unexpected Error');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Failed to update UOM');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof UnitData)[] = [
        'description',
        'unit',
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
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            UOM Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="categoryCode">Unit *</Label>
                <Input
                  id="categoryCode"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  ref={unitRef}
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDesc">Description *</Label>
                <Input
                  id="categoryDesc"
                  value={unitDesc}
                  ref={descRef}
                  onChange={e => setUnitDesc(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
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
                    <TableHead className="whitespace-nowrap">Action</TableHead>
                    <TableHead className="whitespace-nowrap">UNIT</TableHead>
                    <TableHead className="whitespace-nowrap">
                      UNIT Description
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Created by
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Created on
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Updated by
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Updated on
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <Loading size="md" label="Loading UOM data..." />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map(row => (
                      <TableRow key={row.unit}>
                        <TableCell>
                          <Button
                            variant={'ghost'}
                            onClick={() => handleRowSelect(row)}
                            className="px-2 py-1 text-xs"
                          >
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.unit}
                        </TableCell>
                        <TableCell>{row.description}</TableCell>
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
                      <TableCell colSpan={7} className="text-center">
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

export default UOMMaster;
