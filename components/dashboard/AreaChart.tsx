'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BACKEND_URL } from '@/lib/constants';

export function AreaChartGradient() {
  const [chartData, setChartData] = useState([]);
  const [pickTrend, setPickTrend] = useState(0);
  const [putTrend, setPutTrend] = useState(0);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/dashboard/put-pick-last-6-month`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        const transformedData = data.map(
          (item: {
            MonthName: string;
            TotalPutQty: string;
            TotalPickQty: string;
          }) => ({
            month: item.MonthName,
            putQty: item.TotalPutQty,
            pickQty: item.TotalPickQty,
          })
        );
        setChartData(transformedData);

        if (transformedData.length > 1) {
          const lastMonth = transformedData[0];
          const prevMonth = transformedData[1];

          const pickTrendValue =
            ((lastMonth.pickQty - prevMonth.pickQty) / prevMonth.pickQty) * 100;
          setPickTrend(pickTrendValue);

          const putTrendValue =
            ((lastMonth.putQty - prevMonth.putQty) / prevMonth.putQty) * 100;
          setPutTrend(putTrendValue);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  const chartConfig = {
    putQty: {
      label: 'Put Qty',
      color: 'hsl(var(--chart-2))',
    },
    pickQty: {
      label: 'Pick Qty',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Put vs Pick Activity</CardTitle>
        <CardDescription>
          Showing warehouse activity for last six months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillPutQty" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-putQty)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-putQty)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPickQty" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-pickQty)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pickQty)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="pickQty"
              type="natural"
              fill="url(#fillPickQty)"
              fillOpacity={0.4}
              stroke="var(--color-pickQty)"
              stackId="a"
            />
            <Area
              dataKey="putQty"
              type="natural"
              fill="url(#fillPutQty)"
              fillOpacity={0.4}
              stroke="var(--color-putQty)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {pickTrend >= 0 ? (
                <>
                  Pick Qty is trending up by {pickTrend.toFixed(2)}%{' '}
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Pick Qty is trending down by {Math.abs(pickTrend).toFixed(2)}%{' '}
                  <TrendingDown className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 font-medium leading-none">
              {putTrend >= 0 ? (
                <>
                  Put Qty is trending up by {putTrend.toFixed(2)}%{' '}
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Put Qty is trending down by {Math.abs(putTrend).toFixed(2)}%{' '}
                  <TrendingDown className="h-4 w-4" />
                </>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
