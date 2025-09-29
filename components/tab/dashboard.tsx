'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  CalendarIcon,
  DollarSign,
  FileText,
  Printer,
  ArrowDownToLine,
  ArrowUpToLine,
  Package,
  DoorOpen,
  NotebookTabs,
} from 'lucide-react';
import { format } from 'date-fns';
import { BACKEND_URL } from '@/lib/constants';
import Cookies from 'js-cookie';
import axios from '@/lib/axios-config';

interface DashboardItem {
  Parameter: string;
  Count: number;
}

const cardData = [
  {
    value: 'inward',
    label: 'Gate Entry Material Inward',
    path: '/gate-entry-inward',
  },
  {
    value: 'outward',
    label: 'Gate Entry Mat Outward',
    path: '/gate-entry-outward',
  },
  { value: 'grn', label: 'Create GRN', path: '/create-grn' },
  { value: 'rm-label', label: 'RM Label Printing', path: '/rm-label-printing' },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const token = Cookies.get('token');
  const [fromDate, setFromDate] = useState<Date>(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7);
    return currentDate;
  });
  const [toDate, setToDate] = useState<Date>(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState<Date>(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7);
    return currentDate;
  });
  const [selectedToDate, setSelectedToDate] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [fromDate, toDate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/dashboard/details`,
        {
          FromDate: format(fromDate, 'yyyy-MM-dd'),
          ToDate: format(toDate, 'yyyy-MM-dd'),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data: DashboardItem[] = response.data;
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  const getIconForParameter = (parameter: string) => {
    switch (parameter) {
      case 'Total Gate Entry Inward':
        return (
          <DoorOpen className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
      case 'Total GRN':
        return (
          <FileText className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
      case 'Total RM Label Printing':
        return (
          <Printer className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
      case 'Total Pick Qty':
        return (
          <ArrowUpToLine className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
      case 'Total Put Qty':
        return (
          <ArrowDownToLine className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
      case 'Total Pallet Made':
        return (
          <Package className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
      case 'Total Pending Orders':
        return (
          <NotebookTabs className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
      default:
        return (
          <DollarSign className="h-5 w-5 text-muted-foreground md:h-4 md:w-4 lg:h-6 lg:w-6" />
        );
    }
  };

  const handleSearch = () => {
    setFromDate(selectedFromDate);
    setToDate(selectedToDate);
  };

  const handleClear = () => {
    const today = new Date();
    setSelectedFromDate(today);
    setSelectedToDate(today);
    setFromDate(today);
    setToDate(today);
  };

  const handleRadioChange = (value: string) => {
    const selectedCard = cardData.find(card => card.value === value);
    if (selectedCard) {
      router.push(selectedCard.path);
    }
  };

  interface DatePickerProps {
    date: Date;
    onChange: (date: Date) => void;
    label: string;
  }

  const DatePicker: React.FC<DatePickerProps> = ({ date, onChange, label }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={date => date && onChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
  return <>Dashboard</>;
};

export default Dashboard;
