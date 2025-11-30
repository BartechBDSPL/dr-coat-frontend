'use client';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/lib/axios-config';
import { Loading } from '@/components/loading';
import { Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import TableSearch from '@/utils/tableSearch';
import { getUserID } from '@/utils/getFromSession';
import { convertToIST } from '@/utils/convertToIST';

interface ItemPackingData {
  id?: number;
  item_no: string;
  cust_no: string;
  packing_code: string;
  qty_per_uom: string;
  description: string;
  uom_major_value: string;
  created_by: string;
  created_date: string;
  updated_by: string;
  updated_date: string;
}

interface UpdateApiResponse {
  Status: 'T' | 'F';
  Message: string;
}

const ItemPackingMaster: React.FC = () => {
  const [itemNo, setItemNo] = useState<string>('');
  const [custNo, setCustNo] = useState<string>('');
  const [packingCode, setPackingCode] = useState<string>('');
  const [qtyPerUom, setQtyPerUom] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [uomMajorValue, setUomMajorValue] = useState<string>('');

  const [data, setData] = useState<ItemPackingData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedPacking, setSelectedPacking] =
    useState<ItemPackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    'Loading Item Packing data...'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemNoRef = useRef<HTMLInputElement>(null);
  const packingCodeRef = useRef<HTMLInputElement>(null);
  const userID = getUserID();

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const executeSequentially = async () => {
      await fetchData();
    };
    executeSequentially();
  }, []);

  const fetchData = async () => {
    let timer4s: NodeJS.Timeout | null = null;
    let timer10s: NodeJS.Timeout | null = null;

    try {
      setIsLoading(true);
      setLoadingMessage('Loading Item Packing data...');

      timer4s = setTimeout(() => {
        setLoadingMessage(
          'Fetching details from API, this might take a moment...'
        );
      }, 4000);

      timer10s = setTimeout(() => {
        setLoadingMessage('Hang on, almost there...');
      }, 10000);

      const response = await axios.get<ItemPackingData[]>(
        '/api/master/item-packing/all-details'
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      if (timer4s) clearTimeout(timer4s);
      if (timer10s) clearTimeout(timer10s);
      setIsLoading(false);
      setLoadingMessage('Loading Item Packing data...');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof ItemPackingData)[] = [
        'item_no',
        'cust_no',
        'packing_code',
        'qty_per_uom',
        'description',
        'uom_major_value',
        'created_by',
        'updated_by',
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

  const handleSave = async () => {
    if (!itemNo.trim()) {
      toast.error('Please fill the Item No');
      itemNoRef.current?.focus();
      return;
    }
    if (!packingCode.trim()) {
      toast.error('Please fill the Packing Code');
      packingCodeRef.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const newPackingData = {
        item_no: itemNo.trim(),
        cust_no: custNo.trim(),
        packing_code: packingCode.trim(),
        qty_per_uom: qtyPerUom.trim(),
        description: description.trim(),
        uom_major_value: uomMajorValue.trim(),
        created_by: userID || 'Guest',
      };

      const response = await axios.post(
        '/api/master/item-packing/insert-details',
        newPackingData
      );

      const { Status, Message } = response.data;

      if (Status === 'F') {
        toast.error(Message);
      } else if (Status === 'T') {
        toast.success(Message);
        fetchData();
        handleCancel();
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.Message || error.message;
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPacking) return;
    if (!itemNo.trim()) {
      toast.error('Please fill the Item No');
      itemNoRef.current?.focus();
      return;
    }
    if (!packingCode.trim()) {
      toast.error('Please fill the Packing Code');
      packingCodeRef.current?.focus();
      return;
    }

    setIsUpdating(true);
    try {
      const updatedPacking = {
        id: selectedPacking.id,
        item_no: itemNo.trim(),
        cust_no: custNo.trim(),
        packing_code: packingCode.trim(),
        qty_per_uom: qtyPerUom.trim(),
        description: description.trim(),
        uom_major_value: uomMajorValue.trim(),
        updated_by: userID || 'Guest',
      };

      const response = await axios.patch<UpdateApiResponse>(
        '/api/master/item-packing/update-details',
        updatedPacking
      );

      const { Status, Message } = response.data;

      if (Status === 'T') {
        toast.success(Message);
        fetchData();
        handleCancel();
      } else if (Status === 'F') {
        toast.error(Message);
      } else {
        toast.error('Unexpected Error');
      }
    } catch (error: any) {
      console.error('Error updating data:', error);
      const errorMessage =
        error.response?.data?.Message || 'Failed to update Item Packing';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRowSelect = (row: ItemPackingData) => {
    setItemNo(row.item_no);
    setCustNo(row.cust_no);
    setPackingCode(row.packing_code);
    setQtyPerUom(row.qty_per_uom);
    setDescription(row.description);
    setUomMajorValue(row.uom_major_value);
    setSelectedPacking(row);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setItemNo('');
    setCustNo('');
    setPackingCode('');
    setQtyPerUom('');
    setDescription('');
    setUomMajorValue('');
    setIsEditing(false);
    setSelectedPacking(null);
  };

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Item Packing Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="itemNo">Item No *</Label>
                <Input
                  id="itemNo"
                  value={itemNo}
                  onChange={e => setItemNo(e.target.value)}
                  ref={itemNoRef}
                  required
                  disabled={isEditing}
                  placeholder="Enter item number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custNo">Customer No</Label>
                <Input
                  id="custNo"
                  value={custNo}
                  onChange={e => setCustNo(e.target.value)}
                  placeholder="Enter customer number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packingCode">Packing Code *</Label>
                <Input
                  id="packingCode"
                  value={packingCode}
                  ref={packingCodeRef}
                  onChange={e => setPackingCode(e.target.value)}
                  required
                  placeholder="Enter packing code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qtyPerUom">Qty Per UOM</Label>
                <Input
                  id="qtyPerUom"
                  value={qtyPerUom}
                  onChange={e => setQtyPerUom(e.target.value)}
                  placeholder="Enter quantity per UOM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uomMajorValue">UOM Major Value</Label>
                <Input
                  id="uomMajorValue"
                  value={uomMajorValue}
                  onChange={e => setUomMajorValue(e.target.value)}
                  placeholder="Enter UOM major value"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
              <Button
                onClick={handleSave}
                disabled={isEditing || isSaving}
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
                disabled={!isEditing || isUpdating}
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
                      Item No
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Customer No
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Packing Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Qty Per UOM
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Description
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      UOM Major Value
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Created by
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Created on
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Updated by
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Updated on
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center">
                        <Loading size="md" label={loadingMessage} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map(row => (
                      <TableRow
                        key={row.item_no + row.packing_code + row.created_date}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRowSelect(row)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.item_no}
                        </TableCell>
                        <TableCell>{row.cust_no || '-'}</TableCell>
                        <TableCell>{row.packing_code}</TableCell>
                        <TableCell>{row.qty_per_uom}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.uom_major_value}</TableCell>
                        <TableCell>{row.created_by}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {convertToIST(row.created_date)}
                        </TableCell>
                        <TableCell>{row.updated_by || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.updated_date
                            ? convertToIST(row.updated_date)
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="text-muted-foreground">No data found</p>
                        </div>
                      </TableCell>
                    </TableRow>
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
                              onClick={() => handlePageChange(pageNumber)}
                              isActive={pageNumber === currentPage}
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
                          <PaginationItem key={pageNumber}>...</PaginationItem>
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

export default ItemPackingMaster;
