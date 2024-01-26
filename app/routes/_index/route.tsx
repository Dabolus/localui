import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RemixLink, useLoaderData } from '@remix-run/react';
import {
  Typography,
  Link,
  Stack,
  Card,
  CardHeader,
  styled,
} from '@mui/material';
import { json, redirect } from '@remix-run/node';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { enabledServices } from '~/src/aws/server';
import { serviceToNameMap } from '~/src/aws/common';
import CurrentPath from '~/src/components/CurrentPath';
import AwsIcon from '~/src/components/icons/aws/AwsIcon';
import AwsIconContainer from '~/src/components/icons/aws/AwsIconContainer';
import { computeTitle } from '~/src/utils';
import { useServerTranslation } from '~/i18next.server';
import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (enabledServices.length === 1) {
    return redirect(`/${enabledServices[0]}`);
  }

  const { t } = await useServerTranslation(request);
  return json({
    meta: { description: t('homeDescription') },
    services: enabledServices,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  computeTitle(),
  {
    name: 'description',
    content: data?.meta.description,
  },
];

const serviceToLinkMap: Record<string, string> = {
  s3: '/s3/buckets',
  dynamodb: '/dynamodb/tables',
  sqs: '/sqs/queues',
};

const ServicesList = styled('ul')(({ theme }) => ({
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
  gridGap: theme.spacing(2),
}));

const ServiceCard = styled(Card)({
  display: 'flex',
  width: 420,
  maxWidth: '100%',
});

const ServiceCardIconContainer = styled(AwsIconContainer)(({ theme }) => ({
  color: theme.palette.common.white,
  width: 96,
  height: 96,
  flex: '0 0 auto',
}));

const ServiceCardIcon = styled(AwsIcon)({
  width: 64,
  height: 64,
});

export default function Index() {
  const { services } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const serviceToDescriptionMap = useMemo<Record<string, string>>(
    () => ({
      s3: t('s3Description'),
      dynamodb: t('dynamodbDescription'),
      sqs: t('sqsDescription'),
    }),
    [t],
  );

  return (
    <>
      <CurrentPath />
      <Stack
        p={2}
        spacing={2}
        alignItems="flex-start"
        width="100%"
        maxWidth={640}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          {t('consoleHome')}
        </Typography>
        <ServicesList>
          {services.map(({ id, href }) => {
            const linkProps = href
              ? {
                  component: 'a',
                  href,
                }
              : {
                  component: RemixLink,
                  to: serviceToLinkMap[id],
                  unstable_viewTransition: true,
                };

            return (
              <li key={id}>
                <Link underline="none" {...linkProps}>
                  <ServiceCard>
                    <ServiceCardIconContainer service={id}>
                      <ServiceCardIcon service={id} />
                    </ServiceCardIconContainer>
                    <Stack px={2} py={1} justifyContent="space-evenly">
                      <CardHeader
                        title={
                          <Stack direction="row" justifyContent="space-between">
                            {serviceToNameMap[id]}
                            {href && <OpenInNewIcon fontSize="small" />}
                          </Stack>
                        }
                        sx={{ p: 0 }}
                      />
                      <Typography lineHeight={1.3}>
                        {serviceToDescriptionMap[id]}
                      </Typography>
                    </Stack>
                  </ServiceCard>
                </Link>
              </li>
            );
          })}
        </ServicesList>
      </Stack>
    </>
  );
}
