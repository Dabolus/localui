import {
  Link as RemixLink,
  LinkProps as RemixLinkProps,
  useLocation,
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

interface PathLinkProps extends RemixLinkProps {
  selected?: boolean;
}

const PathLink = styled(Link)<PathLinkProps>(({ theme, selected }) => ({
  fontWeight: theme.typography.fontWeightBold,
  fontSize: '0.9rem',
  color: selected ? theme.palette.text.primary : theme.palette.text.disabled,
})) as OverridableComponent<LinkTypeMap<PathLinkProps, typeof RemixLink>>;

export interface CurrentPathProps {
  withHeading?: boolean;
}

export default function CurrentPath({ withHeading }: CurrentPathProps) {
  const { pathname } = useLocation();
  const pathSegments = pathname.split('/');
  const lastItem = kebabToTitleCase(pathSegments[pathSegments.length - 1]);

  return (
    <Box p={2}>
      <Breadcrumbs separator={<ChevronRightIcon />}>
        {pathSegments.map((item, index) => {
          const pageTitle = kebabToTitleCase(item || 'home');

          return (
            <PathLink
              key={index}
              component={RemixLink}
              to={pathname.slice(0, pathname.indexOf(item) + item.length)}
              selected={index === pathSegments.length - 1}
              {...(index === pathSegments.length - 1 && {
                'aria-current': 'page',
              })}
            >
              {pageTitle}
            </PathLink>
          );
        })}
      </Breadcrumbs>
      {withHeading && (
        <Typography variant="h2" sx={visuallyHidden}>
          {lastItem}
        </Typography>
      )}
    </Box>
  );
}