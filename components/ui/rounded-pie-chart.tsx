'use client';

import { LabelList, Legend, Pie, PieChart } from 'recharts';

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
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';

export const description = 'A pie chart with a label list';

interface RoundedPieChartProps {
  data: any[];
  title?: string;
  description?: string;
  dataKey?: string;
  nameKey?: string;
}

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function RoundedPieChart({
  data = [],
  title = 'Top Items',
  description = 'Distribution',
  dataKey = 'visitors',
  nameKey = 'browser',
}: RoundedPieChartProps) {
  const chartData = data.slice(0, 5).map((item, index) => ({
    browser: item[nameKey],
    visitors: item[dataKey],
    fill: chartColors[index % chartColors.length],
  }));

  const chartConfig = {
    visitors: {
      label: 'Count',
    },
    ...chartData.reduce((acc, item, index) => {
      acc[`item${index}`] = {
        label: item.browser,
        color: chartColors[index % chartColors.length],
      };
      return acc;
    }, {} as any),
  } satisfies ChartConfig;

  const totalCount = chartData.reduce(
    (sum, item) => sum + (item.visitors || 0),
    0
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.browser}</p>
          <p className="text-sm text-muted-foreground">
            Count:{' '}
            <span className="font-medium text-foreground">{data.visitors}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">
              {entry.payload.browser}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-3">
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
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[250px] w-full sm:h-[300px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey="visitors"
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey="visitors"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => value.toString()}
              />
            </Pie>
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
