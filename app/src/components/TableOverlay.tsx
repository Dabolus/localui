import { FunctionComponent, PropsWithChildren } from 'react';
import { Stack, StackProps, SvgIconProps } from '@mui/material';

export interface TableOverlayProps extends StackProps {
  icon?: FunctionComponent<SvgIconProps>;
}

const TableOverlay: FunctionComponent<PropsWithChildren<TableOverlayProps>> = ({
  icon: Icon,
  children,
  ...props
}) => (
  <Stack
    width="100%"
    height="100%"
    alignItems="center"
    justifyContent="center"
    {...props}
  >
    {Icon && <Icon sx={{ width: '4rem', height: '4rem', mb: 1 }} />}
    {children}
  </Stack>
);

export default TableOverlay;
