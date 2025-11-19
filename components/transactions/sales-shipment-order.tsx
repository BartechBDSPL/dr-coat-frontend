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
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '../multi-select';
import { Separator } from '@/components/ui/separator';
import { getUserID } from '@/utils/getFromSession';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CustomDropdown from '../CustomDropdown';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ShipmentDetails {
  shipment_no: string;
  order_no: string;
  item_code: string;
  item_description: string;
  lot_no: string;
  packing_details: string;
  item_reference_number: string;
  assigned_user: string;
  picked_status: string;
  quantity: number;
  remaining_qty: number;
  truck_no: string;
  driver_name: string;
  driver_contact_no: string;
}

interface ApiResponse {
  isFromAPI: boolean;
  Status?: string;
  Message?: string;
  data: ShipmentDetails[];
}

interface LineItemUsers {
  [lotNo: string]: string[];
}

interface LineItemShipping {
  [lotNo: string]: {
    truck_no: string;
    driver_name: string;
    driver_contact_no: string;
  };
}

interface RecentShipment {
  id: number;
  shipment_no: string;
  order_no: string;
  item_code: string;
  item_description: string;
  lot_no: string;
  picked_status: string;
  picked_qty: number;
  remaining_qty: number;
  truck_no: string;
  driver_name: string;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
}

interface DropdownOption {
  value: string;
  label: string;
}

