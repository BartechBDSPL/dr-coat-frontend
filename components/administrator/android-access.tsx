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
import { AlertCircle } from 'lucide-react';
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

interface HHTUser {
  id: number;
  device_system_sn: string | null;
  device_sn: string;
  request_by: string;
  mobile_no: string;
  request_date: string;
  device_Status: string;
  register_by: string | null;
  register_date: string | null;
}

interface ApiResponse {
  Status: string;
  Message: string;
}

const AndroidAccess: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<HHTUser | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<HHTUser[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const token = Cookies.get('token');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/admin/get-hht-user-specific', {
        name: '',
        mobile_no: '',
        device_status: '',
      });

      if (response.data.Status === 'F') {
        toast.error(
          response.data.Message || 'Failed to fetch pending approvals'
        );
        setPendingApprovals([]);
      } else if (Array.isArray(response.data)) {
        setPendingApprovals(response.data);
      } else {
        setPendingApprovals([]);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to fetch pending approvals');
      setPendingApprovals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleSelect = (user: HHTUser) => {
    setSelectedUser(user);
    setShowSuccess(false);
  };

  const handleApproval = async () => {
    if (!selectedUser) return false;

    try {
      const response = await axios.patch('/api/admin/edit-hht-user', {
        device_sn: selectedUser.device_sn,
        register_by: getUserID(),
        mobile_no: selectedUser.mobile_no,
      });

      if (response.data.Status === 'T') {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedUser(null);
          fetchPendingApprovals();
        }, 2000);

        toast.success(response.data.Message || 'User approved successfully');
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
      toast.error(error.response?.data?.Message || 'Failed to approve user');
      return false;
    }
  };

  const filteredData = useMemo(() => {
    return pendingApprovals.filter(item => {
      const searchableFields: (keyof HHTUser)[] = [
        'device_sn',
        'mobile_no',
        'request_by',
        'device_Status',
      ];
      return searchableFields.some(key => {
        const value = item[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [pendingApprovals, searchTerm]);

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
          No Pending Approvals
        </h3>
        <p className="max-w-md text-center text-muted-foreground">
          There are currently no pending Android access approvals to display.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card className="mx-auto w-full border-border bg-opacity-50 shadow-sm backdrop-blur-sm dark:bg-opacity-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            HHT Access Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label
                htmlFor="deviceSN"
                className="text-sm font-medium text-foreground"
              >
                Device SN
              </Label>
              <Input
                id="deviceSN"
                value={selectedUser?.device_sn || ''}
                disabled
                className="border-border bg-background/50"
                placeholder="No device selected"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="mobileNo"
                className="text-sm font-medium text-foreground"
              >
                Mobile Number
              </Label>
              <Input
                id="mobileNo"
                value={selectedUser?.mobile_no || ''}
                disabled
                className="border-border bg-background/50"
                placeholder="No device selected"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="requestBy"
                className="text-sm font-medium text-foreground"
              >
                Requested By
              </Label>
              <Input
                id="requestBy"
                value={selectedUser?.request_by || ''}
                disabled
                className="border-border bg-background/50"
                placeholder="No device selected"
              />
            </div>
          </div>

          {selectedUser && !showSuccess && (
            <motion.div
              className="my-6 flex flex-col items-center"
              animate={
                isError
                  ? {
                      x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
                      transition: { duration: 0.5 },
                    }
                  : {}
              }
            >
              <div className="mb-4 text-sm text-muted-foreground">
                Swipe to approve access
              </div>
              <AnimatedSwitch onComplete={handleApproval} />
            </motion.div>
          )}

          {showSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="my-6 flex items-center justify-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg dark:bg-green-600">
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl font-bold text-white"
                >
                  ✓
                </motion.div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {pendingApprovals.length > 0 ? (
        <Card className="mx-auto mt-5 w-full border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
              Pending Approvals
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
                        Device SN
                      </TableHead>
                      <TableHead className="hidden font-semibold text-foreground sm:table-cell">
                        Mobile Number
                      </TableHead>
                      <TableHead className="hidden font-semibold text-foreground md:table-cell">
                        Requested By
                      </TableHead>
                      <TableHead className="hidden font-semibold text-foreground lg:table-cell">
                        Request Date
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map(user => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelect(user)}
                            className="h-8 border-border px-2 py-1 text-xs hover:bg-primary/20"
                          >
                            Select
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.device_sn}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {user.mobile_no}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.request_by}
                        </TableCell>
                        <TableCell className="hidden text-sm lg:table-cell">
                          {new Date(user.request_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              user.device_Status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }`}
                          >
                            {user.device_Status}
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
        <Loading size="md" label="Loading pending approvals..." />
      ) : (
        <NoDataCard />
      )}
    </div>
  );
};

export default AndroidAccess;
