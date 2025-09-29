import {
  ArrowLeftRight,
  ClipboardMinus,
  SquarePen,
  Printer,
  Shield,
  LayoutGrid,
} from 'lucide-react';

type Submenu = {
  href: string;
  label: string;
  active: boolean;
  value: string;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  value: string;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          active: pathname.includes('/dashboard'),
          icon: LayoutGrid,
          submenus: [],
          value: '1',
        },
      ],
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '',
          label: 'Master',
          active: pathname.includes('/heloj'),
          icon: SquarePen,
          value: '2',
          submenus: [
            {
              href: '/company-master',
              label: 'Company Master',
              active: pathname === '/company-master',
              value: '2_1',
            },
            {
              href: '/plant-master',
              label: 'Plant Master',
              active: pathname === '/plant-master',
              value: '2_2',
            },
            // {
            //   href: "/uom-master",
            //   label: "UOM Master",
            //   active: pathname === "/uom-master",
            //   value: "2_3",
            // },
            {
              href: '/warehouse-category-master',
              label: 'WH Category Master',
              active: pathname === '/warehouse-category-master',
              value: '2_4',
            },
            {
              href: '/warehouse-master',
              label: 'Warehouse Master',
              active: pathname === '/warehouse-master',
              value: '2_5',
            },
            {
              href: '/bin-master',
              label: 'Bin Master',
              active: pathname === '/bin-master',
              value: '2_6',
            },
            {
              href: "/material-master",
              label: "Material Master",
              active: pathname === "/material-master",
              value: "2_7",
            },
            // {
            //   href: "/material-master-existing-stock-upload",
            //   label: "Material Master Existing Stock Upload",
            //   active: pathname === "/material-master-existing-stock-upload",
            //   value: "2_8",
            // },
            // {
            //   href: "/line-master",
            //   label: "Line Master",
            //   active: pathname === "/line-master",
            //   value: "2_9",
            // },
            // {
            //   href: "/shift-master",
            //   label: "Shift Master",
            //   active: pathname === "/shift-master",
            //   value: "2_10",
            // },
            // {
            //   href: "/transporter-master",
            //   label: "Transporter Master",
            //   active: pathname === "/transporter-master",
            //   value: "2_11",
            // },
            // {
            //   href: "/pallet-master",
            //   label: "Pallet Master",
            //   active: pathname === "/pallet-master",
            //   value: "2_12",
            // },
            {
              href: '/printer-master',
              label: 'Printer Master',
              active: pathname === '/printer-master',
              value: '2_13',
            },
          ],
        },
        {
          href: '',
          label: 'Transaction',
          active: pathname.includes('/heloj'),
          icon: ArrowLeftRight,
          value: '3',
          submenus: [
            {
              href: '/fg-label-printing',
              label: 'Primary Pack Label Printing',
              active: pathname === '/fg-label-printing',
              value: '3_1',
            },
            {
              href: '/export-production-order-no',
              label: 'Export Production Order No',
              active: pathname.includes('/export-production-order-no'),
              value: '3_10',
            },
            // {
            //   href: "/exisiting-stock-printing",
            //   label: "Existing Stock Printing",
            //   active: pathname.includes("/exisiting-stock-printing"),
            //   value: "3_12",
            // },
            {
              href: '/excess-fg-label-printing',
              label: 'Excess Label Printing',
              active: pathname.includes('/excess-fg-label-printing'),
              value: '3_9',
            },
            {
              href: '/excess-box-label-printing-approval',
              label: 'Excess Label Printing Approval',
              active: pathname === '/excess-box-label-printing-approval',
              value: '3_6',
            },
            {
              href: '/approve-scrapping',
              label: 'Approve Scrapping',
              active: pathname === '/approve-scrapping',
              value: '3_14',
            },
            {
              href: '/scrap-quantity',
              label: 'Scrap Quantity',
              active: pathname === '/scrap-quantity',
              value: '3_17',
            },
            {
              href: '/resorting-label-printing',
              label: 'Resorting Order Label Printing',
              active: pathname === '/resorting-label-printing',
              value: '3_4',
            },
            {
              href: '/stock-transfer-note',
              label: 'Stock Transfer Note',
              active: pathname === '/stock-transfer-note',
              value: '3_7',
            },
            {
              href: '/delivery-order-assign',
              label: 'Delivery Order & Assign',
              active: pathname === '/delivery-order-assign',
              value: '3_2',
            },
            {
              href: '/resorting-order-assign',
              label: 'Resorting Order & Assign',
              active: pathname === '/resorting-order-assign',
              value: '3_3',
            },
            {
              href: '/stock-comparison',
              label: 'Stock comparison',
              active: pathname === '/stock-comparison',
              value: '3_8',
            },
            {
              href: '/existing-stock-upload',
              label: 'Existing Stock Upload',
              active: pathname === '/existing-stock-upload',
              value: '3_11',
            },
            {
              href: '/location-label-print',
              label: 'Location Label Printing',
              active: pathname === '/location-label-print',
              value: '3_5',
            },
          ],
        },
        {
          href: '',
          label: 'Re-Print',
          active: pathname.includes('/heloj'),
          icon: Printer,
          value: '8',
          submenus: [
            {
              href: '/reprint-fg-label-printing',
              label: 'Reprint Primary Pack Label',
              active: pathname === '/reprint-fg-label-printing',
              value: '8_1',
            },
            {
              href: '/reprint-pallet-barcode',
              label: 'Reprint Pallet Label',
              active: pathname === '/reprint-pallet-barcode',
              value: '8_2',
            },
            {
              href: '/reprint-stock-transfer',
              label: 'Reprint Stock Transfer',
              active: pathname === 'reprint-stock-transfer',
              value: '8_3',
            },
          ],
        },
        {
          href: '/categories',
          label: 'Reports',
          active: pathname.includes('/categories'),
          icon: ClipboardMinus,
          value: '5',
          submenus: [
            {
              href: '/rep-fg-label-printing',
              label: 'Primary Pack Label Printing Report',
              active: pathname === '/rep-fg-label-printing',
              value: '5_1',
            },
            {
              href: '/rep-pallet-details',
              label: 'Pallet details Report',
              active: pathname === '/rep-pallet-details',
              value: '5_2',
            },
            // {
            //   href: "/rep-production-entry-details",
            //   label: "Production Entry Report",
            //   active: pathname === "/rep-production-entry-details",
            //   value: "5_3",
            // },
            {
              href: '/rep-production-summary',
              label: 'Production Entry Summary Report',
              active: pathname === '/rep-production-summary',
              value: '5_13',
            },
            {
              href: '/rep-excess-production-order',
              label: 'Excess Production Order Report',
              active: pathname === '/rep-excess-production-order',
              value: '5_14',
            },
            {
              href: '/rep-material-ageing',
              label: 'Material Ageing Report',
              active: pathname === '/rep-material-ageing',
              value: '5_15',
            },
            {
              href: '/rep-existing-stock-dispatch',
              label: 'Existing Stock Dispatch Report',
              active: pathname === '/rep-existing-stock-dispatch',
              value: '5_17',
            },
            {
              href: '/rep-existing-stock-up-details',
              label: 'Existing Stock Inward Details Report',
              active: pathname === '/rep-existing-stock-up-details',
              value: '5_16',
            },
            {
              href: '/rep-qc-details',
              label: 'QC Report',
              active: pathname === '/rep-qc-details',
              value: '5_4',
            },
            {
              href: '/rep-fg-label-reprint',
              label: 'Reprint Primary Pack details Report',
              active: pathname === '/rep-fg-label-reprint',
              value: '5_5',
            },
            {
              href: '/rep-material-wise-stock',
              label: 'Material Wise Stock Report',
              active: pathname === '/rep-material-wise-stock',
              value: '5_6',
            },
            {
              href: '/rep-inward-details',
              label: 'Material Inward (5120) reports',
              active: pathname === '/rep-inward-details',
              value: '5_7',
            },
            {
              href: '/rep-pallet-split-pallet',
              label: 'Pallet Split Pallet Report',
              active: pathname === '/rep-pallet-split-pallet',
              value: '5_8',
            },
            {
              href: '/rep-put-away',
              label: 'Put Away Reports',
              active: pathname === '/rep-put-away',
              value: '5_9',
            },
            {
              href: '/rep-internal-transfer',
              label: 'Internal Movement Reports',
              active: pathname === '/rep-internal-transfer',
              value: '5_10',
            },
            {
              href: '/rep-material-picking',
              label: 'Material Picking Report',
              active: pathname === '/rep-material-picking',
              value: '5_11',
            },
            {
              href: '/rep-resorting-picking',
              label: 'Resorting Picking Report',
              active: pathname === '/rep-resorting-picking',
              value: '5_12',
            },
            {
              href: '/rep-stock-transfer-material-receipt',
              label: 'Stock Transfer Material Receipt Report',
              active: pathname === '/rep-stock-transfer-material-receipt',
              value: '5_18',
            },
            {
              href: '/rep-resorting-return',
              label: 'Resorting Return Report',
              active: pathname === '/rep-resorting-return',
              value: '5_19',
            },
            {
              href: '/rep-stock-transfer-picking',
              label: 'Stock Transfer Picking Report',
              active: pathname === '/rep-stock-transfer-picking',
              value: '5_20',
            },
            {
              href: '/rep-warehouse-scrapping',
              label: 'Warehouse Scrapping Report',
              active: pathname === '/rep-warehouse-scrapping',
              value: '5_21',
            },
          ],
        },
        {
          href: '/tags',
          label: 'Administrator',
          active: pathname.includes('/tags'),
          icon: Shield,
          value: '6',
          submenus: [
            {
              href: '/user-master',
              label: 'User Master',
              active: pathname === '/user-master',
              value: '6_1',
            },
            {
              href: '/user-role-master',
              label: 'User Role Master',
              active: pathname === '/user-role-master',
              value: '6_2',
            },
            {
              href: '/change-password',
              label: 'Change Password',
              active: pathname === '/change-password',
              value: '6_3',
            },
            {
              href: '/android-access',
              label: 'Android access',
              active: pathname === '/android-access',
              value: '6_4',
            },
            {
              href: '/session-master',
              label: 'Session Master',
              active: pathname === '/session-master',
              value: '6_5',
            },
          ],
        },
      ],
    },
  ];
}
