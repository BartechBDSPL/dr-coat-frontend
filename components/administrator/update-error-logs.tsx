'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, RefreshCw } from 'lucide-react';
import TableSearch from '@/utils/tableSearch';
import { getUserID } from '@/utils/getFromSession';

interface PostingLog {
  log_id: number;
  type: string;
  shipment_no: string;
  line_no: string;
  item_code: string;
  quantity: number;
  lot_no: string;
  post: string;
  posting: boolean;
  created_by: string;
  created_date: string;
}

const UpdateErrorLogs: React.FC = () => {
  const [logs, setLogs] = useState<PostingLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const token = Cookies.get('token');
  const userName = getUserID();

  const filteredData = useMemo(() => {
    return logs.filter(item => {
      const searchableFields: (keyof PostingLog)[] = [
        'type',
        'shipment_no',
        'line_no',
        'item_code',
        'lot_no',
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
  }, [logs, searchTerm]);

  const handleSearchTerm = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setPage(1);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setPage(1);
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/get-pending-posting-logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: PostingLog[] = await response.json();
      setLogs(data);
      toast.success(`Found ${data.length} pending logs`);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllLogs = async () => {
    if (filteredData.length === 0) {
      toast.error('No logs to update');
      return;
    }

    setIsUpdating(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const log of filteredData) {
        try {
          const response = await fetch(`/api/admin/update-posting-log`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              log_id: log.log_id,
              posted_by: userName,
              type: log.type,
              shipment_no: log.shipment_no,
              line_no: log.line_no,
              item_code: log.item_code,
              quantity: log.quantity,
              lot_no: log.lot_no,
              post: log.post,
            }),
          });

          const result = await response.json();

          if (result.Status === 'T') {
            successCount++;
          } else {
            failCount++;
            console.error(
              `Failed to update log ${log.log_id}: ${result.Message}`
            );
          }
        } catch (error) {
          failCount++;
          console.error(`Error updating log ${log.log_id}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(
          `Successfully updated ${successCount} log(s)${failCount > 0 ? `, ${failCount} failed` : ''}`
        );
        await fetchLogs();
      } else {
        toast.error('Failed to update any logs');
      }
    } catch (error) {
      console.error('Error in batch update:', error);
      toast.error('Failed to update logs');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <Card className="mt-5">
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Update Error Logs</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={fetchLogs}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                onClick={updateAllLogs}
                disabled={isUpdating || filteredData.length === 0}
                size="sm"
              >
                {isUpdating
                  ? 'Updating...'
                  : `Update All (${filteredData.length})`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="mb-4 h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                Loading logs...
              </p>
            </div>
          ) : logs.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <TableSearch onSearch={handleSearchTerm} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Items per page:
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr No</TableHead>
                      <TableHead>Log ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Order No</TableHead>
                      <TableHead>Line No</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Lot No</TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((log, index) => (
                      <TableRow key={log.log_id}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{log.log_id}</TableCell>
                        <TableCell>{log.type}</TableCell>
                        <TableCell>{log.shipment_no}</TableCell>
                        <TableCell>{log.line_no}</TableCell>
                        <TableCell>{log.item_code}</TableCell>
                        <TableCell>{log.quantity}</TableCell>
                        <TableCell>{log.lot_no}</TableCell>
                        <TableCell>{log.post}</TableCell>
                        <TableCell>{log.created_by}</TableCell>
                        <TableCell>
                          {new Date(log.created_date).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={
                          page === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && page < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage(p => Math.min(totalPages, p + 1))
                        }
                        className={
                          page === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                No pending logs found
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateErrorLogs;
