import {
  ArrowLeftRight,
  ClipboardMinus,
  SquarePen,
  Printer,
  Shield,
  LayoutGrid,
  AlertCircle,
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
            //   href: '/uom-master',
            //   label: 'UOM Master',
            //   active: pathname === '/uom-master',
            //   value: '2_3',
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
          label: 'RM Reports',
          active: pathname.includes('/rm-reports'),
          icon: ClipboardMinus,
          value: '11',
          submenus: [
            {
              href: '/rm-label-printing-report',
              label: 'RM Label Printing Report',
              active: pathname === '/rm-label-printing-report',
              value: '11_1',
            },
            {
              href: '/rm-reprint-label-report',
              label: 'RM Reprint Label Report',
              active: pathname === '/rm-reprint-label-report',
              value: '11_2',
            },
            {
              href: '/rm-qc-report',
              label: 'RM QC Report',
              active: pathname === '/rm-qc-report',
              value: '11_3',
            },
            {
              href: '/rm-put-away-report',
              label: 'RM Put Away Report',
              active: pathname === '/rm-put-away-report',
              value: '11_4',
            },
            {
              href: '/rm-internal-movement-report',
              label: 'RM Internal Movement Report',
              active: pathname === '/rm-internal-movement-report',
              value: '11_5',
            },
            {
              href: '/rm-item-repacking-report',
              label: 'RM Item Repacking Report',
              active: pathname === '/rm-item-repacking-report',
              value: '11_6',
            },
            {
              href: '/rm-item-splitting-report',
              label: 'RM Item Splitting Report',
              active: pathname === '/rm-item-splitting-report',
              value: '11_7',
            },
            {
              href: '/rm-purchase-return-report',
              label: 'RM Purchase Return Report',
              active: pathname === '/rm-purchase-return-report',
              value: '11_8',
            },
            {
              href: '/rm-warehouse-return-report',
              label: 'RM Warehouse Return Report',
              active: pathname === '/rm-warehouse-return-report',
              value: '11_9',
            },
          ],
        },
        {
          href: '',
          label: 'RM Transaction',
          active: pathname.includes('/rmqqg'),
          icon: ArrowLeftRight,
          value: '5',
          submenus: [
            {
              href: '/rm-label-printing',
              label: 'RM Label Printing',
              active: pathname === '/rm-label-printing',
              value: '5_1',
            },
            {
              href: '/rm-existing-data-upload',
              label: 'RM Existing Data Upload',
              active: pathname === '/rm-existing-data-upload',
              value: '5_2',
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
            {
              href: '/stock-transfer-picking',
              label: 'Stock Transfer Picking Report',
              active: pathname === '/stock-transfer-picking',
              value: '8_3',
            },
          ],
        },
        {
          href: '',
          label: 'Reprint FG',
          active: pathname.includes('/heloj'),
          icon: Printer,
          value: '9',
          submenus: [
            {
              href: '/reprint-request',
              label: 'FG Reprint Request',
              active: pathname === '/reprint-request',
              value: '9_1',
            },
            {
              href: '/reprint-approval',
              label: 'FG Reprint Approval',
              active: pathname === '/reprint-approval',
              value: '9_2',
            },
          ],
        },
        {
          href: '',
          label: 'Reprint RM',
          active: pathname.includes('/rm-reprint'),
          icon: Printer,
          value: '10',
          submenus: [
            {
              href: '/rm-reprint-request',
              label: 'RM Reprint Request',
              active: pathname === '/rm-reprint-request',
              value: '10_1',
            },
            {
              href: '/rm-reprint-approval',
              label: 'RM Reprint Approval',
              active: pathname === '/rm-reprint-approval',
              value: '10_2',
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
            // {
            //   href: '/session-master',
            //   label: 'Session Master',
            //   active: pathname === '/session-master',
            //   value: '6_5',
            // },
          ],
        },
        {
          href: '',
          label: 'Error Logs',
          active: pathname.includes('/update-error-logs'),
          icon: AlertCircle,
          value: '7',
          submenus: [
            {
              href: '/update-error-logs',
              label: 'Update Error Logs',
              active: pathname === '/update-error-logs',
              value: '7_1',
            },
          ],
        },
      ],
    },
  ];
}
