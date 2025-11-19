'use client';
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
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
import { Loader2, Download, Upload, Info } from 'lucide-react';
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
import { getUserID } from '@/utils/getFromSession';

interface UnitData {
  id?: number;
  uom_code: string;
  description: string;
  international_standard_code: string;
  created_date: string;
  created_by: string;
  updated_by: string | null;
  updated_date: string | null;
}

interface UpdateApiResponse {
  Status: 'T' | 'F';
  Message: string;
}

const UOMMaster: React.FC = () => {
  const requiredHeaders = [
    'Code',
    'Description',
    'International Standard Code',
  ];
  const [uomCode, setUomCode] = useState<string>('');
  const [unitDesc, setUnitDesc] = useState<string>('');
  const [internationalStandardCode, setInternationalStandardCode] =
    useState<string>('');
  const [data, setData] = useState<UnitData[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const unitRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);
  const internationalRef = useRef<HTMLInputElement>(null);
  const userID = getUserID();
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
        '/api/master/uom/all-details'
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
    setUomCode(row.uom_code);
    setUnitDesc(row.description);
    setInternationalStandardCode(row.international_standard_code || '');
    setSelectedUnit(row);
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
    setUomCode('');
    setUnitDesc('');
    setInternationalStandardCode('');
    setIsEditing(false);
    setSelectedUnit(null);
  };

  const handleSave = async () => {
    if (!uomCode.trim()) {
      toast.error('Please fill the UOM code');
      unitRef.current?.focus();
      return;
    }
    if (!unitDesc.trim()) {
      toast.error('Please fill the unit description for UOM');
      descRef.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const newUnitData = {
        uom_code: uomCode.trim(),
        description: unitDesc.trim(),
        international_standard_code: internationalStandardCode.trim() || '',
        user: userID || 'Guest',
      };

      const response = await axios.post(
        '/api/master/uom/insert-details',
        newUnitData
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
    } finally {
      setIsSaving(false);
    }
  };
  const handleUpdate = async () => {
    if (!selectedUnit) return;
    if (!uomCode.trim()) {
      toast.error('Please fill the UOM code');
      unitRef.current?.focus();
      return;
    }
    if (!unitDesc.trim()) {
      toast.error('Please fill the unit description for UOM');
      descRef.current?.focus();
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUnit = {
        id: selectedUnit.id,
        uom_code: uomCode.trim(),
        description: unitDesc.trim(),
        international_standard_code: internationalStandardCode.trim() || '',
        user: userID || 'Guest',
      };

      const response = await axios.patch<UpdateApiResponse>(
        '/api/master/uom/update-details',
        updatedUnit
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
        //   OldData: JSON.stringify(selectedUnit),
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: getUserPlant()
        // });
      } else if (Status === 'F') {
        toast.error(Message);
      } else {
        toast.error('Unexpected Error');
      }
    } catch (error: any) {
      console.error('Error updating data:', error);
      const errorMessage =
        error.response?.data?.Message || 'Failed to update UOM';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof UnitData)[] = [
        'description',
        'uom_code',
        'international_standard_code',
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
        '/api/master/uom/upload-excel',
        formData
      );

      if (response.data.Status === 'F') {
        toast.error(response.data.Message || 'Failed to upload UOM details');
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
      // Reset the file input
      const fileInput = document.getElementById(
        'excel-upload'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const downloadSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/uom_sample_upload.xlsx';
    link.download = 'uom_sample_upload.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <Label htmlFor="uomCode">UOM Code *</Label>
                <Input
                  id="uomCode"
                  value={uomCode}
                  onChange={e => setUomCode(e.target.value)}
                  ref={unitRef}
                  required
                  disabled={isEditing}
                  placeholder="Enter UOM code"
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
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internationalCode">
                  International Standard Code
                </Label>
                <Input
                  id="internationalCode"
                  value={internationalStandardCode}
                  ref={internationalRef}
                  onChange={e => setInternationalStandardCode(e.target.value)}
                  placeholder="Enter international code"
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

            {/* Excel Upload Section */}
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Excel Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload UOM data from Excel file
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
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excel Upload Format</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please ensure your Excel file has the following
                          columns:
                          <br />
                          <br />
                          <strong>Required Columns:</strong>
                          <ul className="mt-2 list-disc pl-5">
                            {requiredHeaders.map((header, index) => (
                              <li key={header}>
                                {header} ({index < 2 ? 'Required' : 'Optional'})
                              </li>
                            ))}
                          </ul>
                          <br />
                          Download the sample file for reference.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button onClick={downloadSampleFile} variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download Sample
                        </Button>
                        <AlertDialogCancel>Close</AlertDialogCancel>
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
                      UOM Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      Description
                    </TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-foreground">
                      International Standard Code
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
                      <TableCell colSpan={8} className="text-center">
                        <Loading size="md" label="Loading UOM data..." />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map(row => (
                      <TableRow key={row.uom_code + row.created_date}>
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
                          {row.uom_code}
                        </TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>
                          {row.international_standard_code || '-'}
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
                      <TableCell colSpan={8} className="text-center">
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
