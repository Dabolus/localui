import { FunctionComponent, PropsWithChildren } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Typography, Link, Box, BoxProps } from '@mui/material';

export type FooterProps = BoxProps;

const FooterUrl: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <strong>
    <Link
      // For some reason, if component="a" is not specified, the link will not
      // have the correct href when rendered on the client side.
      component="a"
      underline="hover"
      color="inherit"
      href="https://github.com/Dabolus"
      target="my-github"
    >
      {children}
    </Link>
  </strong>
);

export default function Footer(props: FooterProps) {
  const { t } = useTranslation();

  return (
    <Box {...props} sx={{ p: 2, ...props.sx }}>
      <Typography variant="body2" color="text.secondary" align="center">
        <Trans t={t} i18nKey="copyright" components={{ url: <FooterUrl /> }} />
      </Typography>
    </Box>
  );
}
