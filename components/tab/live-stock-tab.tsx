'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Package,
  MapPin,
  Archive,
  Hash,
  FileSpreadsheet,
  Info,
  Download,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TableSearch from '@/utils/tableSearch';
import Cookies from 'js-cookie';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CustomDropdown from '@/components/CustomDropdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';

interface LiveStockItem {
  item_code: string;
  item_description: string;
  lot_no: string;
  warehouse_code: string;
  put_location: string;
  Available_Stock: number;
  cleanItemCode?: string; // Store item code for display
}

interface DropdownOption {
  value: string;
  label: string;
}

const LiveStockTab: React.FC = () => {
  const [stockData, setStockData] = useState<LiveStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<LiveStockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tableSearchTerm, setTableSearchTerm] = useState('');

  const [uniqueOptions, setUniqueOptions] = useState<{
    items: DropdownOption[];
    lots: string[];
    warehouses: string[];
  }>({
    items: [],
    lots: [],
    warehouses: [],
  });
  useEffect(() => {
    fetchLiveStockData();
  }, []);

  useEffect(() => {
    // Extract unique values for filtering
    if (stockData.length > 0) {
      const items = Array.from(new Set(stockData.map(item => item.item_code)));
      const lots = Array.from(new Set(stockData.map(item => item.lot_no)));
      const warehouses = Array.from(
        new Set(stockData.map(item => item.warehouse_code))
      );

      setUniqueOptions({
        items: items.map(itemCode => {
          // Get the item code without leading zeros
          const cleanItemCode = itemCode.replace(/^0+/, '');
          // Find the corresponding item description
          const itemDesc =
            stockData.find(item => item.item_code === itemCode)
              ?.item_description || '';
          return {
            value: itemCode,
            label: `${cleanItemCode} - ${itemDesc}`,
          };
        }),
        lots,
        warehouses,
      });
    }
  }, [stockData]);

  const fetchLiveStockData = async () => {
    setIsLoading(true);

    try {
      const token = Cookies.get('token');
      const response = await fetch(`/api/reports/fg-live-stock`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch live stock data');
      }

      const data = await response.json();

      const processedData = data.map((item: LiveStockItem) => ({
        ...item,
        // Store original item_code but use clean version for display
        cleanItemCode: item.item_code.replace(/^0+/, ''),
      }));

      setStockData(processedData);
      setFilteredData(processedData);
    } catch (error) {
      console.error('Error fetching live stock data:', error);
      toast.error('Failed to fetch live stock data');
    } finally {
      setIsLoading(false);
    }
  };

  // Optimized filtering with useMemo
  const filteredDataForCards = useMemo(() => {
    let results = [...stockData];

    // Apply search term filter
    if (searchTerm) {
      results = results.filter(
        item =>
          item.item_description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply specific filters
    if (filterOption !== 'all' && filterValue) {
      switch (filterOption) {
        case 'item':
          results = results.filter(item => item.item_code === filterValue);
          break;
        case 'lot':
          results = results.filter(item => item.lot_no === filterValue);
          break;
        case 'warehouse':
          results = results.filter(item => item.warehouse_code === filterValue);
          break;
      }
    }

    return results;
  }, [stockData, searchTerm, filterOption, filterValue]);

  // Separate filtered data for table with search
  const filteredDataForTable = useMemo(() => {
    let results = [...filteredDataForCards];

    // Apply table search term filter
    if (tableSearchTerm) {
      results = results.filter(
        item =>
          item.item_description
            .toLowerCase()
            .includes(tableSearchTerm.toLowerCase()) ||
          item.item_code
            .toLowerCase()
            .includes(tableSearchTerm.toLowerCase()) ||
          item.lot_no.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
          item.warehouse_code
            .toLowerCase()
            .includes(tableSearchTerm.toLowerCase()) ||
          item.put_location
            .toLowerCase()
            .includes(tableSearchTerm.toLowerCase())
      );
    }

    return results;
  }, [filteredDataForCards, tableSearchTerm]);

  // Pagination for table
  const paginatedTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDataForTable.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDataForTable, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredDataForTable.length / itemsPerPage),
    [filteredDataForTable, itemsPerPage]
  );

  // Pagination callbacks
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handleTableSearch = useCallback((term: string) => {
    setTableSearchTerm(term.trim());
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Group data by warehouse for cards
  const groupedByWarehouse = useMemo(() => {
    return filteredDataForCards.reduce(
      (acc, item) => {
        if (!acc[item.warehouse_code]) {
          acc[item.warehouse_code] = [];
        }
        acc[item.warehouse_code].push(item);
        return acc;
      },
      {} as Record<string, LiveStockItem[]>
    );
  }, [filteredDataForCards]);

  // Calculate stats for each warehouse
  const getWarehouseStats = (items: LiveStockItem[]) => {
    const totalStock = items.reduce(
      (sum, item) => sum + item.Available_Stock,
      0
    );
    const uniqueItems = new Set(items.map(item => item.item_code)).size;
    const uniqueLots = new Set(items.map(item => item.lot_no)).size;
    const uniqueLocations = new Set(items.map(item => item.put_location)).size;

    return {
      totalStock,
      uniqueItems,
      uniqueLots,
      uniqueLocations,
      itemCount: items.length,
    };
  };

  // Calculate overall stats with useMemo optimization
  const getTotalStats = useMemo(() => {
    const totalStock = filteredDataForCards.reduce(
      (sum, item) => sum + item.Available_Stock,
      0
    );
    const uniqueItems = new Set(
      filteredDataForCards.map(item => item.item_code)
    ).size;
    const uniqueLots = new Set(filteredDataForCards.map(item => item.lot_no))
      .size;
    const uniqueWarehouses = new Set(
      filteredDataForCards.map(item => item.warehouse_code)
    ).size;
    const uniqueLocations = new Set(
      filteredDataForCards.map(item => item.put_location)
    ).size;

    return {
      totalStock,
      uniqueItems,
      uniqueLots,
      uniqueWarehouses,
      uniqueLocations,
      itemCount: filteredDataForCards.length,
    };
  }, [filteredDataForCards]);

  const exportToCSV = useCallback(async () => {
    if (filteredDataForTable.length === 0) {
      toast.error('No data to export');
      return;
    }

    const toastId = toast.loading('Initializing CSV export...', {
      description: `Processing ${filteredDataForTable.length.toLocaleString()} records`,
    });

    try {
      setIsExporting(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      toast.loading('Processing data...', {
        id: toastId,
        description: 'Building CSV content',
      });

      // CSV headers
      const headers = [
        'Item Code',
        'Description',
        'Lot Number',
        'Warehouse Code',
        'Put Location',
        'Available Quantity',
      ];

      // Escape CSV values properly (handle commas, quotes, newlines, and special chars)
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return 'NA';
        const stringValue = String(value);
        // Always wrap in quotes for safety and escape internal quotes
        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      // Build CSV content in chunks for better performance
      const CHUNK_SIZE = 5000;
      let csvContent = headers.join(',') + '\n';

      for (let i = 0; i < filteredDataForTable.length; i += CHUNK_SIZE) {
        const chunk = filteredDataForTable.slice(i, i + CHUNK_SIZE);

        const csvChunk = chunk
          .map(item =>
            [
              escapeCSV(item.item_code.replace(/^0+/, '')),
              escapeCSV(item.item_description),
              escapeCSV(item.lot_no),
              escapeCSV(item.warehouse_code),
              escapeCSV(item.put_location),
              escapeCSV(item.Available_Stock),
            ].join(',')
          )
          .join('\n');

        csvContent += csvChunk + '\n';

        const progress = Math.round(
          ((i + CHUNK_SIZE) / filteredDataForTable.length) * 100
        );
        toast.loading(`Processing... ${Math.min(progress, 100)}%`, {
          id: toastId,
          description: `${Math.min(i + CHUNK_SIZE, filteredDataForTable.length).toLocaleString()} of ${filteredDataForTable.length.toLocaleString()} rows`,
        });

        // Allow UI to breathe every 10k rows
        if (i > 0 && i % (CHUNK_SIZE * 2) === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      toast.loading('Generating file...', {
        id: toastId,
        description: 'Creating CSV file',
      });

      // Create and download CSV with BOM for proper Excel compatibility
      const BOM = '\uFEFF'; // UTF-8 BOM for Excel
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `live-stock-${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV export completed!', {
        id: toastId,
        description: `${filteredDataForTable.length.toLocaleString()} rows exported • No data truncation`,
      });
    } catch (error) {
      console.error('CSV export failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Export failed', {
        id: toastId,
        description: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  }, [filteredDataForTable]);

  const exportToExcel = useCallback(async () => {
    if (filteredDataForTable.length === 0) {
      toast.error('No data to export');
      return;
    }

    const toastId = toast.loading('Initializing Excel export...', {
      description: `Processing ${filteredDataForTable.length.toLocaleString()} records`,
    });

    try {
      setIsExporting(true);

      // Give UI a moment to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Dynamic import with error handling
      toast.loading('Loading Excel library...', {
        id: toastId,
        description: 'Please wait...',
      });

      const XLSX = await import('xlsx');

      toast.loading('Processing data...', {
        id: toastId,
        description: `Transforming ${filteredDataForTable.length.toLocaleString()} rows`,
      });

      // Process data in chunks to avoid blocking UI for large datasets
      const CHUNK_SIZE = 1000;
      const excelData: any[] = [];

      for (let i = 0; i < filteredDataForTable.length; i += CHUNK_SIZE) {
        const chunk = filteredDataForTable.slice(i, i + CHUNK_SIZE);

        const processedChunk = chunk.map(item => {
          // Excel has a 32,767 character limit per cell - truncate long text fields
          const truncateText = (
            text: string | null | undefined,
            maxLength = 32700
          ): string => {
            if (!text) return 'NA';
            if (typeof text === 'string' && text.length > maxLength) {
              return text.substring(0, maxLength) + '...';
            }
            return text;
          };

          return {
            'Item Code': item.item_code.replace(/^0+/, ''),
            Description: truncateText(item.item_description),
            'Lot Number': item.lot_no,
            'Warehouse Code': item.warehouse_code,
            'Put Location': item.put_location,
            'Available Quantity': item.Available_Stock,
          };
        });

        excelData.push(...processedChunk);

        // Update progress
        const progress = Math.min(
          100,
          Math.round(((i + CHUNK_SIZE) / filteredDataForTable.length) * 50)
        );
        toast.loading(`Processing data... ${progress}%`, {
          id: toastId,
          description: `${Math.min(i + CHUNK_SIZE, filteredDataForTable.length).toLocaleString()} of ${filteredDataForTable.length.toLocaleString()} rows`,
        });

        // Allow UI to breathe
        if (i > 0 && i % (CHUNK_SIZE * 5) === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      toast.loading('Creating workbook...', {
        id: toastId,
        description: 'Building Excel structure',
      });

      // Create workbook with optimized settings
      const workbook = XLSX.utils.book_new();

      // Use aoa_to_sheet for better performance with large datasets
      const headers = [
        'Item Code',
        'Description',
        'Lot Number',
        'Warehouse Code',
        'Put Location',
        'Available Quantity',
      ];

      const dataArray = [
        headers,
        ...excelData.map(row => [
          row['Item Code'],
          row['Description'],
          row['Lot Number'],
          row['Warehouse Code'],
          row['Put Location'],
          row['Available Quantity'],
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(dataArray);

      // Set column widths for better formatting
      worksheet['!cols'] = [
        { wch: 15 }, // Item Code
        { wch: 40 }, // Description
        { wch: 15 }, // Lot Number
        { wch: 15 }, // Warehouse Code
        { wch: 15 }, // Put Location
        { wch: 18 }, // Available Quantity
      ];

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Live Stock Data');

      toast.loading('Generating file...', {
        id: toastId,
        description: 'Creating Excel file',
      });

      // Generate Excel file with compression
      const fileName = `live-stock-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Use writeFile with bookType specified for better compatibility
      XLSX.writeFile(workbook, fileName, {
        bookType: 'xlsx',
        type: 'binary',
        compression: true,
      });

      toast.success('Export completed successfully!', {
        id: toastId,
        description: `${filteredDataForTable.length.toLocaleString()} rows exported to ${fileName}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Export failed', {
        id: toastId,
        description: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  }, [filteredDataForTable]);

  // Helper function to format numbers in Indian style
  const formatIndianNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };

  // Helper function to get readable format (lakhs/crores)
  const getReadableFormat = (num: number): string => {
    if (num >= 10000000) {
      // 1 crore
      return `${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      // 1 lakh
      return `${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) {
      // 1 thousand
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <Skeleton className="h-12 w-full sm:w-64" />
          <Skeleton className="h-12 w-full sm:w-48" />
          <Skeleton className="h-12 w-full sm:w-48" />
        </div>

        <Skeleton className="mb-6 h-24 w-full" />

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-5">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-full space-y-6">
        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="h-10 border-slate-200 pl-10 focus:border-chart-1 dark:border-slate-700"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Select
              value={filterOption}
              onValueChange={value => {
                setFilterOption(value);
                setFilterValue('');
              }}
            >
              <SelectTrigger className="h-10 w-full border-slate-200 dark:border-slate-700 sm:w-44">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter Options</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="item">Item</SelectItem>
                  <SelectItem value="lot">Lot</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {filterOption === 'item' && (
              <CustomDropdown
                options={uniqueOptions.items}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Item"
                searchPlaceholder="Search items..."
                emptyText="No items available"
                disabled={false}
              />
            )}

            {filterOption === 'lot' && (
              <CustomDropdown
                options={uniqueOptions.lots.map(lot => ({
                  value: lot,
                  label: lot,
                }))}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Lot"
                searchPlaceholder="Search lots..."
                emptyText="No lots available"
                disabled={false}
              />
            )}

            {filterOption === 'warehouse' && (
              <CustomDropdown
                options={uniqueOptions.warehouses.map(warehouse => ({
                  value: warehouse,
                  label: warehouse,
                }))}
                value={filterValue}
                onValueChange={setFilterValue}
                placeholder="Select Warehouse"
                searchPlaceholder="Search warehouses..."
                emptyText="No warehouses available"
                disabled={false}
              />
            )}
          </div>
        </div>

        {/* Summary Card */}
        <Card className="gradient-summary border-slate-200 shadow-sm dark:border-slate-600">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                <Package className="h-5 w-5 text-chart-1" />
                Live Stock Summary
              </CardTitle>
              <div className="flex items-center gap-2 rounded-full border border-chart-1/20 bg-chart-1/5 px-3 py-1.5 text-xs text-slate-500 dark:border-chart-1/30 dark:bg-chart-1/10 dark:text-slate-400">
                <Info className="h-3 w-3" />
                <span>
                  K = Thousand, L = Lakh, Cr = Crore • Hover for exact values
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex min-w-0 cursor-help flex-col items-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <Package className="mb-2 h-5 w-5 flex-shrink-0 text-chart-1" />
                    <span className="mb-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      Total Stock
                    </span>
                    <span className="break-all text-center text-sm font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-base">
                      {getReadableFormat(getTotalStats.totalStock)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">
                      {formatIndianNumber(getTotalStats.totalStock)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Exact stock count
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex min-w-0 cursor-help flex-col items-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <Archive className="mb-2 h-5 w-5 flex-shrink-0 text-chart-2" />
                    <span className="mb-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      Items
                    </span>
                    <span className="break-all text-center text-sm font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-base">
                      {getReadableFormat(getTotalStats.uniqueItems)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">
                      {formatIndianNumber(getTotalStats.uniqueItems)} Items
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Total unique items
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex min-w-0 cursor-help flex-col items-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <Hash className="mb-2 h-5 w-5 flex-shrink-0 text-chart-3" />
                    <span className="mb-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      Lots
                    </span>
                    <span className="break-all text-center text-sm font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-base">
                      {getReadableFormat(getTotalStats.uniqueLots)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">
                      {formatIndianNumber(getTotalStats.uniqueLots)} Lots
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Total unique lots
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex min-w-0 cursor-help flex-col items-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <MapPin className="mb-2 h-5 w-5 flex-shrink-0 text-chart-4" />
                    <span className="mb-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      Warehouses
                    </span>
                    <span className="break-all text-center text-sm font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-base">
                      {getReadableFormat(getTotalStats.uniqueWarehouses)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">
                      {formatIndianNumber(getTotalStats.uniqueWarehouses)}{' '}
                      Warehouses
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Total warehouses
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex min-w-0 cursor-help flex-col items-center rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <MapPin className="mb-2 h-5 w-5 flex-shrink-0 text-chart-5" />
                    <span className="mb-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      Put Locations
                    </span>
                    <span className="break-all text-center text-sm font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-base">
                      {getReadableFormat(getTotalStats.uniqueLocations)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">
                      {formatIndianNumber(getTotalStats.uniqueLocations)} Put
                      Locations
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Total put locations
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(groupedByWarehouse).map(([warehouse, items]) => {
            const stats = getWarehouseStats(items);

            return (
              <Card
                key={warehouse}
                className="border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <CardHeader className="gradient-warehouse pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
                      {warehouse}
                    </CardTitle>
                    <span className="flex-shrink-0 rounded-full bg-chart-1/10 px-3 py-1 text-xs font-medium text-chart-1 dark:bg-chart-1/20 dark:text-chart-1">
                      {stats.itemCount} items
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="min-w-0 cursor-help rounded border bg-white p-2 text-center dark:bg-slate-800">
                          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                            Stock
                          </div>
                          <div className="break-all text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                            {getReadableFormat(stats.totalStock)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">
                            {formatIndianNumber(stats.totalStock)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Exact stock count
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="min-w-0 cursor-help rounded border bg-white p-2 text-center dark:bg-slate-800">
                          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                            Items
                          </div>
                          <div className="break-all text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                            {getReadableFormat(stats.uniqueItems)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">
                            {formatIndianNumber(stats.uniqueItems)} Items
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Unique items
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="min-w-0 cursor-help rounded border bg-white p-2 text-center dark:bg-slate-800">
                          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                            Lots
                          </div>
                          <div className="break-all text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                            {getReadableFormat(stats.uniqueLots)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">
                            {formatIndianNumber(stats.uniqueLots)} Lots
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Unique lots
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="min-w-0 cursor-help rounded border bg-white p-2 text-center dark:bg-slate-800">
                          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                            Locations
                          </div>
                          <div className="break-all text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                            {getReadableFormat(stats.uniqueLocations)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">
                            {formatIndianNumber(stats.uniqueLocations)}{' '}
                            Locations
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Bin positions
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-slate-500 max-h-72 overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 border-b bg-white dark:bg-slate-800">
                        <TableRow>
                          <TableHead className="px-3 py-2 text-xs font-medium">
                            Item
                          </TableHead>
                          <TableHead className="px-3 py-2 text-xs font-medium">
                            Lot
                          </TableHead>
                          <TableHead className="px-3 py-2 text-xs font-medium">
                            Location
                          </TableHead>
                          <TableHead className="px-3 py-2 text-right text-xs font-medium">
                            Stock
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, idx) => (
                          <TableRow
                            key={`${item.item_code}-${item.lot_no}-${item.put_location}-${idx}`}
                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                          >
                            <TableCell
                              className="px-3 py-2 text-sm font-medium"
                              title={item.item_description}
                            >
                              {item.item_code.replace(/^0+/, '')}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm">
                              {item.lot_no}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm">
                              {item.put_location}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-right text-sm font-semibold text-chart-1">
                              {item.Available_Stock.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Material Details Table */}
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                <FileSpreadsheet className="h-5 w-5 text-chart-2" />
                Material Details
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-chart-2 text-chart-2 transition-colors hover:bg-chart-2 hover:text-primary"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-chart-2 border-t-transparent" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export
                        <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={exportToCSV}
                    disabled={isExporting}
                    className="cursor-pointer"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-chart-1" />
                    <div className="flex flex-col">
                      <span className="font-medium">Export to CSV</span>
                      <span className="text-xs text-muted-foreground">
                        No size limit • Full data
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={exportToExcel}
                    disabled={isExporting}
                    className="cursor-pointer"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-chart-2" />
                    <div className="flex flex-col">
                      <span className="font-medium">Export to Excel</span>
                      <span className="text-xs text-muted-foreground">
                        Long text truncated
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Show
                </span>
                <Select
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
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  entries
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TableSearch onSearch={handleTableSearch} />
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-700">
                  <TableRow>
                    <TableHead className="px-4 py-3 text-sm font-medium">
                      Item Code
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium">
                      Description
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium">
                      Lot Number
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium">
                      Warehouse
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium">
                      Put Location
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-sm font-medium">
                      Available Stock
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTableData.length > 0 ? (
                    paginatedTableData.map((item, idx) => (
                      <TableRow
                        key={`${item.item_code}-${item.lot_no}-${item.put_location}-${idx}`}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      >
                        <TableCell className="px-4 py-2.5 text-sm font-medium">
                          {item.item_code.replace(/^0+/, '')}
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate px-4 py-2.5 text-sm"
                          title={item.item_description}
                        >
                          {item.item_description}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-sm">
                          {item.lot_no}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-sm">
                          {item.warehouse_code}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-sm">
                          {item.put_location}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right text-sm font-semibold text-chart-1">
                          {item.Available_Stock.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-slate-500 dark:text-slate-400"
                      >
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t p-4 text-sm">
              <div className="text-slate-600 dark:text-slate-400">
                {filteredDataForTable.length > 0
                  ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredDataForTable.length)} of ${filteredDataForTable.length} entries`
                  : 'No entries to show'}
              </div>
              {filteredDataForTable.length > 0 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
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
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default LiveStockTab;
