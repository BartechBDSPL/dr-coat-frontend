'use client';

import { Bar, BarChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import React from 'react';

interface GlowingBarChartProps {
  data: any[];
  title?: string;
  description?: string;
  dataKey?: string;
  dataKeys?: string[];
  monthKey?: string;
}

export function GlowingBarChart({
  data = [],
  title = 'Bar Chart',
  description = 'Monthly data',
  dataKey = 'desktop',
  dataKeys,
  monthKey = 'month',
}: GlowingBarChartProps) {
  const isMultiBar = dataKeys && dataKeys.length > 1;

  const chartData = data.map(item => {
    if (isMultiBar) {
      const result: any = { month: item[monthKey] };
      dataKeys.forEach(key => {
        result[key] = item[key] || 0;
      });
      return result;
    } else {
      return {
        month: item[monthKey],
        count: item[dataKey] || 0,
      };
    }
  });

  const chartConfig: ChartConfig = isMultiBar
    ? {
        StockTransferCount: {
          label: 'Stock Transfer',
          color: 'hsl(var(--chart-1))',
        },
        ShipmentCount: {
          label: 'Shipment',
          color: 'hsl(var(--chart-2))',
        },
      }
    : {
        count: {
          label: 'Count',
          color: 'hsl(var(--chart-1))',
        },
      };

  const totalCount = isMultiBar
    ? chartData.reduce(
        (sum, item) =>
          sum +
          (dataKeys?.reduce((acc, key) => acc + (item[key] || 0), 0) || 0),
        0
      )
    : chartData.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between">
          <CardTitle>
            {title}
            <Badge
              variant="outline"
              className="ml-2 border-none"
              style={{
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
              }}
            >
              <span>Total: {totalCount}</span>
            </Badge>
          </CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full sm:h-[300px]"
        >
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => value.slice(0, 3)}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {isMultiBar && dataKeys ? (
              dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  barSize={24}
                  dataKey={key}
                  fill={`var(--color-${key})`}
                  radius={6}
                  background={
                    index === 0
                      ? { fill: 'hsl(var(--muted))', radius: 6 }
                      : undefined
                  }
                />
              ))
            ) : (
              <Bar
                barSize={24}
                dataKey="count"
                fill="var(--color-count)"
                radius={6}
                background={{ fill: 'hsl(var(--muted))', radius: 6 }}
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
