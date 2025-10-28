'use client';
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/multi-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loading } from '@/components/loading';
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2 } from 'lucide-react';
import axios from '@/lib/axios-config';
import Cookies from 'js-cookie';
import { getUserID } from '@/utils/getFromSession';
import { getMenuList } from '@/lib/menu-list';
import TableSearch from '@/utils/tableSearch';

interface UserRole {
  id?: number;
  user_type: string;
  web_menu_access: string;
  hht_menu_access: string;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
}

interface ApiResponse {
  Status: string;
  Message: string;
}

const generateWebAccessOptions = () => {
  const menuList = getMenuList('/');
  const options: { label: string; value: string }[] = [];

  menuList.forEach(group => {
    group.menus.forEach(menu => {
      menu.submenus.forEach(submenu => {
        if (submenu.value) {
          options.push({ label: submenu.label, value: submenu.value });
        }
      });
    });
  });

  options.push({ label: 'Dashboard', value: '1' });

  return options;
};

const webAccessOptions = generateWebAccessOptions();

const hhtAccessOptions = [
  { label: 'Palletization', value: '1' },
  { label: 'Pallet Validation', value: '2' },
  { label: 'Pallet Split', value: '3' },
  { label: 'Pallet Split (Quantity)', value: '4' },
  { label: 'Box Merge', value: '5' },
  { label: 'Pallet Box Merge', value: '6' },
  { label: 'Box Pallet Removal', value: '7' },
  { label: 'Quality Movement', value: '8' },
  { label: 'Put Away', value: '9' },
  { label: 'Internal Movement', value: '10' },
  { label: 'Warehouse Unrestricted / Block', value: '11' },
  { label: 'WH Scrapping Release', value: '12' },
  { label: 'Material Picking', value: '13' },
  { label: 'Truck Loading and Dispatch (Pallet)', value: '14' },
  { label: 'Material Resorting Picking', value: '15' },
  { label: 'Material Resorting Return', value: '16' },
  { label: 'Stock Transfer Picking', value: '17' },
  { label: 'Confirm Receipt', value: '18' },
  { label: 'Stock Transfer Put Away', value: '19' },
  { label: 'Stock Adjustment', value: '20' },
  { label: 'Physical Stock Take', value: '21' },
  { label: 'Printer Setting', value: '22' },
  // { label: "Reprint", value: "23" },
  { label: 'Existing Stock Inward', value: '23' },
  { label: 'Existing Stock Dispatch', value: '24' },
];

