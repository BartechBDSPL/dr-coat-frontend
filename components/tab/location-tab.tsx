'use client';
import React from 'react';
import { MapPin } from 'lucide-react';
import LocationHeatmaps from '@/components/dashboard/locationWiseStock';

const LocationTab: React.FC = () => {
  return (
    <div className="mt-3 space-y-4 sm:mt-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
          <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl">
            Location wise Available Quantity
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time warehouse bin occupancy status
          </p>
        </div>
      </div>
      <div className="w-full overflow-x-auto rounded-lg">
        <LocationHeatmaps />
      </div>
    </div>
  );
};

export default LocationTab;
