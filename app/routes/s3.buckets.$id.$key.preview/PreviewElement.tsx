import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { FunctionComponent, useState } from 'react';
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/material';

export interface PreviewElementProps {
  contentType: string;
  name: string;
  src: string;
}

const CsvViewer: FunctionComponent<Pick<PreviewElementProps, 'src'>> = ({
  src,
}) => {
  const [dataGridProps, setDataGridProps] = useState<DataGridProps | undefined>(
    undefined,
  );

  useEnhancedEffect(() => {
    Promise.all([
      import('csv-parse/browser/esm').then(({ parse }) => parse),
      fetch(src).then(response => response.text()),
    ]).then(([parseCsv, data]) =>
      parseCsv(data, { columns: true }, (_, output) =>
        setDataGridProps({
          getRowId: row => JSON.stringify(row),
          rows: output,
          columns: Object.keys(output[0]).map(field => ({
            field,
            headerName: field,
            flex: 1,
            minWidth: 200,
          })),
        }),
      ),
    );
  }, []);

  return dataGridProps && <DataGrid {...dataGridProps} />;
};

export const PreviewElement: FunctionComponent<PreviewElementProps> = ({
  contentType,
  name,
  src,
}) => {
  if (contentType.startsWith('image/')) {
    return <img src={src} alt={name} title={name} />;
  }
  if (contentType.startsWith('video/')) {
    return <video src={src} title={name} controls />;
  }
  if (contentType.startsWith('audio/')) {
    return <audio src={src} title={name} controls />;
  }
  if (contentType.startsWith('text/csv')) {
    return <CsvViewer src={src} />;
  }
  return <iframe src={src} title={name} />;
};

export default PreviewElement;
