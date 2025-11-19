'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loading } from '@/components/loading';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Loader2 } from 'lucide-react';
import CustomDropdown from '../CustomDropdown';
import Cookies from 'js-cookie';
import { getUserID } from '@/utils/getFromSession';
import TableSearch from '@/utils/tableSearch';
import { useRef } from 'react';
import axios from '@/lib/axios-config';

interface PlantOption {
  value: string;
  label: string;
}

interface UserData {
  User_ID: string;
  User_Name: string;
  User_Password: string;
  User_Role: string;
  Status: string;
  Locked: string;
  UpdatedBy: string;
  PassExpDays: number;
  LoginAttempt: number;
  Name: string;
  PlantCode: string;
  EmailId: string;
  MobileNo: string;
}

interface User {
  id: number;
  user_id: string;
  user_name: string;
  user_password: string;
  user_status: string;
  user_role: string;
  web_menu_access: string | null;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
  locked: string;
  login_attempt: number;
  last_pass_change: string;
  pass_exp_days: number;
  expired: string;
  name: string;
  plant_code: string;
  company_code: string | null;
  department: string | null;
  change_pass_flag: string;
  email: string;
  mobile_no: string;
  last_login: string | null;
  login_via: string | null;
  login_code: string | null;
  line_code: string;
  hht_menu_access: string | null;
}

