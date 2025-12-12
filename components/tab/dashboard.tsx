'use client';
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Boxes } from 'lucide-react';
import LocationTab from './location-tab';
import LiveStockTab from './live-stock-tab';
import OverviewTab from './overview-tab';
import RMDashboard from './rm-dashboard';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('fg');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col space-y-4 bg-background p-4 sm:space-y-8 sm:p-6 md:p-8">
        <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <Skeleton className="h-9 w-48 sm:h-10" />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="mx-auto mb-4 flex justify-center space-x-3">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>

          <div className="mx-auto mb-4 flex justify-center space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="grid gap-4 sm:gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-4 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:space-y-6 sm:p-6 md:p-8">
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div className="space-y-1">
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400 sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor your warehouse operations in real-time
          </p>
        </div>
      </div>

      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className="space-y-4 sm:space-y-6"
      >
        <TabsList className="mx-auto grid h-auto w-full max-w-md grid-cols-2 gap-2 rounded-xl border-0 bg-muted/50 p-2 shadow-inner">
          <TabsTrigger
            value="fg"
            className="group relative flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25"
          >
            <Boxes className="h-4 w-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
            <span>FG Dashboard</span>
            <span className="absolute -right-1 -top-1 flex h-2 w-2 opacity-0 transition-opacity group-data-[state=active]:opacity-100">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="rm"
            className="group relative flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/25"
          >
            <Package className="h-4 w-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
            <span>RM Dashboard</span>
            <span className="absolute -right-1 -top-1 flex h-2 w-2 opacity-0 transition-opacity group-data-[state=active]:opacity-100">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="fg"
          className="duration-300 animate-in fade-in-50 slide-in-from-left-2"
        >
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="mx-auto flex w-fit justify-center rounded-lg border border-border/50 bg-card/80 p-1.5 shadow-sm backdrop-blur-sm">
              <TabsTrigger
                value="overview"
                className="whitespace-nowrap rounded-md px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-accent data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:text-sm"
              >
                Overview
              </TabsTrigger>

              <TabsTrigger
                value="live-stock-tab"
                className="whitespace-nowrap rounded-md px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-accent data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:text-sm"
              >
                Live Stock
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="whitespace-nowrap rounded-md px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-accent data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:text-sm"
              >
                Location Wise Stock
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className="duration-200 animate-in fade-in-50"
            >
              <OverviewTab />
            </TabsContent>
            <TabsContent
              value="live-stock-tab"
              className="duration-200 animate-in fade-in-50"
            >
              <LiveStockTab />
            </TabsContent>

            <TabsContent
              value="location"
              className="duration-200 animate-in fade-in-50"
            >
              <LocationTab />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent
          value="rm"
          className="duration-300 animate-in fade-in-50 slide-in-from-right-2"
        >
          <RMDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
