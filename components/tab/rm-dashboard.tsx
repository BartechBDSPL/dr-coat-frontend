'use client';
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Truck,
  BarChart3,
  Layers,
  Activity,
  TrendingUp,
} from 'lucide-react';

const RMDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Raw Material Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Coming soon - Track raw material inventory and movements
          </p>
        </div>
        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
          <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Package, label: 'Total RM Stock', color: 'blue' },
          { icon: Truck, label: 'Pending Receipts', color: 'green' },
          { icon: Layers, label: 'Active Items', color: 'purple' },
          { icon: Activity, label: 'Daily Movements', color: 'orange' },
        ].map((item, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-muted/30 to-muted/10 transition-all duration-300 hover:border-muted-foreground/40"
          >
            <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-muted-foreground/5 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <div
                className={`rounded-lg bg-${item.color}-100 p-2 dark:bg-${item.color}-900/30`}
              >
                <item.icon
                  className={`h-4 w-4 text-${item.color}-600 dark:text-${item.color}-400 opacity-50`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Coming Soon
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground/50" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-4 w-28" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[250px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                <BarChart3 className="h-16 w-16" />
                <span className="text-sm font-medium">RM Receipt Trends</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Under Development
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground/50" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[250px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                <TrendingUp className="h-16 w-16" />
                <span className="text-sm font-medium">
                  Consumption Analysis
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Under Development
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground/50" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
              <div className="flex items-center gap-4">
                <div className="h-24 w-6 rounded-t-lg bg-muted-foreground/10" />
                <div className="h-32 w-6 rounded-t-lg bg-muted-foreground/15" />
                <div className="h-20 w-6 rounded-t-lg bg-muted-foreground/10" />
                <div className="bg-muted-foreground/12 h-28 w-6 rounded-t-lg" />
                <div className="h-16 w-6 rounded-t-lg bg-muted-foreground/10" />
                <div className="h-36 w-6 rounded-t-lg bg-muted-foreground/15" />
                <div className="h-24 w-6 rounded-t-lg bg-muted-foreground/10" />
              </div>
              <span className="text-sm font-medium">
                Warehouse Stock Distribution
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Under Development
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RMDashboard;
