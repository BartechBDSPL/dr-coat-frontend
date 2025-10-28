'use client';
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
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
import { Info, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { cn } from '@/lib/utils';

interface SessionData {
  id: number;
  session_time: number;
  unit: string;
  created_by: string;
  updated_by: string;
  created_on: string;
  updated_on: string;
}

// Zod schema for session validation
const sessionSchema = z
  .object({
    session_time: z
      .string()
      .min(1, 'Session time is required')
      .refine(val => !isNaN(Number(val)), 'Must be a valid number')
      .refine(val => Number(val) > 0, 'Must be greater than 0'),
    unit: z.enum(['MIN', 'HR'], {
      message: 'Please select a valid unit',
    }),
  })
  .refine(
    data => {
      const time = Number(data.session_time);
      if (data.unit === 'MIN' && time > 60) {
        return false;
      }
      if (data.unit === 'HR' && time > 48) {
        return false;
      }
      return true;
    },
    {
      message: 'Minutes cannot exceed 60 and hours cannot exceed 48',
      path: ['session_time'],
    }
  );

type SessionFormData = z.infer<typeof sessionSchema>;

interface ValidationErrors {
  session_time?: string;
  unit?: string;
}

const SessionMasterForm: React.FC = () => {
  const [sessionTime, setSessionTime] = useState('');
  const [unit, setUnit] = useState('MIN');
  const [data, setData] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [oldData, setOldData] = useState<SessionData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const token = Cookies.get('token');

  const sessionTimeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time validation effect
  useEffect(() => {
    if (!isEditMode) {
      setValidationErrors({});
      setIsValid(false);
      return;
    }

    const formData = { session_time: sessionTime, unit };
    const result = sessionSchema.safeParse(formData);

    if (result.success) {
      setValidationErrors({});
      setIsValid(true);
    } else {
      const errors: ValidationErrors = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof ValidationErrors;
        if (field) {
          errors[field] = issue.message;
        }
      });
      setValidationErrors(errors);
      setIsValid(false);
    }
  }, [sessionTime, unit, isEditMode]);

  const fetchData = () => {
    setLoading(true);
    axios
      .get('/api/admin/get-all-session-master')
      .then((response: any) => {
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setData([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
        toast.error('Failed to fetch session details. Try again');
        logError(
          error.response?.data?.message || error.message,
          error,
          'Session Master',
          getUserID()
        );
      });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof SessionData)[] = [
        'id',
        'session_time',
        'unit',
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
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handleSave = () => {
    if (!isValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    const newSessionData = {
      session_time: sessionTime.trim(),
      unit: unit,
      updated_by: getUserID().trim(),
    };

    axios
      .post('/api/admin/update-session-master', newSessionData)
      .then(response => {
        const responseData = response.data;
        if (responseData.Status === 'F') {
          toast.error(responseData.Message);
          logError(
            responseData.Message.toString(),
            '',
            'Session Master',
            getUserID()
          );
        } else if (responseData.Status === 'T') {
          toast.success(responseData.Message);
          fetchData();
          handleCancel();
        }
      })
      .catch(error => {
        const errorMessage = error.response?.data?.message || error.message;
        logError(errorMessage, error, 'Session Master', getUserID());
        toast.error('Failed to save session details. Try again');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleRowSelect = (index: number) => {
    const selectedData = paginatedData[index];
    setOldData(selectedData);
    setSessionTime(selectedData.session_time.toString());
    setUnit(selectedData.unit);
    setSelectedId(selectedData.id);
    setIsUpdateMode(true);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setSessionTime('');
    setUnit('MIN');
    setSelectedId(null);
    setIsUpdateMode(false);
    setIsEditMode(false);
    setOldData(null);
    setValidationErrors({});
    setIsValid(false);
  };

  const handleUpdate = () => {
    if (!selectedId || !oldData) return;
    if (!isValid) {
      toast.error('Please fix validation errors before updating');
      return;
    }

    setIsUpdating(true);
    const updatedData = {
      id: selectedId,
      session_time: sessionTime.trim(),
      unit: unit,
      updated_by: getUserID().trim(),
    };

    axios
      .patch('/api/admin/update-session-master', updatedData)
      .then(response => {
        const responseData = response.data;
        if (responseData.Status === 'F') {
          toast.error(responseData.Message);
          logError(
            responseData.Message.toString(),
            '',
            'Session Master Update',
            getUserID()
          );
        } else if (responseData.Status === 'T') {
          fetchData();
          handleCancel();
          toast.success(responseData.Message);
        }
      })
      .catch(error => {
        console.error('Error updating session:', error);
        const errorMessage = error.response?.data?.message || error.message;
        logError(errorMessage, error, 'Session Master Update', getUserID());
        toast.error('Failed to update session details. Try again');
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const handleNewEntry = () => {
    handleCancel();
    setIsEditMode(true);
  };

  return (
    <>
      {/* Information Card */}
      <Card className="mx-auto mt-5 w-full border-border bg-card">
        <CardContent className="p-4 md:p-6">
          <Alert className="border-accent bg-accent/10">
            <Info className="h-4 w-4 text-accent-foreground" />
            <AlertDescription className="text-accent-foreground">
              <strong>Session Timeout Management:</strong> Configure automatic
              logout settings for user sessions. When users remain inactive for
              the specified duration, they will be automatically logged out for
              security purposes. You can set the timeout in minutes (max 60) or
              hours (max 48).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card className="mx-auto mt-5 w-full border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg text-foreground md:text-xl">
            Session Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sessionTime" className="text-foreground">
                  Session Time *
                </Label>
                <Input
                  ref={sessionTimeRef}
                  id="sessionTime"
                  type="number"
                  min="1"
                  max={unit === 'MIN' ? '60' : '48'}
                  value={sessionTime}
                  onChange={e => setSessionTime(e.target.value)}
                  placeholder={
                    isEditMode
                      ? `Enter ${unit === 'MIN' ? 'minutes (1-60)' : 'hours (1-48)'}`
                      : 'Click "Edit" to enter session time'
                  }
                  className={cn(
                    'border-border bg-background',
                    validationErrors.session_time && isEditMode
                      ? 'border-destructive focus-visible:ring-destructive'
                      : ''
                  )}
                  disabled={!isEditMode}
                  required
                />
                {validationErrors.session_time && isEditMode && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{validationErrors.session_time}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-foreground">
                  Unit *
                </Label>
                <Select
                  value={unit}
                  onValueChange={setUnit}
                  disabled={!isEditMode}
                >
                  <SelectTrigger
                    className={cn(
                      'border-border bg-background',
                      validationErrors.unit && isEditMode
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    )}
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIN">Minutes</SelectItem>
                    <SelectItem value="HR">Hours</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.unit && isEditMode && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{validationErrors.unit}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Status Indicator */}
            {isEditMode && (
              <div className="mt-4 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-700 dark:text-green-400">
                        Form is valid and ready to submit
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-red-700 dark:text-red-400">
                        Please fix validation errors above
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
              <Button
                onClick={handleUpdate}
                disabled={
                  !isUpdateMode || !isEditMode || !isValid || isUpdating
                }
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
                disabled={!isEditMode}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="mx-auto mt-5 w-full border-border bg-card">
        <CardContent className="p-4 md:p-6">
          <div className="mt-4 md:mt-8">
            <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  defaultValue="10"
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[70px] border-border">
                    <SelectValue placeholder={itemsPerPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
              <div className="flex w-full items-center space-x-2 sm:w-auto">
                <TableSearch onSearch={handleSearch} />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="whitespace-nowrap text-foreground">
                      Action
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-foreground">
                      ID
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-foreground">
                      Session Time
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-foreground">
                      Unit
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-foreground">
                      Created by
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-foreground">
                      Created On
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-foreground">
                      Updated by
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-foreground">
                      Updated On
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        <Loading size="md" label="Loading session data..." />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        No session data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableRow key={row.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant={'ghost'}
                            onClick={() => handleRowSelect(index)}
                            className="px-2 py-1 text-xs hover:bg-accent"
                          >
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {row.id}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {row.session_time}
                        </TableCell>
                        <TableCell className="text-foreground">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {row.unit === 'MIN' ? 'Minutes' : 'Hours'}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {row.created_by}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-foreground">
                          {new Date(row.created_on).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {row.updated_by ? row.updated_by : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-foreground">
                          {row.updated_on
                            ? new Date(row.updated_on).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Component */}
            <div className="mt-4 flex flex-col items-center justify-between gap-4 text-sm sm:flex-row md:text-base">
              <div className="text-center text-muted-foreground sm:text-left">
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
                            : 'cursor-pointer hover:bg-accent'
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
                              className="cursor-pointer"
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
                            : 'cursor-pointer hover:bg-accent'
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

export default SessionMasterForm;