const SalesShipmentOrder: React.FC = () => {
  const [shipmentNo, setShipmentNo] = useState('');
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [lineItemUsers, setLineItemUsers] = useState<LineItemUsers>({});
  const [lineItemShipping, setLineItemShipping] = useState<LineItemShipping>(
    {}
  );
  const [activeUsers, setActiveUsers] = useState<DropdownOption[]>([]);
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [globalTruckNo, setGlobalTruckNo] = useState('');
  const [globalDriverName, setGlobalDriverName] = useState('');
  const [globalDriverContact, setGlobalDriverContact] = useState('');
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [isFromAPI, setIsFromAPI] = useState(true);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [shipmentNumbers, setShipmentNumbers] = useState<string[]>([]);
  const [isFetchingShipments, setIsFetchingShipments] = useState(false);
  const shipmentNoRef = useRef<HTMLInputElement>(null);
  const token = Cookies.get('token');

  useEffect(() => {
    shipmentNoRef.current?.focus();
    fetchActiveUsers();
    fetchRecentShipments();
  }, []);

  // Update all line items when global users change
  useEffect(() => {
    if (shipmentDetails.length > 0 && selectedUsers.length >= 0) {
      const updatedLineItemUsers: LineItemUsers = {};
      shipmentDetails.forEach(item => {
        const key = `${item.lot_no}`;
        updatedLineItemUsers[key] = [...selectedUsers];
      });
      setLineItemUsers(updatedLineItemUsers);
    }
  }, [selectedUsers]);

  // Update all line items when global shipping info changes
  useEffect(() => {
    if (shipmentDetails.length > 0) {
      const updatedLineItemShipping: LineItemShipping = {};
      shipmentDetails.forEach(item => {
        const key = `${item.lot_no}`;
        updatedLineItemShipping[key] = {
          truck_no: globalTruckNo,
          driver_name: globalDriverName,
          driver_contact_no: globalDriverContact,
        };
      });
      setLineItemShipping(updatedLineItemShipping);
    }
  }, [globalTruckNo, globalDriverName, globalDriverContact, shipmentDetails]);

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch(`/api/admin/active-user-ids`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const userOptions: DropdownOption[] = data.map((user: any) => ({
        value: user.user_id,
        label: user.user_id,
      }));

      setActiveUsers(userOptions);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch active users');
    }
  };

  const fetchRecentShipments = async () => {
    setIsLoadingRecent(true);
    try {
      const response = await fetch(
        `/api/transactions/sales-shipment-order/get-recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch recent shipments');

      const data: RecentShipment[] = await response.json();
      setRecentShipments(data);
    } catch (error: any) {
      console.error('Error fetching recent shipments:', error);
      toast.error('Failed to fetch recent shipments');
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const fetchShipmentsByDateRange = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }

    if (fromDate > toDate) {
      toast.error('From Date cannot be greater than To Date');
      return;
    }

    setIsFetchingShipments(true);

    try {
      const response = await fetch(
        `/api/transactions/sales-shipment-order/by-date-range`,
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

      if (!response.ok) throw new Error('Failed to fetch shipment numbers');

      const result = await response.json();

      if (result.Status === 'F') {
        toast.error(result.Message || 'Failed to fetch shipment numbers');
        setShipmentNumbers([]);
        return;
      }

      if (result.Status === 'T') {
        if (result.data && result.data.length > 0) {
          setShipmentNumbers(result.data);
          toast.success(`Found ${result.data.length} shipment orders`);
        } else {
          setShipmentNumbers([]);
          toast.info(result.Message || 'No shipment orders found');
        }
      }
    } catch (error: any) {
      console.error('Error fetching shipment numbers:', error);
      toast.error('Failed to fetch shipment numbers');
      setShipmentNumbers([]);
    } finally {
      setIsFetchingShipments(false);
    }
  };

  const handleGetDetails = async () => {
    if (!shipmentNo.trim()) {
      toast.error('Please enter a shipment number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/transactions/sales-shipment-order/get-details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipment_no: shipmentNo.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch shipment details');

      const result: ApiResponse = await response.json();
      // Check if data is from API or already assigned

      if (result.Status === 'F') {
        toast.error(result.Message || 'Failed to fetch shipment details');
        setShipmentDetails([]);
        setLineItemUsers({});
        setLineItemShipping({});
        return;
      } else if (result.isFromAPI === false) {
        // Show dialog for reassignment
        setIsFromAPI(false);
        setShowReassignDialog(true);

        // Still load the data for display
        if (result.data && result.data.length > 0) {
          setShipmentDetails(result.data);

          // Initialize line item users and shipping from existing data
          const initialLineItemUsers: LineItemUsers = {};
          const initialLineItemShipping: LineItemShipping = {};
          const allAssignedUsers = new Set<string>();

          result.data.forEach(item => {
            const key = `${item.lot_no}`;

            if (item.assigned_user) {
              const users = item.assigned_user
                .split(',')
                .map((u: string) => u.trim());
              initialLineItemUsers[key] = users;
              users.forEach((user: string) => allAssignedUsers.add(user));
            } else {
              initialLineItemUsers[key] = [];
            }

            // Initialize shipping info
            initialLineItemShipping[key] = {
              truck_no: item.truck_no || '',
              driver_name: item.driver_name || '',
              driver_contact_no: item.driver_contact_no || '',
            };
          });

          setLineItemUsers(initialLineItemUsers);
          setLineItemShipping(initialLineItemShipping);

          if (allAssignedUsers.size > 0) {
            setSelectedUsers(Array.from(allAssignedUsers));
          }

          // Set global shipping info from the first item
          if (result.data[0]) {
            setGlobalTruckNo(result.data[0].truck_no || '');
            setGlobalDriverName(result.data[0].driver_name || '');
            setGlobalDriverContact(result.data[0].driver_contact_no || '');
          }
        }
        return;
      }

      // Handle the response structure when isFromAPI is true
      if (result.isFromAPI && result.data && result.data.length > 0) {
        setIsFromAPI(true);
        setShipmentDetails(result.data);

        // Initialize line item users and shipping from existing data
        const initialLineItemUsers: LineItemUsers = {};
        const initialLineItemShipping: LineItemShipping = {};
        const allAssignedUsers = new Set<string>();

        result.data.forEach(item => {
          const key = `${item.lot_no}`;

          if (item.assigned_user) {
            const users = item.assigned_user
              .split(',')
              .map((u: string) => u.trim());
            initialLineItemUsers[key] = users;
            users.forEach((user: string) => allAssignedUsers.add(user));
          } else {
            initialLineItemUsers[key] = [];
          }

          // Initialize shipping info
          initialLineItemShipping[key] = {
            truck_no: item.truck_no || '',
            driver_name: item.driver_name || '',
            driver_contact_no: item.driver_contact_no || '',
          };
        });

        setLineItemUsers(initialLineItemUsers);
        setLineItemShipping(initialLineItemShipping);

        if (allAssignedUsers.size > 0) {
          setSelectedUsers(Array.from(allAssignedUsers));
        }

        // Set global shipping info from the first item
        if (result.data[0]) {
          setGlobalTruckNo(result.data[0].truck_no || '');
          setGlobalDriverName(result.data[0].driver_name || '');
          setGlobalDriverContact(result.data[0].driver_contact_no || '');
        }

        toast.success(`Found ${result.data.length} items in shipment`);
      } else {
        toast.warning('No items found for this shipment');
        setShipmentDetails([]);
        setLineItemUsers({});
        setLineItemShipping({});
      }
    } catch (error: any) {
      console.error('Error fetching shipment details:', error);
      toast.error('Failed to fetch shipment details');
      setShipmentDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (shipmentDetails.length === 0) {
      toast.error('No shipment details to assign');
      return;
    }

    // Check if all line items have users assigned
    const allAssigned = shipmentDetails.every(item => (lineItemUsers[`${item.lot_no}`] || []).length > 0);
    if (!allAssigned) {
      toast.error('Please assign at least one user to each line item');
      return;
    }

    setIsAssigning(true);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    try {
      // If isFromAPI is false, use the reassignment endpoint
      if (!isFromAPI) {
        for (const item of shipmentDetails) {
          try {
            const key = `${item.lot_no}`;
            const lineUsers = lineItemUsers[key] || [];

            if (lineUsers.length === 0) {
              continue;
            }

            const assignedUsers = lineUsers.join(',');

            const response = await fetch(
              `/api/transactions/sales-shipment-order/assign-user`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  shipment_no: item.shipment_no,
                  item_code: item.item_code,
                  lot_no: item.lot_no,
                  assign_user: assignedUsers,
                  updated_by: getUserID(),
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
            errors.push(`${item.item_code}: Failed to update`);
          }
        }

        // Show results for reassignment
        if (successCount > 0) {
          toast.success(`Successfully reassigned ${successCount} items`);
        }
        if (failCount > 0) {
          toast.error(`Failed to reassign ${failCount} items`, {
            description: errors.slice(0, 3).join(', '),
          });
        }

        // Reset and refresh
        if (successCount > 0) {
          setShipmentNo('');
          setShipmentDetails([]);
          setSelectedUsers([]);
          setLineItemUsers({});
          setLineItemShipping({});
          setGlobalTruckNo('');
          setGlobalDriverName('');
          setGlobalDriverContact('');
          setIsFromAPI(true);
          setShowReassignDialog(false);
          await fetchRecentShipments();
          shipmentNoRef.current?.focus();
        }
      } else {
        // Original insert logic for new assignments
        for (const item of shipmentDetails) {
          try {
            const key = `${item.lot_no}`;
            const lineUsers = lineItemUsers[key] || [];

            if (lineUsers.length === 0) {
              continue;
            }

            const assignedUsers = lineUsers.join(',');
            const shippingInfo = lineItemShipping[key] || {
              truck_no: '',
              driver_name: '',
              driver_contact_no: '',
            };

            const response = await fetch(
              `/api/transactions/sales-shipment-order/insert`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  entry_no: '', // Will be generated by backend
                  order_no: item.order_no,
                  shipment_no: item.shipment_no,
                  sell_to_customer_no: '', // Add if available
                  sell_to_customer_name: '', // Add if available
                  order_date: '', // Add if available
                  posting_date: DateTime.now().toFormat('yyyy-MM-dd'),
                  external_document_no: '', // Add if available
                  item_code: item.item_code,
                  item_description: item.item_description,
                  variant_code: '',
                  location_code: '', // Add if available
                  quantity: item.quantity,
                  packing_details: item.packing_details || '',
                  uom: 'KGS', // Default, update as needed
                  lot_no: item.lot_no,
                  truck_no: shippingInfo.truck_no,
                  driver_name: shippingInfo.driver_name,
                  driver_contact_no: shippingInfo.driver_contact_no,
                  created_by: getUserID(),
                  assign_user: assignedUsers,
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

        // Show results
        if (successCount > 0) {
          toast.success(`Successfully assigned ${successCount} items`);
        }
        if (failCount > 0) {
          toast.error(`Failed to assign ${failCount} items`, {
            description: errors.slice(0, 3).join(', '),
          });
        }

        // Reset and refresh
        if (successCount > 0) {
          setShipmentNo('');
          setShipmentDetails([]);
          setSelectedUsers([]);
          setLineItemUsers({});
          setLineItemShipping({});
          setGlobalTruckNo('');
          setGlobalDriverName('');
          setGlobalDriverContact('');
          await fetchRecentShipments();
          shipmentNoRef.current?.focus();
        }
      }
    } catch (error: any) {
      console.error('Error assigning users:', error);
      toast.error('Failed to assign users');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReset = () => {
    setShipmentNo('');
    setShipmentDetails([]);
    setSelectedUsers([]);
    setLineItemUsers({});
    setLineItemShipping({});
    setGlobalTruckNo('');
    setGlobalDriverName('');
    setGlobalDriverContact('');
    shipmentNoRef.current?.focus();
  };

  const handleLineItemUsersChange = (lotNo: string, users: string[]) => {
    setLineItemUsers(prev => ({
      ...prev,
      [lotNo]: users,
    }));
  };

  const handleShippingInfoChange = (
    lotNo: string,
    field: 'truck_no' | 'driver_name' | 'driver_contact_no',
    value: string
  ) => {
    setLineItemShipping(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        [field]: value,
      },
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
      {/* Shipment Entry Section */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Sales Shipment Order Entry
            </CardTitle>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-muted-foreground dark:border-blue-800 dark:bg-blue-950/30">
              <strong>How it works:</strong>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>
                  Select users globally - they will automatically sync to all
                  line items
                </li>
                <li>
                  Enter truck and driver details globally - applied to all items
                </li>
                <li>Modify users per line item in the table below if needed</li>
                <li>Each line item can have different users assigned</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date Range Selection Row */}
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
                  onClick={fetchShipmentsByDateRange}
                  disabled={isFetchingShipments}
                  className="w-full"
                >
                  {isFetchingShipments ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Fetch Shipments
                </Button>
              </div>
            </div>

            {/* First Row: Shipment Number and User Assignment */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Shipment Number Input with Dropdown */}
              <div className="lg:col-span-5">
                <Label htmlFor="shipmentNo">
                  Shipment Number *
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Select date and fetch or enter manually)
                  </span>
                </Label>
                <div className="flex gap-2">
                  <CustomDropdown
                    value={shipmentNo}
                    onValueChange={setShipmentNo}
                    options={shipmentNumbers.map(num => ({
                      value: num,
                      label: num,
                    }))}
                    placeholder="Select or Enter Shipment Number"
                    searchPlaceholder="Search shipment..."
                    emptyText="No shipments found"
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

              {/* User Assignment */}
              <div className="lg:col-span-5">
                <Label htmlFor="assignUser">
                  Assign to Users (Global) *
                  <span className="ml-2 text-xs text-muted-foreground">
                    {shipmentDetails.length === 0
                      ? '(Fetch details first)'
                      : '(Applied to all items)'}
                  </span>
                </Label>
                <MultiSelect
                  options={activeUsers}
                  defaultValue={selectedUsers}
                  onValueChange={setSelectedUsers}
                  placeholder={
                    shipmentDetails.length === 0
                      ? 'Fetch shipment details first'
                      : 'Select users for all items'
                  }
                  maxCount={2}
                  className={
                    shipmentDetails.length === 0
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2 lg:col-span-2">
                <Button
                  onClick={handleAssignUser}
                  disabled={shipmentDetails.length === 0 || isAssigning || !shipmentDetails.every(item => (lineItemUsers[`${item.lot_no}`] || []).length > 0)}
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

            {/* Second Row: Shipping Information (Global) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="globalTruckNo">
                  Truck Number (Global)
                  <span className="ml-2 text-xs text-muted-foreground">
                    {shipmentDetails.length === 0
                      ? '(Fetch details first)'
                      : '(Applied to all items)'}
                  </span>
                </Label>
                <Input
                  id="globalTruckNo"
                  value={globalTruckNo}
                  onChange={e => setGlobalTruckNo(e.target.value)}
                  placeholder="Enter Truck Number"
                  disabled={shipmentDetails.length === 0}
                  className={
                    shipmentDetails.length === 0
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }
                />
              </div>

              <div>
                <Label htmlFor="globalDriverName">
                  Driver Name (Global)
                  <span className="ml-2 text-xs text-muted-foreground">
                    {shipmentDetails.length === 0
                      ? '(Fetch details first)'
                      : '(Applied to all items)'}
                  </span>
                </Label>
                <Input
                  id="globalDriverName"
                  value={globalDriverName}
                  onChange={e => setGlobalDriverName(e.target.value)}
                  placeholder="Enter Driver Name"
                  disabled={shipmentDetails.length === 0}
                  className={
                    shipmentDetails.length === 0
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }
                />
              </div>

              <div>
                <Label htmlFor="globalDriverContact">
                  Driver Contact (Global)
                  <span className="ml-2 text-xs text-muted-foreground">
                    {shipmentDetails.length === 0
                      ? '(Fetch details first)'
                      : '(Applied to all items)'}
                  </span>
                </Label>
                <Input
                  id="globalDriverContact"
                  value={globalDriverContact}
                  onChange={e => setGlobalDriverContact(e.target.value)}
                  placeholder="Enter Driver Contact"
                  disabled={shipmentDetails.length === 0}
                  className={
                    shipmentDetails.length === 0
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Details Section */}
      {shipmentDetails.length > 0 && (
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <CardTitle>Shipment Order Details</CardTitle>

              {/* Header Information */}
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Shipment Number
                  </Label>
                  <Input
                    value={shipmentDetails[0].shipment_no}
                    disabled
                    className="mt-1 font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Order Number
                  </Label>
                  <Input
                    value={shipmentDetails[0].order_no}
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
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="min-w-[200px]">
                      Assign to Users (Optional)
                      <div className="mt-1 text-xs font-normal text-muted-foreground">
                        Override global users if needed
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipmentDetails.map((item, index) => {
                    const key = `${item.lot_no}`;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.item_code}
                        </TableCell>
                        <TableCell>{item.item_description}</TableCell>
                        <TableCell>{item.lot_no || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{item.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.remaining_qty}</Badge>
                        </TableCell>
                        <TableCell>
                          <MultiSelect
                            options={activeUsers}
                            defaultValue={lineItemUsers[key] || []}
                            onValueChange={users =>
                              handleLineItemUsersChange(key, users)
                            }
                            placeholder="Override users"
                            maxCount={2}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Items:</span>
                <Badge variant="default" className="text-base">
                  {shipmentDetails.length}
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

              {(globalTruckNo || globalDriverName || globalDriverContact) && (
                <div className="border-t pt-2">
                  <div className="mb-2 text-sm font-medium">
                    Global Shipping Information:
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
                    {globalTruckNo && (
                      <div>
                        <span className="text-muted-foreground">
                          Truck No:{' '}
                        </span>
                        <Badge variant="outline">{globalTruckNo}</Badge>
                      </div>
                    )}
                    {globalDriverName && (
                      <div>
                        <span className="text-muted-foreground">Driver: </span>
                        <Badge variant="outline">{globalDriverName}</Badge>
                      </div>
                    )}
                    {globalDriverContact && (
                      <div>
                        <span className="text-muted-foreground">Contact: </span>
                        <Badge variant="outline">{globalDriverContact}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {Object.keys(lineItemUsers).length > 0 && (
                <div className="border-t pt-2">
                  <div className="mb-2 text-sm font-medium">Users by Item:</div>
                  <div className="space-y-2 text-xs">
                    {Object.entries(lineItemUsers)
                      .filter(([_, users]) => users.length > 0)
                      .map(([lotNo, users]) => (
                        <div key={lotNo} className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            Lot {lotNo}:
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

      {/* Recent Shipments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Shipment Orders
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecentShipments}
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
          {recentShipments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Sr No</TableHead>
                    <TableHead>Shipment No</TableHead>
                    <TableHead>Order No</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Lot No</TableHead>
                    <TableHead className="text-right">Picked Qty</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Truck No</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShipments.map((shipment, index) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {shipment.shipment_no}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {shipment.order_no}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {shipment.item_code}
                      </TableCell>
                      <TableCell>{shipment.item_description}</TableCell>
                      <TableCell>{shipment.lot_no}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            shipment.picked_qty > 0
                              ? 'font-medium text-green-600'
                              : ''
                          }
                        >
                          {shipment.picked_qty}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            shipment.remaining_qty > 0
                              ? 'font-medium text-orange-600'
                              : ''
                          }
                        >
                          {shipment.remaining_qty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {shipment.truck_no || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.driver_name || '-'}</TableCell>
                      <TableCell>
                        {getStatusBadge(shipment.picked_status)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {DateTime.fromISO(shipment.created_date)
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
              <p className="text-lg font-medium">No recent shipments found</p>
              <p className="mt-2 text-sm">
                Create a new shipment order to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassignment Confirmation Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Items Already Assigned
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                All line items in this shipment have already been assigned to
                users.
              </p>
              <p className="font-medium text-foreground">
                Do you want to reassign users to these items?
              </p>
              <p className="text-xs text-muted-foreground">
                Click "Reassign" to update the user assignments, or "Cancel" to
                go back.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReassignDialog(false);
                setShipmentNo('');
                setShipmentDetails([]);
                setSelectedUsers([]);
                setLineItemUsers({});
                setLineItemShipping({});
                setGlobalTruckNo('');
                setGlobalDriverName('');
                setGlobalDriverContact('');
                setIsFromAPI(true);
                shipmentNoRef.current?.focus();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowReassignDialog(false);
                toast.info('You can now reassign users to the items');
              }}
            >
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesShipmentOrder;
