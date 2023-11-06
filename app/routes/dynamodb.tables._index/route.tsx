import { FunctionComponent, useEffect } from 'react';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  Link as RemixLink,
  useRevalidator,
  useSearchParams,
} from '@remix-run/react';
import {
  Typography,
  Button,
  TextField,
  Link,
  Stack,
  IconButton,
  styled,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import useFuzzySearch from '~/src/hooks/useFuzzySearch';
import { highlightMatches } from '~/src/utils';
import CurrentPath from '~/src/components/CurrentPath';
import { WrappedDynamoDBClient, setupAwsClients } from '~/src/aws/server';
import CreateTableDialog from './CreateTableDialog';
import DeleteTablesDialog from './DeleteTablesDialog';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import TableOverlay from '~/src/components/TableOverlay';
import { createTableAction, deleteTablesAction } from './actions';

export const loader = async () => {
  const [dynamoDbClient] = setupAwsClients('dynamodb') as [
    WrappedDynamoDBClient,
  ];
  const response = await dynamoDbClient.send(new ListTablesCommand({}));
  return json({ tables: response.TableNames ?? [] });
};

export const action = (args: ActionFunctionArgs) => {
  switch (args.request.method) {
    case 'POST':
      return createTableAction(args);
    case 'DELETE':
      return deleteTablesAction(args);
  }
  throw redirect('/dynamodb/tables');
};

const SearchField = styled(TextField)({
  'input[type="search"]::-webkit-search-cancel-button': {
    display: 'none',
  },
});

const TablesList: FunctionComponent = () => {
  const { tables } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const { withSearchParam } = useLinkUtils();
  const selectedTables = searchParams.get('selection')?.split(',') ?? [];
  const search = searchParams.get('search') ?? '';
  const { results: searchResults } = useFuzzySearch(search, tables, {
    keys: ['Name'],
    includeMatches: true,
  });

  useEffect(() => {
    if (selectedTables.length > 0) {
      return;
    }
    setSearchParams(currentParams => {
      currentParams.delete('delete');
      currentParams.delete('empty');
      return currentParams;
    });
  }, [selectedTables.length, setSearchParams]);

  return (
    <>
      <CurrentPath items={['dynamodb', 'tables']} />
      <Stack p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Tables ({tables.length})
          </Typography>
          <Stack direction="row" gap={1}>
            <Button onClick={revalidate}>
              <RefreshIcon />
            </Button>
            <Button
              component={RemixLink}
              to={withSearchParam('delete', '')}
              disabled={selectedTables.length < 1}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RemixLink}
              to={withSearchParam('create', '')}
            >
              Create table
            </Button>
          </Stack>
        </Stack>
        <div>
          <SearchField
            type="search"
            label="Search tables"
            variant="outlined"
            value={search}
            onChange={event =>
              setSearchParams(previousParams => {
                if (event.target.value) {
                  previousParams.set('search', event.target.value);
                } else {
                  previousParams.delete('search');
                }
                return previousParams;
              })
            }
            InputProps={{
              endAdornment: search && (
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() =>
                    setSearchParams(previousParams => {
                      previousParams.delete('search');
                      return previousParams;
                    })
                  }
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
            sx={{ width: '30ch' }}
          />
        </div>
      </Stack>
      <DataGrid
        rowSelectionModel={selectedTables}
        onRowSelectionModelChange={newSelection =>
          setSearchParams(previousParams => {
            if (newSelection.length < 1) {
              previousParams.delete('selection');
            } else {
              previousParams.set('selection', newSelection.join(','));
            }
            return previousParams;
          })
        }
        rows={searchResults}
        columns={[
          {
            field: 'name',
            headerName: 'Name',
            renderCell: params => (
              <Link
                to={`/dynamodb/tables/${params.row.item}`}
                color="secondary"
                component={RemixLink}
              >
                {highlightMatches(
                  params.row.item,
                  params.row.matches?.[0]?.indices,
                )}
              </Link>
            ),
            sortable: !search,
            flex: 1,
          },
        ]}
        getRowId={row => row.item}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{ height: 'calc(100vh - 270px)' }}
        slots={{ noRowsOverlay: TableOverlay }}
        slotProps={{
          noRowsOverlay: {
            children: 'No tables available.',
          },
        }}
      />
      <CreateTableDialog open={searchParams.has('create')} />
      <DeleteTablesDialog
        open={searchParams.has('delete') && tables.length > 0}
        tables={selectedTables}
      />
    </>
  );
};

export default TablesList;
