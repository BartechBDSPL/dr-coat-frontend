'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

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

interface GlowingLineChartProps {
  data: any[];
  title?: string;
  description?: string;
  dataKeys?: string[];
  monthKey?: string;
}

export function GlowingLineChart({
  data = [],
  title = 'Line Chart',
  description = 'Data over time',
  dataKeys = ['desktop', 'mobile'],
  monthKey = 'month',
}: GlowingLineChartProps) {
  const chartData = data.map(item => ({
    month: item[monthKey],
    desktop: item[dataKeys[0]] || 0,
    mobile: item[dataKeys[1]] || 0,
  }));

  const chartConfig = {
    desktop: {
      label:
        dataKeys[0]
          ?.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase()) || 'Put Qty',
      color: 'hsl(var(--chart-2))',
    },
    mobile: {
      label:
        dataKeys[1]
          ?.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase()) || 'Pick Qty',
      color: 'hsl(var(--chart-5))',
    },
  } satisfies ChartConfig;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pb-4">
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full sm:h-[300px]"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="desktop"
              type="bump"
              stroke="hsl(var(--chart-2))"
              dot={false}
              strokeWidth={2}
              filter="url(#rainbow-line-glow)"
            />
            <Line
              dataKey="mobile"
              type="bump"
              stroke="hsl(var(--chart-5))"
              dot={false}
              strokeWidth={2}
              filter="url(#rainbow-line-glow)"
            />
            <defs>
              <filter
                id="rainbow-line-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
