'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  TrendingUp,
  Package,
  Layers,
  Truck,
  ClipboardList,
  Search,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios-config';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ClippedAreaChart } from '@/components/ui/clipped-area-chart';
import { RoundedPieChart } from '@/components/ui/rounded-pie-chart';
import { GlowingLineChart } from '@/components/ui/glowing-line';
import { GlowingBarChart } from '@/components/ui/glowing-bar-chart';

interface DashboardDetail {
  Parameter: string;
  Count: number;
}

interface PrintingMonthly {
  printing_month_name: string;
  printing_count: number;
}

interface TopModel {
  item_description: string;
  SerialNoCount: number;
}

interface StockTransferVsShipment {
  month_name: string;
  StockTransferCount: number;
  ShipmentCount: number;
}

interface PutVsPick {
  MonthName: string;
  TotalPickQty: number;
  TotalPutQty: number;
}

interface ChartData {
  printingCounts: PrintingMonthly[];
  topModels: TopModel[];
  reworkCounts: StockTransferVsShipment[];
  putVsPick: PutVsPick[];
}

const MetricSkeleton = () => (
  <Card className="relative overflow-hidden">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-10 rounded-xl" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-9 w-24" />
      <Skeleton className="mt-2 h-3 w-40" />
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Card className="relative overflow-hidden">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-2 h-4 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </CardContent>
  </Card>
);

const OverviewTab: React.FC = () => {
  const [fromDate, setFromDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [toDate, setToDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [dashboardDetails, setDashboardDetails] = useState<DashboardDetail[]>(
    []
  );
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const token = Cookies.get('token');

  useEffect(() => {
    fetchDashboardDetails();
    fetchChartData();
  }, []);

  const fetchDashboardDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        '/api/dashboard/details',
        {
          FromDate: format(fromDate, 'yyyy-MM-dd'),
          ToDate: format(toDate, 'yyyy-MM-dd'),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboardDetails(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
      toast.warning('Failed to fetch dashboard details');
      setDashboardDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    setIsLoadingCharts(true);
    try {
      const response = await axiosInstance.get(
        '/api/dashboard/printing-stock-transfer-vs-shipment',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setChartData(response.data);
      } else {
        toast.warning('Failed to fetch chart data');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.warning('Failed to fetch chart data');
    } finally {
      setIsLoadingCharts(false);
    }
  };

  const handleSearch = () => {
    fetchDashboardDetails();
  };

  const handleClear = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    setFromDate(lastMonth);
    setToDate(today);
  };

  const getMetricIcon = (parameter: string) => {
    const lowerParam = parameter.toLowerCase();
    if (lowerParam.includes('serialno') || lowerParam.includes('serial')) {
      return <Package className="h-5 w-5" />;
    }
    if (lowerParam.includes('item name') || lowerParam.includes('distinct')) {
      return <Layers className="h-5 w-5" />;
    }
    if (lowerParam.includes('shipment') || lowerParam.includes('pending')) {
      return <Truck className="h-5 w-5" />;
    }
    if (lowerParam.includes('count')) {
      return <ClipboardList className="h-5 w-5" />;
    }
    return <TrendingUp className="h-5 w-5" />;
  };

  const getMetricStyle = (index: number) => {
    const styles = [
      {
        gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        border: 'border-emerald-500/20',
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
        border: 'border-blue-500/20',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-600 dark:text-blue-400',
      },
      {
        gradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
        border: 'border-violet-500/20',
        iconBg: 'bg-violet-500/10',
        iconColor: 'text-violet-600 dark:text-violet-400',
      },
      {
        gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
        border: 'border-amber-500/20',
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-600 dark:text-amber-400',
      },
    ];
    return styles[index % styles.length];
  };

  const DatePicker: React.FC<{
    date: Date;
    onChange: (date: Date) => void;
    label: string;
  }> = ({ date, onChange, label }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={date => date && onChange(date)}
          disableFutureDates={true}
          month={date || new Date()}
          onMonthChange={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-border/50 bg-gradient-to-r from-card via-card to-muted/20 shadow-sm">
        <CardHeader className="border-b border-border/30 bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Filter by Date Range
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                From Date
              </label>
              <DatePicker
                date={fromDate}
                onChange={setFromDate}
                label="Select from date"
              />
            </div>
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                To Date
              </label>
              <DatePicker
                date={toDate}
                onChange={setToDate}
                label="Select to date"
              />
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg sm:flex-none"
                size="default"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1 transition-all hover:bg-muted sm:flex-none"
                size="default"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>
      ) : dashboardDetails.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardDetails.map((detail, index) => {
            const style = getMetricStyle(index);
            return (
              <Card
                key={detail.Parameter}
                className={`group relative overflow-hidden border ${style.border} bg-gradient-to-br ${style.gradient} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {detail.Parameter}
                  </CardTitle>
                  <div
                    className={`rounded-xl ${style.iconBg} p-2.5 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <div className={style.iconColor}>
                      {getMetricIcon(detail.Parameter)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {detail.Count.toLocaleString()}
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    {format(fromDate, 'MMM dd')} -{' '}
                    {format(toDate, 'MMM dd, yyyy')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Production Analytics
          </h2>
        </div>

        {isLoadingCharts ? (
          <>
            <ChartSkeleton />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>

            <ChartSkeleton />
          </>
        ) : (
          <>
            <div className="w-full">
              <ClippedAreaChart
                data={chartData?.printingCounts || []}
                title="Monthly Label Printing"
                description="Total labels printed per month"
                dataKey="printing_count"
                monthKey="printing_month_name"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="w-full">
                <RoundedPieChart
                  data={chartData?.topModels || []}
                  title="Top Items"
                  description="Most produced items"
                  dataKey="SerialNoCount"
                  nameKey="item_description"
                />
              </div>
              <div className="w-full">
                <GlowingLineChart
                  data={chartData?.putVsPick || []}
                  title="Put vs Pick Activity"
                  description="Monthly warehouse activity"
                  dataKeys={['TotalPutQty', 'TotalPickQty']}
                  monthKey="MonthName"
                />
              </div>
            </div>

            <div className="w-full">
              <GlowingBarChart
                data={chartData?.reworkCounts || []}
                title="Stock Transfer vs Shipment"
                description="Monthly stock transfer and shipment comparison"
                dataKey="StockTransferCount"
                monthKey="month_name"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