const UserMaster: React.FC = () => {
  const token = Cookies.get('token');
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [userTypeOptions, setUserTypeOptions] = useState<PlantOption[]>([]);
  const [formData, setFormData] = useState<UserData>({
    User_ID: '',
    User_Name: '',
    User_Password: '',
    User_Role: '',
    Status: 'active',
    Locked: 'No',
    UpdatedBy: '',
    PassExpDays: 0,
    LoginAttempt: 0,
    Name: '',
    PlantCode: '',
    EmailId: '',
    MobileNo: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Search and pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const userNameRef = useRef<HTMLInputElement>(null);
  const userIdRef = useRef<HTMLInputElement>(null);
  const emailIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(true);

  useEffect(() => {
    fetchPlantNames();
    fetchUserTypeRoles();
    fetchUsers();
  }, []);

  // Filter and pagination logic
  const filteredData = useMemo(() => {
    return users.filter(user => {
      const searchableFields: (keyof User)[] = [
        'id',
        'user_id',
        'user_name',
        'user_role',
        'user_status',
        'plant_code',
        'email',
        'mobile_no',
        'created_by',
        'updated_by',
      ];
      return searchableFields.some(key => {
        const value = user[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [users, searchTerm]);

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

  const fetchPlantNames = async () => {
    try {
      const response = await axios.get(
        '/api/master/warehouse/get-all-plant-code'
      );
      setPlantOptions(
        response.data.map((item: { plant_code: string }) => ({
          value: item.plant_code,
          label: item.plant_code,
        }))
      );
    } catch (error: any) {
      console.error('Error fetching plant names:', error);
    }
  };

  const fetchUserTypeRoles = async () => {
    try {
      const response = await axios.get('/api/admin/get-all-user-type');
      setUserTypeOptions(
        response.data.map((item: { user_type: string }) => ({
          value: item.user_type,
          label: item.user_type,
        }))
      );
    } catch (error: any) {
      console.error('Error fetching User Types:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/all-user-master');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlantChange = (value: string) => {
    setFormData(prev => ({ ...prev, PlantCode: value }));
  };
  const handleUserTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, User_Role: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, Status: value }));
  };

  const handleLockStatus = (value: string) => {
    setFormData(prev => ({ ...prev, Locked: value }));
  };

  const handleSave = async () => {
    if (!formData.PlantCode) {
      toast.error('Please select plant');
      return;
    }
    if (!formData.User_Role) {
      toast.error('Please select User Role');
      return;
    }

    if (formData.User_Name === '') {
      toast.error('Please enter User Name');
      userNameRef.current?.focus();
      return;
    }
    if (formData.User_ID === '') {
      toast.error('Please enter User ID');
      userIdRef.current?.focus();
      return;
    }
    if (formData.EmailId === '') {
      toast.error('Please enter Email ID');
      emailIdRef.current?.focus();
      return;
    }
    if (formData.User_Password === '') {
      toast.error('Please enter Password');
      passwordRef.current?.focus();
      return;
    }
    if (confirmPassword === '') {
      toast.error('Please enter Confirm Password');
      confirmPasswordRef.current?.focus();
      return;
    }
    if (formData.User_Password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post('/api/admin/insert-user-master', {
        ...formData,
        User_Password: formData.User_Password,
        CreatedBy: getUserID(),
        isChangePassword,
      });

      const responseData = response.data;

      if (response.status === 200) {
        if (responseData.Status === 'F') {
          toast.error(responseData.Message);
          return;
        } else if (responseData.Status === 'T') {
          toast.success('User saved successfully');
          fetchUsers();
          resetForm();
        } else {
          toast.error('Unexpected response status');
        }
      } else {
        toast.error('Failed to save user');
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.PlantCode) {
      toast.error('Please select plant');
      return;
    }
    if (!formData.User_Role) {
      toast.error('Please select User Role');
      return;
    }
    if (formData.User_ID === '') {
      toast.error('Please enter User ID');
      userIdRef.current?.focus();
      return;
    }
    if (formData.User_Name === '') {
      toast.error('Please enter User Name');
      userNameRef.current?.focus();
      return;
    }
    if (formData.EmailId === '') {
      toast.error('Please enter Email ID');
      emailIdRef.current?.focus();
      return;
    }
    if (editingId === null) return;

    setIsUpdating(true);
    try {
      const response = await axios.patch('/api/admin/edit-user-master', {
        User_Name: formData.User_Name,
        User_Role: formData.User_Role,
        Status: formData.Status,
        User_ID: editingId,
        MobileNo: formData.MobileNo,
        EmailId: formData.EmailId,
        Locked: formData.Locked,
        PassExpDays: 0,
        UpdatedBy: getUserID(),
        PlantCode: formData.PlantCode,
      });

      const responseData = response.data;

      if (response.status === 200) {
        if (responseData.Status === 'F') {
          toast.error(responseData.Message);
        } else if (responseData.Status === 'T') {
          toast.success(responseData.Message);
          fetchUsers();
          resetForm();
        } else {
          toast.error('Unexpected response status');
        }
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      User_ID: user.user_id,
      User_Name: user.user_name,
      User_Password: '',
      User_Role: user.user_role,
      Status: user.user_status,
      Locked: user.locked,
      UpdatedBy: user.updated_by ?? '',
      PassExpDays: user.pass_exp_days,
      LoginAttempt: user.login_attempt,
      Name: user.name,
      PlantCode: user.plant_code,
      EmailId: user.email,
      MobileNo: user.mobile_no,
    });
    setIsEditing(true);
    setEditingId(user.id);
  };

  const resetForm = () => {
    setFormData({
      User_ID: '',
      User_Name: '',
      User_Password: '',
      User_Role: '',
      Status: 'active',
      Locked: 'No',
      UpdatedBy: '',
      PassExpDays: 90,
      LoginAttempt: 0,
      Name: '',
      PlantCode: '',
      EmailId: '',
      MobileNo: '',
    });
    setConfirmPassword('');
    setIsEditing(false);
    setEditingId(null);
    setIsChangePassword(true);
  };
  return (
    <div
      className="w-full"
      style={
        {
          '--grid-cols-mobile': '1',
          '--grid-cols-tablet': '3',
          '--grid-cols-desktop': '4',
          '--grid-cols-wide': '5',
        } as React.CSSProperties
      }
    >
      <Card className="mx-auto mt-5 w-full">
        <CardHeader>
          <CardTitle>
            User Master{' '}
            <span className="text-sm font-normal text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(var(--grid-cols-mobile), 1fr)',
              }}
            >
              <style jsx>{`
                @media (min-width: 768px) {
                  .grid {
                    grid-template-columns: repeat(
                      var(--grid-cols-tablet),
                      1fr
                    ) !important;
                  }
                }
                @media (min-width: 1024px) {
                  .grid {
                    grid-template-columns: repeat(
                      var(--grid-cols-desktop),
                      1fr
                    ) !important;
                  }
                }
                @media (min-width: 1280px) {
                  .grid {
                    grid-template-columns: repeat(
                      var(--grid-cols-wide),
                      1fr
                    ) !important;
                  }
                }
              `}</style>
              <div className="space-y-2">
                <Label htmlFor="PlantCode">Plant *</Label>
                <CustomDropdown
                  options={plantOptions}
                  value={formData.PlantCode}
                  onValueChange={handlePlantChange}
                  placeholder="Select plant code"
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
                />
                <Label className="mt-1 block text-sm text-muted-foreground">
                  Only active plants will be visible here
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Role">User Type/Role *</Label>
                <CustomDropdown
                  options={userTypeOptions}
                  value={formData.User_Role}
                  onValueChange={handleUserTypeChange}
                  placeholder="Select User Type"
                  searchPlaceholder="Search User Type..."
                  emptyText="No user type found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Name">User Name *</Label>
                <Input
                  id="User_Name"
                  name="User_Name"
                  value={formData.User_Name}
                  ref={userNameRef}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_ID">User ID *</Label>
                <Input
                  id="User_ID"
                  name="User_ID"
                  value={formData.User_ID}
                  ref={userIdRef}
                  onChange={handleInputChange}
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="EmailId">Email ID *</Label>
                <Input
                  id="EmailId"
                  name="EmailId"
                  value={formData.EmailId}
                  ref={emailIdRef}
                  onChange={handleInputChange}
                  required
                  type="email"
                />
              </div>
              <div className="relative space-y-2">
                <Label htmlFor="User_Password">Password *</Label>
                <div className="relative">
                  <Input
                    id="User_Password"
                    name="User_Password"
                    disabled={isEditing}
                    ref={passwordRef}
                    value={formData.User_Password}
                    onChange={handleInputChange}
                    required
                    type={showPassword ? 'text' : 'password'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
              <div className="relative space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    value={confirmPassword}
                    disabled={isEditing}
                    ref={confirmPasswordRef}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="Locked">Locked</Label>
                <Select
                  value={formData.Locked}
                  onValueChange={handleLockStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Lock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="PassExpDays">Password Exp Days *</Label>
                <Input id="PassExpDays" name="PassExpDays" value={formData.PassExpDays} onChange={handleInputChange} required type="number" />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="Status">Status</Label>
                <Select
                  value={formData.Status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Deactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="MobileNo">Mobile No</Label>
                <Input
                  id="MobileNo"
                  name="MobileNo"
                  value={formData.MobileNo}
                  onChange={handleInputChange}
                  type="tel"
                />
              </div>
            </div>

            {/* Change Password on First Login Option - Only show when creating new user */}
            {!isEditing && (
              <div className="mt-6 rounded-lg border border-muted bg-muted/30 p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="isChangePassword"
                    checked={isChangePassword}
                    onCheckedChange={checked =>
                      setIsChangePassword(checked === true)
                    }
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="isChangePassword"
                      className="cursor-pointer text-sm font-medium leading-tight"
                    >
                      Force password change on first login
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, the user will be required to change their
                      password when they first log in. (Recommended for
                      security)
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isEditing || isSaving}
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
                type="button"
                onClick={handleUpdate}
                disabled={!isEditing || isUpdating}
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
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mx-auto mt-10 w-full">
        <CardHeader>
          <CardTitle className="text-center">List of all users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Show</span>
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
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <TableSearch onSearch={handleSearch} />
            </div>
          </div>

          {Array.isArray(users) && users.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">
                      Action
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      User ID
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      User Name
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Status
                    </TableHead>
                    {/* <TableHead>Web menu Access</TableHead>
                <TableHead>HHT menu Access</TableHead> */}
                    <TableHead className="font-semibold text-foreground">
                      Locked Status
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Plant Code
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Email ID
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Mobile No
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell>{user.user_id}</TableCell>
                      <TableCell>{user.user_name}</TableCell>
                      <TableCell>{user.user_role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.user_status?.toLowerCase() === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            user.user_status?.toLowerCase() === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }
                        >
                          {user.user_status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>{user.web_menu_access}</TableCell>
                    <TableCell>{user.hht_menu_access}</TableCell> */}
                      <TableCell>{user.locked}</TableCell>
                      <TableCell>{user.plant_code}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.mobile_no}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Component */}
              <div className="md:text-md mt-4 flex items-center justify-between text-sm">
                <div>
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
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        page => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
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
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          ) : isLoading ? (
            <Loading size="md" label="Loading users..." />
          ) : (
            <p className="text-center">No users created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMaster;
