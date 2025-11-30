'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  RefreshCw,
  UserPlus,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '../multi-select';
import { Separator } from '@/components/ui/separator';
import { getUserID } from '@/utils/getFromSession';
import CustomDropdown from '../CustomDropdown';
import axios from '@/lib/axios-config';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StockTransferDetails {
  Status: string;
  Message: string;
  stock_transfer_number: string;
  transfer_from_code: string;
  transfer_to_code: string;
  posting_date: string;
  item_code: string;
  lot_no: string;
  quantity: number;
  item_description: string;
  line_no: number;
  quantity_shipped: number;
  quantity_received: number;
  assign_user?: string;
  created_by: string;
  created_date: string | null;
  updated_by: string;
  updated_date: string | null;
}

interface LineItemUsers {
  [lineNo: number]: string[];
}

interface RecentOrder {
  id: number;
  stock_transfer_number: string;
  transfer_from_code: string;
  transfer_to_code: string;
  posting_date: string;
  item_code: string;
  lot_no: string;
  packing_details: string;
  item_description: string;
  line_no: string;
  quantity_shipped: number;
  quantity_received: number;
  assign_user: string;
  picked_status: string;
  quantity: number;
  picked_quantity: number;
  pending_quantity: number;
  created_date: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

const StockTransferOrder: React.FC = () => {
  const [transferOrderNo, setTransferOrderNo] = useState('');
  const [orderDetails, setOrderDetails] = useState<StockTransferDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [lineItemUsers, setLineItemUsers] = useState<LineItemUsers>({});
  const [activeUsers, setActiveUsers] = useState<DropdownOption[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [warehouses, setWarehouses] = useState<DropdownOption[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [transferOrderNumbers, setTransferOrderNumbers] = useState<string[]>(
    []
  );
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const orderNoRef = useRef<HTMLInputElement>(null);
  const token = Cookies.get('token');

  useEffect(() => {
    orderNoRef.current?.focus();
    fetchWarehouses();
    fetchRecentOrders();
  }, []);

  useEffect(() => {
    if (orderDetails.length > 0 && selectedUsers.length >= 0) {
      const updatedLineItemUsers: LineItemUsers = {};
      orderDetails.forEach(item => {
        updatedLineItemUsers[item.line_no] = [...selectedUsers];
      });
      setLineItemUsers(updatedLineItemUsers);
    }
  }, [selectedUsers]);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/api/master/get-all-wh-code');
      const warehouseOptions: DropdownOption[] = response.data.map(
        (item: { warehouse_code: string }) => ({
          value: item.warehouse_code,
          label: item.warehouse_code,
        })
      );
      setWarehouses(warehouseOptions);
    } catch (error: any) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to fetch warehouses');
    }
  };

  const fetchUsersByWarehouse = async (warehouseCode: string) => {
    if (!warehouseCode) {
      setActiveUsers([]);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const response = await fetch(`/api/admin/get-user-ids-by-warehouse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          warehouse_code: warehouseCode,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const userOptions: DropdownOption[] = data.map((user: any) => ({
        value: user.user_id,
        label: user.user_id,
      }));

      setActiveUsers(userOptions);

      if (userOptions.length === 0) {
        toast.info('No users found for selected warehouse');
      }
    } catch (error: any) {
      console.error('Error fetching users by warehouse:', error);
      toast.error('Failed to fetch users for selected warehouse');
      setActiveUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleWarehouseChange = (warehouseCode: string) => {
    setSelectedWarehouse(warehouseCode);
    setSelectedUsers([]);
    setLineItemUsers({});
    fetchUsersByWarehouse(warehouseCode);
  };

  const fetchRecentOrders = async () => {
    setIsLoadingRecent(true);
    try {
      const response = await fetch(
        `/api/transactions/stock-transfer-order/get-recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch recent orders');

      const data: RecentOrder[] = await response.json();
      setRecentOrders(data);
    } catch (error: any) {
      console.error('Error fetching recent orders:', error);
      toast.error('Failed to fetch recent orders');
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const fetchTransferOrdersByDateRange = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }

    if (fromDate > toDate) {
      toast.error('From Date cannot be greater than To Date');
      return;
    }

    setIsFetchingOrders(true);

    try {
      const response = await fetch(
        `/api/transactions/stock-transfer-order/by-date-range`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            from_date: DateTime.fromJSDate(fromDate).toFormat('yyyy-MM-dd'),
            to_date: DateTime.fromJSDate(toDate).toFormat('yyyy-MM-dd'),
          }),
        }
      );