const UserRoleMaster: React.FC = () => {
  const [userRole, setUserRole] = useState('');
  const [webAccess, setWebAccess] = useState<string[]>(['6_3']); // Set default to Change Password
  const [hhtAccess, setHhtAccess] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Search and pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const token = Cookies.get('token');
  const userRoleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  // Filter and pagination logic
  const filteredData = useMemo(() => {
    return userRoles.filter(role => {
      const searchableFields: (keyof UserRole)[] = [
        'user_type',
        'web_menu_access',
        'hht_menu_access',
        'created_by',
        'updated_by',
      ];
      return searchableFields.some(key => {
        const value = role[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [userRoles, searchTerm]);

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

  const fetchUserRoles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<UserRole[]>(
        '/api/admin/get-all-user-role'
      );
      setUserRoles(response.data);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to fetch user roles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userRole) {
      userRoleRef.current?.focus();
      toast.error('Please enter user role.');
      return;
    }
    if (webAccess.length === 0) {
      toast.error('Please select at least one WEB Access');
      return;
    }
    if (hhtAccess.length === 0) {
      toast.error('Please select at least one HHT Access');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post<ApiResponse>(
        '/api/admin/insert-user-role',
        {
          user_type: userRole,
          web_menu_access: webAccess.join(','),
          hht_menu_access: hhtAccess.join(','),
          created_by: getUserID(),
        }
      );

      if (response.data.Status === 'T') {
        toast.success(
          response.data.Message || 'User Role inserted successfully'
        );
        fetchUserRoles();
        handleCancel();
      } else if (response.data.Status === 'F') {
        toast.error(response.data.Message || 'Failed to save user role');
      }
    } catch (error) {
      console.error('Error saving user role:', error);
      toast.error('Failed to save user role.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    console.log('handleUpdate called', editingId);
    if (!editingId) {
      console.log('No editingId, returning');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.patch<ApiResponse>(
        '/api/admin/update-user-role',
        {
          id: editingId,
          user_type: userRole,
          web_menu_access: webAccess.join(','),
          hht_menu_access: hhtAccess.join(','),
          updated_by: getUserID(),
        }
      );

      if (response.data.Status === 'T') {
        toast.success(
          response.data.Message || 'User Role updated successfully'
        );
        fetchUserRoles();
        handleCancel();
      } else {
        toast.error(response.data.Message || 'Failed to update user role');
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update user role.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setUserRole('');
    setWebAccess([]);
    setHhtAccess([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (role: UserRole) => {
    setUserRole(role.user_type);
    setWebAccess(role.web_menu_access.split(','));
    setHhtAccess(role.hht_menu_access.split(','));
    setIsEditing(true);
    setEditingId(role.id || null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            User Role Master (* Fields Are Mandatory)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div>
              <Label
                htmlFor="userRole"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                User Role (*)
              </Label>
              <Input
                id="userRole"
                value={userRole}
                ref={userRoleRef}
                onChange={e => setUserRole(e.target.value)}
                className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
                disabled={isEditing}
                placeholder="Enter user role"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label className="mb-2 block text-sm font-medium text-foreground">
                  Allow Web Access (*)
                </Label>
                <MultiSelect
                  options={webAccessOptions}
                  onValueChange={(value: string[]) => setWebAccess(value)}
                  defaultValue={webAccess}
                  placeholder="Select Web Access options"
                  variant="inverted"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-foreground">
                  Allow HHT Access (*)
                </Label>
                <MultiSelect
                  options={hhtAccessOptions}
                  onValueChange={(value: string[]) => setHhtAccess(value)}
                  defaultValue={hhtAccess}
                  placeholder="Select HHT Access options"
                  variant="inverted"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
              <Button
                onClick={handleSave}
                disabled={isEditing || isSaving}
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
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
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
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
                className="w-full border-border hover:bg-accent sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
            User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select
                defaultValue="10"
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">entries</span>
            </div>
            <div className="w-full sm:w-auto">
              <TableSearch onSearch={handleSearch} />
            </div>
          </div>

          {Array.isArray(userRoles) && userRoles.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-md border border-border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-foreground">
                          Action
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          ID
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          User Role
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground sm:table-cell">
                          Web Menu Access
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground md:table-cell">
                          HHT Menu Access
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground lg:table-cell">
                          Created By
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground lg:table-cell">
                          Created Date
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground xl:table-cell">
                          Updated By
                        </TableHead>
                        <TableHead className="hidden font-semibold text-foreground xl:table-cell">
                          Updated Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((role, index) => (
                        <TableRow
                          key={role.id || index}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(role)}
                              className="h-8 px-2 py-1 text-xs"
                            >
                              Edit
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {role.id || index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {role.user_type}
                          </TableCell>
                          <TableCell
                            className="hidden max-w-32 truncate text-xs sm:table-cell"
                            title={role.web_menu_access}
                          >
                            {role.web_menu_access}
                          </TableCell>
                          <TableCell
                            className="hidden max-w-32 truncate text-xs md:table-cell"
                            title={role.hht_menu_access}
                          >
                            {role.hht_menu_access}
                          </TableCell>
                          <TableCell className="hidden text-sm lg:table-cell">
                            {role.created_by}
                          </TableCell>
                          <TableCell className="hidden text-sm lg:table-cell">
                            {new Date(role.created_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden text-sm xl:table-cell">
                            {role.updated_by || '-'}
                          </TableCell>
                          <TableCell className="hidden text-sm xl:table-cell">
                            {role.updated_date
                              ? new Date(role.updated_date).toLocaleDateString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Component */}
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
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'} border-border`}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        page => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className={`cursor-pointer border-border ${currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'} border-border`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          ) : isLoading ? (
            <Loading size="md" label="Loading user roles..." />
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No User Roles created yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default UserRoleMaster;
