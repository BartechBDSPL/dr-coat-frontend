'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '@/lib/axios-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading';
import AnimatedSwitch from '../ui/animated-switch';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { getUserID } from '@/utils/getFromSession';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import TableSearch from '@/utils/tableSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { DateTime } from 'luxon';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReprintRequest {
  sr_no: number;
  request_by: string;
  request_date: string;
  serial_no: string;
  total_number_of_serial: number;
  status: string;
  approved_by: string | null;
  approved_date: string | null;
  reprint_reason: string;
}

const ReprintApproval: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<ReprintRequest | null>(
    null
  );
  const [pendingRequests, setPendingRequests] = useState<ReprintRequest[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const token = Cookies.get('token');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        '/api/transactions/reprint-request-get-pending',
        {}
      );

      if (response.data.Status === 'F') {
        toast.error(
          response.data.Message || 'Failed to fetch pending requests'
        );
        setPendingRequests([]);
      } else if (Array.isArray(response.data)) {
        setPendingRequests(response.data);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to fetch pending requests');
      setPendingRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleSelect = (request: ReprintRequest) => {
    setSelectedRequest(request);
    setShowSuccess(false);
    setShowReject(false);
  };

  const handleApproval = async () => {
    if (!selectedRequest) return false;

    try {
      const response = await axios.post(
        '/api/transactions/reprint-request-update',
        {
          sr_no: selectedRequest.sr_no,
          approve_by: getUserID(),
        }
      );

      if (response.data.Status === 'T') {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedRequest(null);
          fetchPendingRequests();
        }, 2000);

        toast.success(response.data.Message || 'Request approved successfully');
        return true;
      } else {
        setIsError(true);
        setTimeout(() => setIsError(false), 500);
        toast.error(response.data.Message || 'Operation failed');
        return false;
      }
    } catch (error: any) {
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      toast.error(error.response?.data?.Message || 'Failed to approve request');
      return false;
    }
  };

  const handleRejection = async () => {
    if (!selectedRequest) return false;

    try {
      const response = await axios.post(
        '/api/transactions/reprint-request-reject',
        {
          sr_no: selectedRequest.sr_no,
          reject_by: getUserID(),
        }
      );

      if (response.data.Status === 'T') {
        setShowReject(true);
        setTimeout(() => {
          setShowReject(false);
          setSelectedRequest(null);
          fetchPendingRequests();
        }, 2000);

        toast.success(response.data.Message || 'Request rejected successfully');
        return true;
      } else {
        setIsError(true);
        setTimeout(() => setIsError(false), 500);
        toast.error(response.data.Message || 'Operation failed');
        return false;
      }
    } catch (error: any) {
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      toast.error(error.response?.data?.Message || 'Failed to reject request');
      return false;
    }
  };

  const filteredData = useMemo(() => {
    return pendingRequests.filter(item => {
      const searchableFields: (keyof ReprintRequest)[] = [
        'request_by',
        'serial_no',
        'status',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [pendingRequests, searchTerm]);

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

  const NoDataCard = () => (
    <Card className="border-border shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          No Pending Requests
        </h3>
        <p className="max-w-md text-center text-muted-foreground">
          There are currently no pending reprint requests to display.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card className="mx-auto w-full border-border bg-opacity-50 shadow-sm backdrop-blur-sm dark:bg-opacity-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            Reprint Request Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="requestBy"
                className="text-sm font-medium text-foreground"
              >
                Requested By
              </Label>
              <Input
                id="requestBy"
                value={selectedRequest?.request_by || ''}
                disabled
                className="border-border bg-background/50"
                placeholder="No request selected"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="requestDate"
                className="text-sm font-medium text-foreground"
              >
                Request Date
              </Label>
              <Input
                id="requestDate"
                value={
                  selectedRequest?.request_date
                    ? DateTime.fromISO(selectedRequest.request_date)
                        .setZone('GMT')
                        .toFormat('yyyy-MM-dd HH:mm:ss')
                    : ''
                }
                disabled
                className="border-border bg-background/50"
                placeholder="No request selected"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="serialNo"
                className="text-sm font-medium text-foreground"
              >
                Serial Number(s)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="serialNo"
                  value={
                    selectedRequest?.serial_no
                      ? `${selectedRequest.serial_no.split('$').length} serial(s)`
                      : ''
                  }
                  disabled
                  className="border-border bg-background/50"
                  placeholder="No request selected"
                />
                {selectedRequest && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSerials(selectedRequest.serial_no.split('$'));
                      setDialogOpen(true);
                    }}
                    className="h-10 w-10 p-0 hover:bg-primary/20"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="totalSerial"
                className="text-sm font-medium text-foreground"
              >
                Total Number of Serials
              </Label>
              <Input
                id="totalSerial"
                value={selectedRequest?.total_number_of_serial || ''}
                disabled
                className="border-border bg-background/50"
                placeholder="No request selected"
              />
            </div>
            <div className="col-span-1 space-y-2 md:col-span-2">
              <Label
                htmlFor="reprintReason"
                className="text-sm font-medium text-foreground"
              >
                Reprint Reason
              </Label>
              <Textarea
                id="reprintReason"
                value={selectedRequest?.reprint_reason || ''}
                disabled
                className="border-border bg-background/50"
                placeholder="No request selected"
                rows={3}
              />
            </div>
          </div>

          {selectedRequest && !showSuccess && !showReject && (
            <motion.div
              className="my-6 flex flex-col items-center gap-8"
              animate={
                isError
                  ? {
                      x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
                      transition: { duration: 0.5 },
                    }
                  : {}
              }
            >
              <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Swipe right to approve
                  </div>
                  <AnimatedSwitch onComplete={handleApproval} type="approve" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Swipe right to reject
                  </div>
                  <AnimatedSwitch onComplete={handleRejection} type="reject" />
                </div>
              </div>
            </motion.div>
          )}

          {showSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="my-6 flex items-center justify-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg dark:bg-green-600">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </motion.div>
          )}

          {showReject && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="my-6 flex items-center justify-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg dark:bg-red-600">
                <XCircle className="h-10 w-10 text-white" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {pendingRequests.length > 0 ? (
        <Card className="mx-auto mt-5 w-full border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
              Pending Requests ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Show</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={value => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
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

            <div className="overflow-hidden rounded-md border border-border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-foreground">
                        Action
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Sr No
                      </TableHead>
                      <TableHead className="hidden font-semibold text-foreground sm:table-cell">
                        Requested By
                      </TableHead>
                      <TableHead className="hidden font-semibold text-foreground md:table-cell">
                        Request Date
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        View Serials
                      </TableHead>
                      <TableHead className="hidden font-semibold text-foreground lg:table-cell">
                        Total Serials
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map(request => (
                      <TableRow
                        key={request.sr_no}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelect(request)}
                            className="h-8 border-border px-2 py-1 text-xs hover:bg-primary/20"
                          >
                            Select
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.sr_no}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {request.request_by}
                        </TableCell>
                        <TableCell className="hidden text-sm md:table-cell">
                          {DateTime.fromISO(request.request_date)
                            .setZone('GMT')
                            .toFormat('yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSerials(request.serial_no.split('$'));
                              setDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-primary/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {request.total_number_of_serial}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              request.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }`}
                          >
                            {request.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

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
                        onClick={() => setCurrentPage(currentPage - 1)}
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
                              onClick={() => setCurrentPage(pageNumber)}
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
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'} border-border`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Loading size="md" label="Loading pending requests..." />
      ) : (
        <NoDataCard />
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Serial Numbers
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {selectedSerials.map((serial, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md border border-border bg-muted p-3"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="flex-1 font-mono text-sm text-foreground">
                  {serial}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReprintApproval;
