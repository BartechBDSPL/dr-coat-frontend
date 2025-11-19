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

interface MaterialData {
  id?: number;
  item_code: string;
  item_description: string;
  inventory_posting_group: string;
  category_l1: string;
  category_l2: string;
  category_l3: string;
  base_uom: string;
  hazardous: string;
  approval_status: string;
  item_tracking_code: string;
  created_date: string;
  created_by: string;
  updated_by: string | null;
  updated_date: string | null;
}

interface UpdateApiResponse {
  Status: 'T' | 'F';
  Message: string;
}

const MaterialMaster: React.FC = () => {
  const [itemCode, setItemCode] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [inventoryPostingGroup, setInventoryPostingGroup] =
    useState<string>('');
  const [categoryL1, setCategoryL1] = useState<string>('');
  const [categoryL2, setCategoryL2] = useState<string>('');
  const [categoryL3, setCategoryL3] = useState<string>('');
  const [baseUom, setBaseUom] = useState<string>('');
  const [hazardous, setHazardous] = useState<string>('No');
  const [approvalStatus, setApprovalStatus] = useState<string>('Pending');
  const [itemTrackingCode, setItemTrackingCode] = useState<string>('');

  const [data, setData] = useState<MaterialData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    'Loading Material data...'
  );
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemCodeRef = useRef<HTMLInputElement>(null);
  const itemDescRef = useRef<HTMLInputElement>(null);
  const userID = getUserID();

  // for search and pagination
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
      setLoadingMessage('Loading Material data...');

      // After 4 seconds, change the message
      timer4s = setTimeout(() => {
        setLoadingMessage(
          'Fetching details from API, this might take a moment...'
        );
      }, 4000);

      // After 10 seconds, change the message again
      timer10s = setTimeout(() => {
        setLoadingMessage('Hang on, almost there...');
      }, 10000);

      const response = await axios.get<MaterialData[]>(
        '/api/master/material/all-details'
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      if (timer4s) clearTimeout(timer4s);
      if (timer10s) clearTimeout(timer10s);
      setIsLoading(false);
      setLoadingMessage('Loading Material data...');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof MaterialData)[] = [
        'item_code',
        'item_description',
        'inventory_posting_group',
        'category_l1',
        'category_l2',
        'category_l3',
        'base_uom',
        'hazardous',
        'approval_status',
        'item_tracking_code',
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

  const handleSave = async () => {
    if (!itemCode.trim()) {
      toast.error('Please fill the Item Code');
      itemCodeRef.current?.focus();
      return;
    }
    if (!itemDescription.trim()) {
      toast.error('Please fill the Item Description');
      itemDescRef.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const newMaterialData = {
        item_code: itemCode.trim(),
        item_description: itemDescription.trim(),
        inventory_posting_group: inventoryPostingGroup.trim(),
        category_l1: categoryL1.trim(),
        category_l2: categoryL2.trim(),
        category_l3: categoryL3.trim(),
        base_uom: baseUom.trim(),
        hazardous: hazardous,
        approval_status: approvalStatus,
        item_tracking_code: itemTrackingCode.trim(),
        created_by: userID || 'Guest',
      };

      const response = await axios.post(
        '/api/master/material/insert-details',
        newMaterialData
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
    if (!selectedMaterial) return;
    if (!itemCode.trim()) {
      toast.error('Please fill the Item Code');
      itemCodeRef.current?.focus();
      return;
    }
    if (!itemDescription.trim()) {
      toast.error('Please fill the Item Description');
      itemDescRef.current?.focus();
      return;
    }

    setIsUpdating(true);
    try {
      const updatedMaterial = {
        id: selectedMaterial.id,
        item_code: itemCode.trim(),
        item_description: itemDescription.trim(),
        inventory_posting_group: inventoryPostingGroup.trim(),
        category_l1: categoryL1.trim(),
        category_l2: categoryL2.trim(),
        category_l3: categoryL3.trim(),
        base_uom: baseUom.trim(),
        hazardous: hazardous,
        approval_status: approvalStatus,
        item_tracking_code: itemTrackingCode.trim(),
        updated_by: userID || 'Guest',
      };

      const response = await axios.patch<UpdateApiResponse>(
        '/api/master/material/update-details',
        updatedMaterial
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
        error.response?.data?.Message || 'Failed to update Material';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRowSelect = (row: MaterialData) => {
    setItemCode(row.item_code);
    setItemDescription(row.item_description);
    setInventoryPostingGroup(row.inventory_posting_group);
    setCategoryL1(row.category_l1);
    setCategoryL2(row.category_l2);
    setCategoryL3(row.category_l3);
    setBaseUom(row.base_uom);
    setHazardous(row.hazardous);
    setApprovalStatus(row.approval_status);
    setItemTrackingCode(row.item_tracking_code);
    setSelectedMaterial(row);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setItemCode('');
    setItemDescription('');
    setInventoryPostingGroup('');
    setCategoryL1('');
    setCategoryL2('');
    setCategoryL3('');
    setBaseUom('');
    setHazardous('No');
    setApprovalStatus('Pending');
    setItemTrackingCode('');
    setIsEditing(false);
    setSelectedMaterial(null);
  };

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

    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    if (!userID) {
      toast.error('Failed to retrieve user ID');
      return;
    }

    setFileUploading(true);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);
      formData.append('username', userID);

      const response = await axios.post(
        '/api/master/material/upload-excel',
        formData
      );

      if (response.data.Status === 'F') {
        toast.error(
          response.data.Message || 'Failed to upload Material details'
        );
        if (response.data.results?.failures) {
          console.log('Upload failures:', response.data.results.failures);
        }
      } else {
        const { totalProcessed, successCount, failureCount } =
          response.data.results || {};
        toast.success(
          response.data.Message +
            (totalProcessed
              ? ` (${successCount}/${totalProcessed} records processed successfully)`
              : '')
        );
        await fetchData();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.Message || 'Failed to upload file');
    } finally {
      setFileUploading(false);
      setSelectedFile(null);
      const fileInput = document.getElementById(
        'excel-upload'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const downloadSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/Item_Master.xlsx';
    link.download = 'Item_Master.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Material Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="itemCode">Item Code *</Label>
                <Input
                  id="itemCode"
                  value={itemCode}
                  onChange={e => setItemCode(e.target.value)}
                  ref={itemCodeRef}
                  required
                  disabled={isEditing}
                  placeholder="Enter item code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemDescription">Item Description *</Label>
                <Input
                  id="itemDescription"
                  value={itemDescription}
                  ref={itemDescRef}
                  onChange={e => setItemDescription(e.target.value)}
                  required
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventoryPostingGroup">
                  Inventory Posting Group
                </Label>
                <Input
                  id="inventoryPostingGroup"
                  value={inventoryPostingGroup}
                  onChange={e => setInventoryPostingGroup(e.target.value)}
                  placeholder="Enter posting group"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryL1">Category L1</Label>
                <Input
                  id="categoryL1"
                  value={categoryL1}
                  onChange={e => setCategoryL1(e.target.value)}
                  placeholder="Enter category L1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryL2">Category L2</Label>
                <Input
                  id="categoryL2"
                  value={categoryL2}
                  onChange={e => setCategoryL2(e.target.value)}
                  placeholder="Enter category L2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryL3">Category L3</Label>
                <Input
                  id="categoryL3"
                  value={categoryL3}
                  onChange={e => setCategoryL3(e.target.value)}
                  placeholder="Enter category L3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUom">Base UOM</Label>
                <Input
                  id="baseUom"
                  value={baseUom}
                  onChange={e => setBaseUom(e.target.value)}
                  placeholder="Enter base UOM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hazardous">Hazardous</Label>
                <Select value={hazardous} onValueChange={setHazardous}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalStatus">Approval Status</Label>
                <Select
                  value={approvalStatus}
                  onValueChange={setApprovalStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemTrackingCode">Item Tracking Code</Label>
                <Input
                  id="itemTrackingCode"
                  value={itemTrackingCode}
                  onChange={e => setItemTrackingCode(e.target.value)}
                  placeholder="Enter tracking code"
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

            {/* Excel Upload Section - Commented out for now */}
            {/* <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Excel Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload Material data from Excel file
                </p>
              </div>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="excel-upload">Select Excel File</Label>
                  <Input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Info className="mr-2 h-4 w-4" />
                        Sample Format
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excel Upload Format</AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="space-y-4">
                            <p>Please use the following format for uploading Material Master data:</p>
                            <div className="rounded-md bg-muted p-4">
                              <p className="mb-2 font-semibold">Required columns (in order):</p>
                              <ol className="list-decimal space-y-1 pl-5 text-sm">
                                <li>Item Code</li>
                                <li>Item Description</li>
                                <li>Inventory Posting Group</li>
                                <li>Category L1</li>
                                <li>Category L2</li>
                                <li>Category L3</li>
                                <li>Base UOM</li>
                                <li>Hazardous (Yes/No)</li>
                                <li>Approval Status</li>
                                <li>Item Tracking Code</li>
                              </ol>
                            </div>
                            <p className="text-sm">
                              Download the sample file below to see the correct format.
                            </p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={downloadSampleFile}>
                          Download Sample
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button
                    onClick={handleUploadFile}
                    disabled={!selectedFile || fileUploading}
                    size="sm"
                  >
                    {fileUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {fileUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div> */}
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
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">Action</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Item Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Item Description
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Inventory Posting Group
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Category L1
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Category L2
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Category L3
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Base UOM
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Hazardous
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Approval Status
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Item Tracking Code
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
                      <TableCell colSpan={15} className="text-center">
                        <Loading size="md" label={loadingMessage} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map(row => (
                      <TableRow key={row.item_code + row.created_date}>
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
                          {row.item_code}
                        </TableCell>
                        <TableCell>{row.item_description}</TableCell>
                        <TableCell>{row.inventory_posting_group}</TableCell>
                        <TableCell>{row.category_l1}</TableCell>
                        <TableCell>{row.category_l2}</TableCell>
                        <TableCell>{row.category_l3}</TableCell>
                        <TableCell>{row.base_uom}</TableCell>
                        <TableCell>{row.hazardous}</TableCell>
                        <TableCell>{row.approval_status}</TableCell>
                        <TableCell>{row.item_tracking_code}</TableCell>
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
                      <TableCell colSpan={15} className="text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="text-muted-foreground">No data found</p>
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

export default MaterialMaster;
