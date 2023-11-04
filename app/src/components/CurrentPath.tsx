import {
  Link as RemixLink,
  LinkProps as RemixLinkProps,
} from '@remix-run/react';
import {
  Box,
  Breadcrumbs,
  Link,
  LinkTypeMap,
  Typography,
  styled,
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { kebabToTitleCase } from '../utils';
import { serviceToNameMap } from '../aws/common';

interface PathLinkProps extends RemixLinkProps {
  selected?: boolean;
}

const PathLink = styled(Link)<PathLinkProps>(({ theme, selected }) => ({
  fontWeight: theme.typography.fontWeightBold,
  fontSize: '0.9rem',
  color: selected ? theme.palette.text.primary : theme.palette.text.disabled,
})) as OverridableComponent<LinkTypeMap<PathLinkProps, typeof RemixLink>>;

export type PathItem =
  | string
  | {
      key: string;
      name: string;
      to?: string;
    };

export interface CurrentPathProps {
  items?: PathItem[];
  selectedItem?: PathItem;
  withHeading?: boolean;
}

const computePath = (items: PathItem[], index: number): string =>
  `/${items
    .slice(1, index + 1)
    .map(item => (typeof item === 'string' ? item : item.key))
    .join('/')}`;

export default function CurrentPath({
  items = [],
  selectedItem,
  withHeading,
}: CurrentPathProps) {
  const pathItems: PathItem[] = ['home', ...items];
  const lastItem = pathItems[pathItems.length - 1];
  const selected = selectedItem ?? lastItem;

  return (
    <Box p={2}>
      <Breadcrumbs separator={<ChevronRightIcon />}>
        {pathItems.map((item, index) => {
          const key = typeof item === 'string' ? item : item.key;
          const name =
            typeof item === 'string' ? kebabToTitleCase(item) : item.name;
          const to =
            typeof item === 'string'
              ? computePath(pathItems, index)
              : item.to ?? computePath(pathItems, index);

          return (
            <PathLink
              key={key}
              component={RemixLink}
              to={to}
              selected={selected === item}
              {...(selected === item && { 'aria-current': 'page' })}
            >
              {name}
            </PathLink>
          );
        })}
      </Breadcrumbs>
      {withHeading && (
        <Typography variant="h2" sx={visuallyHidden}>
          {typeof selected === 'string'
            ? kebabToTitleCase(selected)
            : selected.name}
        </Typography>
      )}
    </Box>
  );
}
