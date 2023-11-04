import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { TreeItem, TreeView, TreeViewProps } from '@mui/x-tree-view';
import { FunctionComponent, ReactNode, useState } from 'react';
import {
  styled,
  unstable_useEnhancedEffect as useEnhancedEffect,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

export interface PreviewElementProps {
  contentType: string;
  name: string;
  src: string;
}

const CsvViewer: FunctionComponent<
  Pick<PreviewElementProps, 'name' | 'src'>
> = ({ name, src }) => {
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

  return dataGridProps && <DataGrid aria-label={name} {...dataGridProps} />;
};

const ColoredKey = styled('strong')(({ theme }) => ({
  color: theme.palette.primary.main,
}));
const ColoredValue = styled('span')<{ $value: any }>(({ $value, theme }) => ({
  ...(typeof $value === 'number' && {
    color: theme.palette.secondary.dark,
  }),
  ...(typeof $value === 'string' && {
    color: theme.palette.success.dark,
  }),
  ...(typeof $value === 'boolean' && {
    color: theme.palette.info.dark,
  }),
  ...($value === null && {
    color: theme.palette.error.dark,
  }),
}));
const JsonValue: FunctionComponent<{ value: any }> = ({ value }) => (
  <ColoredValue $value={value}>{JSON.stringify(value)}</ColoredValue>
);
const JsonTreeView = styled(TreeView)(({ theme }) => ({
  background: theme.palette.background.default,
  width: '100%',
  height: '100%',
  overflow: 'auto',
})) as typeof TreeView;

const convertToTree = (obj: any, keyPrefix = ''): ReactNode => {
  if (Array.isArray(obj) || (typeof obj === 'object' && obj !== null)) {
    return Object.entries(obj).map(([key, value]) => {
      if (
        Array.isArray(value) ||
        (typeof value === 'object' && value !== null)
      ) {
        const nodeId = `${keyPrefix}['${key}']`;
        return (
          <TreeItem
            key={nodeId}
            nodeId={nodeId}
            label={
              <code>
                <ColoredKey>{key}:</ColoredKey>
              </code>
            }
          >
            {convertToTree(value, nodeId)}
          </TreeItem>
        );
      }
      const nodeId = `${keyPrefix}['${key}']`;
      return (
        <TreeItem
          key={nodeId}
          nodeId={nodeId}
          label={
            <code>
              <ColoredKey>{key}:</ColoredKey> <JsonValue value={value} />
            </code>
          }
        />
      );
    });
  }
  return <JsonValue key={`${keyPrefix}['${obj}']`} value={obj} />;
};

const JsonViewer: FunctionComponent<
  Pick<PreviewElementProps, 'name' | 'src'>
> = ({ name, src }) => {
  const [treeViewProps, setTreeViewProps] = useState<
    TreeViewProps<false> | undefined
  >(undefined);

  useEnhancedEffect(() => {
    fetch(src)
      .then(response => response.json())
      .then(data => {
        // Convert the JSON object to a tree structure.
        const children = convertToTree(data);
        setTreeViewProps({ defaultExpanded: Object.keys(data), children });
      });
  }, []);

  return (
    treeViewProps && (
      <JsonTreeView
        aria-label={name}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        {...treeViewProps}
      />
    )
  );
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
    return <CsvViewer src={src} name={name} />;
  }
  if (contentType.startsWith('application/json')) {
    return <JsonViewer src={src} name={name} />;
  }
  return <iframe src={src} title={name} />;
};

export default PreviewElement;
