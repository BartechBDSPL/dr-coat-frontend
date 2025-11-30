'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { Loader2 } from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface GRNDetails {
  grn_no: string;
  vendor_code: string;
  vendor_name: string;
  po_no: string;
  po_date: string;
  grn_done_by: string;
  type: string;
  item_code: string;
  item_description: string;
  lot_no: string;
  location_code: string;
  quantity: number;
  packing_detail: string;
  item_category_code: string;
  uom: string;
  product_group_code: string;
  loctain_code: string;
  mfg_date: string;
  exp_date: string;
  created_by: string;
  created_date: string;
  updated_by: string | null;
  updated_date: string | null;
  printed_label: number | null;
  remaining_label: number | null;
}

interface TableItem {
  item_code: string;
  item_description: string;
  lot_no: string;
  location_code: string;
  quantity: number;
  uom: string;
  printQty: number;
}

const RMLabelPrintingGRN: React.FC = () => {
  const [grnNo, setGrnNo] = useState('');
  const [grnDetails, setGrnDetails] = useState<GRNDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tableItems, setTableItems] = useState<TableItem[]>([]);
  const grnNoRef = useRef<HTMLInputElement>(null);
  const token = Cookies.get('token');

  useEffect(() => {
    grnNoRef.current?.focus();
  }, []);

  const handleGetDetails = async () => {
    if (!grnNo.trim()) {
      toast.error('Please enter GRN number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/transactions/grn/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grn_no: grnNo.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch GRN details');
      }

      const data: GRNDetails = await response.json();
      setGrnDetails(data);

      setTableItems([
        {
          item_code: data.item_code,
          item_description: data.item_description,
          lot_no: data.lot_no,
          location_code: data.location_code,
          quantity: data.quantity,
          uom: data.uom,
          printQty: 0,
        },
      ]);

      toast.success('GRN details fetched successfully');
    } catch (error: any) {
      console.error('Error fetching GRN details:', error);
      toast.error(error.message || 'Failed to fetch GRN details');
      setGrnDetails(null);
      setTableItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintQtyChange = (index: number, value: string) => {
    const qty = Number(value);
    const maxQty = tableItems[index].quantity;

    if (qty < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    if (qty > maxQty) {
      toast.error(`Quantity cannot be greater than ${maxQty}`);
      return;
    }

    const updatedItems = [...tableItems];
    updatedItems[index].printQty = qty;
    setTableItems(updatedItems);
  };

  const handleReset = () => {
    setGrnNo('');
    setGrnDetails(null);
    setTableItems([]);
    grnNoRef.current?.focus();
  };

  return (
    <div className="mt-5 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GRN Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="grnNo">
                GRN No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="grnNo"
                ref={grnNoRef}
                value={grnNo}
                onChange={e => setGrnNo(e.target.value)}
                placeholder="Enter GRN Number"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleGetDetails}
                disabled={!grnNo.trim() || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Details
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {grnDetails && (
        <Card>
          <CardHeader>
            <CardTitle>GRN Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="grn_no">GRN No</Label>
                <Input id="grn_no" value={grnDetails.grn_no} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor_code">Vendor Code</Label>
                <Input
                  id="vendor_code"
                  value={grnDetails.vendor_code}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor Name</Label>
                <Input
                  id="vendor_name"
                  value={grnDetails.vendor_name}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po_no">PO No</Label>
                <Input id="po_no" value={grnDetails.po_no} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po_date">PO Date</Label>
                <Input id="po_date" value={grnDetails.po_date} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grn_done_by">GRN Done By</Label>
                <Input
                  id="grn_done_by"
                  value={grnDetails.grn_done_by}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" value={grnDetails.type} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tableItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Lot No</TableHead>
                    <TableHead>Location Code</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Print Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.item_code}</TableCell>
                      <TableCell>{item.item_description}</TableCell>
                      <TableCell>{item.lot_no || '-'}</TableCell>
                      <TableCell>{item.location_code}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.printQty}
                          onChange={e =>
                            handlePrintQtyChange(index, e.target.value)
                          }
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RMLabelPrintingGRN;
