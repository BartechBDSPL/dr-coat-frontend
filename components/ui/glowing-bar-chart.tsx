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
  monthKey?: string;
}

export function GlowingBarChart({
  data = [],
  title = 'Bar Chart',
  description = 'Monthly data',
  dataKey = 'desktop',
  monthKey = 'month',
}: GlowingBarChartProps) {
  const chartData = data.map(item => ({
    month: item[monthKey],
    count: item[dataKey] || 0,
  }));

  const chartConfig = {
    count: {
      label: 'Count',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const totalCount = chartData.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

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
            <Bar
              barSize={24}
              dataKey="count"
              fill="var(--color-count)"
              radius={6}
              background={{ fill: 'hsl(var(--muted))', radius: 6 }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