      if (!response.ok)
        throw new Error('Failed to fetch transfer order numbers');

      const result = await response.json();

      if (result.Status === 'F') {
        toast.error(result.Message || 'Failed to fetch transfer order numbers');
        setTransferOrderNumbers([]);
        return;
      }

      if (result.Status === 'T') {
        if (result.data && result.data.length > 0) {
          setTransferOrderNumbers(result.data);
          toast.success(`Found ${result.data.length} transfer orders`);
        } else {
          setTransferOrderNumbers([]);
          toast.info(result.Message || 'No transfer orders found');
        }
      }
    } catch (error: any) {
      console.error('Error fetching transfer order numbers:', error);
      toast.error('Failed to fetch transfer order numbers');
      setTransferOrderNumbers([]);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  const handleGetDetails = async () => {
    if (!transferOrderNo.trim()) {
      toast.error('Please enter a transfer order number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/transactions/stock-transfer-order/get-details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stock_transfer_number: transferOrderNo.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch order details');

      const data = await response.json();

      if (data.Status === 'F' || (!Array.isArray(data) && data.Message)) {
        toast.error(data.Message || 'Stock transfer order not found in ERP');
        setOrderDetails([]);
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        setOrderDetails(data);

        const initialLineItemUsers: LineItemUsers = {};
        const allAssignedUsers = new Set<string>();

        data.forEach(item => {
          if (item.assign_user) {
            const users = item.assign_user
              .split(',')
              .map((u: string) => u.trim());
            initialLineItemUsers[item.line_no] = users;

            users.forEach((user: string) => allAssignedUsers.add(user));
          } else {
            initialLineItemUsers[item.line_no] = [];
          }
        });

        setLineItemUsers(initialLineItemUsers);

        if (allAssignedUsers.size > 0) {
          setSelectedUsers(Array.from(allAssignedUsers));
        }

        toast.success(`Found ${data.length} items in transfer order`);
      } else {
        toast.warning('No items found for this transfer order');
        setOrderDetails([]);
        setLineItemUsers({});
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
      setOrderDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (orderDetails.length === 0) {
      toast.error('No order details to assign');
      return;
    }

    const allAssigned = orderDetails.every(
      item => (lineItemUsers[item.line_no] || []).length > 0
    );
    if (!allAssigned) {
      toast.error('Please assign at least one user to each line item');
      return;
    }

    setIsAssigning(true);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    try {
      for (const item of orderDetails) {
        try {
          const lineUsers = lineItemUsers[item.line_no] || [];

          if (lineUsers.length === 0) {
            continue;
          }

          const assignedUsers = lineUsers.join(',');

          const response = await fetch(
            `/api/transactions/stock-transfer-order/insert`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                stock_transfer_number: item.stock_transfer_number,
                transfer_from_code: item.transfer_from_code,
                transfer_to_code: item.transfer_to_code,
                posting_date: item.posting_date,
                item_code: item.item_code,
                lot_no: item.lot_no,
                quantity: item.quantity,
                packing_details: '',
                item_description: item.item_description,
                quantity_shipped: item.quantity_shipped,
                quantity_received: item.quantity_received,
                line_no: item.line_no.toString(),
                assign_user: assignedUsers,
                created_by: getUserID(),
              }),
            }
          );

          const result = await response.json();

          if (result.Status === 'T') {
            successCount++;
          } else {
            failCount++;
            errors.push(`${item.item_code}: ${result.Message}`);
          }
        } catch (error) {
          failCount++;
          errors.push(`${item.item_code}: Failed to insert`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully assigned ${successCount} items`);
      }
      if (failCount > 0) {
        toast.error(`Failed to assign ${failCount} items`, {
          description: errors.slice(0, 3).join(', '),
        });
      }

      if (successCount > 0) {
        setTransferOrderNo('');
        setOrderDetails([]);
        setSelectedUsers([]);
        setLineItemUsers({});
        await fetchRecentOrders();
        orderNoRef.current?.focus();
      }
    } catch (error: any) {
      console.error('Error assigning users:', error);
      toast.error('Failed to assign users');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReset = () => {
    setTransferOrderNo('');
    setOrderDetails([]);
    setSelectedUsers([]);
    setLineItemUsers({});
    orderNoRef.current?.focus();
  };

  const handleLineItemUsersChange = (lineNo: number, users: string[]) => {
    setLineItemUsers(prev => ({
      ...prev,
      [lineNo]: users,
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            <Clock className="mr-1 h-3 w-3" />
            Open
          </Badge>
        );
      case 'in progress':
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 bg-yellow-50 text-yellow-700"
          >
            <Package className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="mt-5 space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock Transfer Order Entry
            </CardTitle>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-muted-foreground dark:border-blue-800 dark:bg-blue-950/30">
              <strong>How it works:</strong>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>
                  Select users globally - they will automatically sync to all
                  line items
                </li>
                <li>Modify users per line item in the table below if needed</li>
                <li>Each line item can have different users assigned</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !fromDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? (
                        format(fromDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !toDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? (
                        format(toDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchTransferOrdersByDateRange}
                  disabled={isFetchingOrders}
                  className="w-full"
                >
                  {isFetchingOrders ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Fetch Orders
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="warehouse">
                  Warehouse Code *
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Select to load users)
                  </span>
                </Label>
                <CustomDropdown
                  options={warehouses}
                  value={selectedWarehouse}
                  onValueChange={handleWarehouseChange}
                  placeholder="Select warehouse code"
                  searchPlaceholder="Search warehouse..."
                  emptyText="No warehouses found"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Label htmlFor="transferOrderNo">
                  Transfer Order Number *
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Select date and fetch or enter manually)
                  </span>
                </Label>
                <div className="flex gap-2">
                  <CustomDropdown
                    value={transferOrderNo}
                    onValueChange={setTransferOrderNo}
                    options={transferOrderNumbers.map(num => ({
                      value: num,
                      label: num,
                    }))}
                    placeholder="Select or Enter Transfer Order Number"
                    searchPlaceholder="Search transfer order..."
                    emptyText="No transfer orders found"
                    disabled={isLoading}
                    allowCustomValue={true}
                  />
                  <Button
                    onClick={handleGetDetails}
                    disabled={isLoading}
                    className="shrink-0"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Get Details</span>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Label htmlFor="assignUser">
                  Assign to Users (Global) *
                  <span className="ml-2 text-xs text-muted-foreground">
                    {!selectedWarehouse
                      ? '(Select warehouse first)'
                      : orderDetails.length === 0
                        ? '(Fetch details first)'
                        : '(Applied to all items)'}
                  </span>
                </Label>
                <MultiSelect
                  options={activeUsers}
                  defaultValue={selectedUsers}
                  onValueChange={setSelectedUsers}
                  placeholder={
                    !selectedWarehouse
                      ? 'Select warehouse first'
                      : isLoadingUsers
                        ? 'Loading users...'
                        : orderDetails.length === 0
                          ? 'Fetch order details first'
                          : activeUsers.length === 0
                            ? 'No users available'
                            : 'Select users for all items'
                  }
                  maxCount={2}
                  className={
                    !selectedWarehouse ||
                    orderDetails.length === 0 ||
                    isLoadingUsers
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }
                  disabled={!selectedWarehouse || isLoadingUsers}
                />
              </div>

              <div className="flex items-end gap-2 lg:col-span-2">
                <Button
                  onClick={handleAssignUser}
                  disabled={
                    orderDetails.length === 0 ||
                    isAssigning ||
                    !orderDetails.every(
                      item => (lineItemUsers[item.line_no] || []).length > 0
                    )
                  }
                  className="flex-1"
                >
                  {isAssigning ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Assign
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={isLoading || isAssigning}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {orderDetails.length > 0 && (
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <CardTitle>Transfer Order Details</CardTitle>

              <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Transfer Order Number
                  </Label>
                  <Input
                    value={orderDetails[0].stock_transfer_number}
                    disabled
                    className="mt-1 font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    From Location
                  </Label>
                  <Input
                    value={orderDetails[0].transfer_from_code}
                    disabled
                    className="mt-1 font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    To Location
                  </Label>
                  <Input
                    value={orderDetails[0].transfer_to_code}
                    disabled
                    className="mt-1 font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Posting Date
                  </Label>
                  <Input
                    value={DateTime.fromISO(orderDetails[0].posting_date)
                      .setZone('GMT')
                      .toFormat('dd-MM-yyyy')}
                    disabled
                    className="mt-1 font-medium"
                  />
                </div>
              </div>

              <Separator />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Sr No</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Lot No</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Shipped</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Line No</TableHead>
                    <TableHead className="min-w-[250px]">
                      Assign to Users (Optional)
                      <div className="mt-1 text-xs font-normal text-muted-foreground">
                        Add additional users per item
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.item_code}
                      </TableCell>
                      <TableCell>{item.item_description}</TableCell>
                      <TableCell>{item.lot_no || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{item.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity_shipped}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity_received}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.line_no}
                      </TableCell>
                      <TableCell>
                        <MultiSelect
                          options={activeUsers}
                          defaultValue={lineItemUsers[item.line_no] || []}
                          onValueChange={users =>
                            handleLineItemUsersChange(item.line_no, users)
                          }
                          placeholder="Add users"
                          maxCount={2}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Items:</span>
                <Badge variant="default" className="text-base">
                  {orderDetails.length}
                </Badge>
              </div>

              {selectedUsers.length > 0 && (
                <div className="border-t pt-2">
                  <div className="mb-2 text-sm font-medium">
                    Global Users (Synced to all line items):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <Badge key={user} variant="secondary">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(lineItemUsers).length > 0 && (
                <div className="border-t pt-2">
                  <div className="mb-2 text-sm font-medium">
                    Users by Line Item:
                  </div>
                  <div className="space-y-2 text-xs">
                    {Object.entries(lineItemUsers)
                      .filter(([_, users]) => users.length > 0)
                      .map(([lineNo, users]) => (
                        <div key={lineNo} className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            Line {lineNo}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {users.map((user: string) => (
                              <Badge
                                key={user}
                                variant="outline"
                                className="text-xs"
                              >
                                {user}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Transfer Orders
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecentOrders}
              disabled={isLoadingRecent}
            >
              {isLoadingRecent ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Sr No</TableHead>
                    <TableHead>Transfer Order No</TableHead>
                    <TableHead>Transfer Route</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Picked</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.stock_transfer_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            {order.transfer_from_code}
                          </Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {order.transfer_to_code}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.item_code}
                      </TableCell>
                      <TableCell>{order.item_description}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{order.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            order.picked_quantity > 0
                              ? 'font-medium text-green-600'
                              : ''
                          }
                        >
                          {order.picked_quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            order.pending_quantity > 0
                              ? 'font-medium text-orange-600'
                              : ''
                          }
                        >
                          {order.pending_quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.assign_user}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.picked_status)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {DateTime.fromISO(order.created_date)
                          .setZone('GMT')
                          .toFormat('dd-MM-yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No recent orders found</p>
              <p className="mt-2 text-sm">
                Create a new transfer order to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTransferOrder;
