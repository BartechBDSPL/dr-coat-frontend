'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '@/lib/axios-config';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { delay } from '@/utils/delay';
import Cookies from 'js-cookie';
import { Skeleton } from '@/components/ui/skeleton';

type LocationData = {
  Location: string;
  warehouse_code: string;
  ItemQtyDetails: string | null;
  TotalPutQty: number;
  TotalPickQty: number;
  TotalQty: number;
};

type CellData = {
  id: string;
  label: string;
  value: number;
  customData: LocationData;
};

type HeatmapProps = {
  data: CellData[];
  title: string;
};

const colorScale = (value: number): string => {
  if (value === 0) return 'bg-[#2EB88A]';
  return 'bg-red-500';
};

const Cell: React.FC<{ data: CellData }> = ({ data }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`aspect-square ${colorScale(data.value)} cursor-pointer rounded-sm text-[10px] shadow-sm`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`flex h-full w-full items-center justify-center font-medium ${data.value === 0 ? 'text-gray-800' : 'text-gray-200'} overflow-hidden`}
            >
              {data.label}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="rounded-lg border border-border bg-popover p-3 shadow-lg"
        >
          <div className="text-sm text-popover-foreground">
            <h3 className="mb-1 font-bold text-foreground">{data.label}</h3>
            <div className="flex flex-col space-y-1 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Total Put:</span>{' '}
                {data.customData.TotalPutQty}
              </p>
              <p>
                <span className="font-medium text-foreground">Total Pick:</span>{' '}
                {data.customData.TotalPickQty}
              </p>
              <p>
                <span className="font-medium text-foreground">Total Qty:</span>{' '}
                {data.customData.TotalQty}
              </p>
            </div>
            {data.customData.ItemQtyDetails && (
              <div className="mt-2">
                <h4 className="font-semibold text-foreground">Material Qty Details:</h4>
                <div className="text-muted-foreground">
                  {data.customData.ItemQtyDetails.split(', ').map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const HeatmapSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4 pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-[200px]" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-1.5">
          {[...Array(24)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const RMHeatmap: React.FC<HeatmapProps> = ({ data, title }) => {
  const gridColsClass = () => {
    const length = data.length;
    if (length <= 24) return 'grid-cols-6';
    if (length <= 48) return 'grid-cols-8';
    return 'grid-cols-12';
  };

  return (
    <Card className="relative w-full">
      <CardHeader className="flex flex-col space-y-4 pb-2">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            {title.split('(')[0]}
            <span className="block text-sm text-muted-foreground sm:inline">
              ({title.split('(')[1]}
            </span>
          </CardTitle>

          <div className="flex flex-row items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#2EB88A]"></div>
              <span>Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-red-500"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`grid ${gridColsClass()} gap-1.5`}>
          {data.map(cell => (
            <Cell key={cell.id} data={cell} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function RMLocationHeatmaps() {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = Cookies.get('token');

  useEffect(() => {
    const fetchDataSequentially = async () => {
      await delay(200);
      fetchData();
    };
    fetchDataSequentially();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        '/api/rm-dashboard/location-wise-item-qty',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.success
          ? response.data.data
          : [];

      setLocationData(dataArray);
    } catch (error) {
      console.error('Error fetching RM location data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processData = (data: LocationData[], warehouseCode: string): CellData[] => {
    return data
      .filter(item => item.warehouse_code === warehouseCode)
      .map(item => ({
        id: item.Location,
        label: item.Location,
        value: item.TotalQty,
        customData: item,
      }));
  };

  const warehouseCodes = Array.from(
    new Set(locationData.map(item => item.warehouse_code))
  ).sort();

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        {[...Array(4)].map((_, index) => (
          <HeatmapSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
      {warehouseCodes.map(warehouseCode => {
        const warehouseLocations = processData(locationData, warehouseCode);
        if (warehouseLocations.length === 0) return null;

        return (
          <div key={warehouseCode} className="w-full">
            <RMHeatmap
              data={warehouseLocations}
              title={`RM Storage Overview (Warehouse ${warehouseCode})`}
            />
          </div>
        );
      })}
    </div>
  );
}
