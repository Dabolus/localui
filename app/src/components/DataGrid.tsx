import { muiLicenseKey } from '~/muiLicenseHandler';
import { DataGrid as DataGridBase } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
export type * from '@mui/x-data-grid';

export const DataGrid = muiLicenseKey
  ? (DataGridPro as typeof DataGridBase)
  : DataGridBase;

export default DataGrid;
