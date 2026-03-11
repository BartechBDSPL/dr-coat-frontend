'use client';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RMOverviewTab from './rm-overview-tab';
import RMLiveStockTab from './rm-live-stock-tab';
import RMLocationHeatmaps from '@/components/dashboard/rm-locationWiseStock';

const RMDashboard: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="mx-auto flex w-fit justify-center rounded-lg border border-border/50 bg-card/80 p-1.5 shadow-sm backdrop-blur-sm">
          <TabsTrigger
            value="overview"
            className="whitespace-nowrap rounded-md px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-accent data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="live-stock"
            className="whitespace-nowrap rounded-md px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-accent data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:text-sm"
          >
            Live Stock
          </TabsTrigger>
          <TabsTrigger
            value="location"
            className="whitespace-nowrap rounded-md px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-accent data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:text-sm"
          >
            Location Wise Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="duration-200 animate-in fade-in-50">
          <RMOverviewTab />
        </TabsContent>
        <TabsContent value="live-stock" className="duration-200 animate-in fade-in-50">
          <RMLiveStockTab />
        </TabsContent>
        <TabsContent value="location" className="duration-200 animate-in fade-in-50">
          <RMLocationHeatmaps />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RMDashboard;
