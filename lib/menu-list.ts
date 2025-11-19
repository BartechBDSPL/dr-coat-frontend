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
            {
              href: '/uom-master',
              label: 'UOM Master',
              active: pathname === '/uom-master',
              value: '2_3',
            },
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
              href: '/wh-location-master',
              label: 'Wh Location Master',
              active: pathname === '/wh-location-master',
              value: '2_6',
            },
            {
              href: '/material-master',
              label: 'Material Master',
              active: pathname === '/material-master',
              value: '2_7',
            },
            {
              href: '/item-packing-master',
              label: 'Item Packing Master',
              active: pathname === '/item-packing-master',
              value: '2_8',
            },
            // {
            //   href: "/material-master-existing-stock-upload",
            //   label: "Material Master Existing Stock Upload",
            //   active: pathname === "/material-master-existing-stock-upload",
            //   value: "2_9",
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
        // {
        //   href: '',
        //   label: 'RM Transaction',
        //   active: pathname.includes('/heloj'),
        //   icon: ArrowLeftRight,
        //   value: '10',
        //   submenus: [
        //     {
        //       href: '/rm-label-printing',
        //       label: 'RM Label Printing',
        //       active: pathname === '/rm-label-printing',
        //       value: '10_1',
        //     },
        //   ],
        // },
        {
          href: '',
          label: 'FG Transaction',
          active: pathname.includes('/heloj'),
          icon: ArrowLeftRight,
          value: '3',
          submenus: [
            {
              href: '/fg-production-order-label-printing',
              label: 'FG Production Order Label Printing',
              active: pathname === '/fg-production-order-label-printing',
              value: '3_1',
            },
            {
              href: '/fg-existing-data-upload',
              label: 'Existing Data Upload',
              active: pathname === '/fg-existing-data-upload',
              value: '3_2',
            },
          ],
        },
        {
          href: '',
          label: 'FG Reports',
          active: pathname.includes('/sdsdsd'),
          icon: ClipboardMinus,
          value: '4',
          submenus: [
            {
              href: '/fg-label-printing-report',
              label: 'FG Label Printing Report',
              active: pathname === '/fg-label-printing-report',
              value: '4_1',
            },
            {
              href: '/fg-put-away-report',
              label: 'FG Put Away Report',
              active: pathname === '/fg-put-away-report',
              value: '4_2',
            },
            {
              href: '/fg-internal-movement-report',
              label: 'FG Internal Movement Report',
              active: pathname === '/fg-internal-movement-report',
              value: '4_3',
            },
            {
              href: '/fg-reprint-label-report',
              label: 'FG Reprint Label Report',
              active: pathname === '/fg-reprint-label-report',
              value: '4_4',
            },
            {
              href: '/fg-stock-transfer-picking',
              label: 'FG Stock Transfer Picking',
              active: pathname === '/fg-stock-transfer-picking',
              value: '4_5',
            },
            {
              href: '/fg-material-receipt',
              label: 'FG Material Receipt',
              active: pathname === '/fg-material-receipt',
              value: '4_6',
            },
            {
              href: '/fg-shipment-picking-report',
              label: 'FG Shipment Picking Report',
              active: pathname === '/fg-shipment-picking-report',
              value: '4_7',
            },
            {
              href: '/fg-material-return-report',
              label: 'FG Material Return Report',
              active: pathname === '/fg-material-return-report',
              value: '4_8',
            },
          ],
        },
        {
          href: '',
          label: 'Transfer Order',
          active: pathname.includes('/stsdsds'),
          icon: ArrowLeftRight,
          value: '8',
          submenus: [
            {
              href: '/stock-transfer-order',
              label: 'Stock Transfer Order',
              active: pathname === '/stock-transfer-order',
              value: '8_1',
            },
            {
              href: '/sales-shipment-order',
              label: 'Sales Shipment Order',
              active: pathname === '/sales-shipment-order',
              value: '8_2',
            },
          ],
        },
        {
          href: '',
          label: 'Re-Print',
          active: pathname.includes('/heloj'),
          icon: Printer,
          value: '9',
          submenus: [
            {
              href: '/reprint-fg-label-printing',
              label: 'Reprint FG Label Printing',
              active: pathname === '/reprint-fg-label-printing',
              value: '9_1',
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
