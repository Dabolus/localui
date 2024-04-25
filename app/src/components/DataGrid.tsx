export type * from '@mui/x-data-grid';

export const DataGrid = import.meta.env.VITE_MUI_LICENSE_KEY
  ? await import('@mui/x-data-grid-pro').then(imp => imp.DataGridPro)
  : await import('@mui/x-data-grid').then(imp => imp.DataGrid);

export default DataGrid;
