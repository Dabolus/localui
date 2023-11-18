import { Link as RemixLink, useLoaderData } from '@remix-run/react';
import {
  Typography,
  Link,
  Stack,
  Card,
  CardHeader,
  styled,
} from '@mui/material';
import { redirect } from '@remix-run/node';
import { enabledServices } from '~/src/aws/server';
import { serviceToNameMap } from '~/src/aws/common';
import CurrentPath from '~/src/components/CurrentPath';
import AwsIcon from '~/src/components/icons/aws/AwsIcon';
import AwsIconContainer from '~/src/components/icons/aws/AwsIconContainer';
import { computeTitle } from '~/src/utils';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction<typeof loader> = () => [computeTitle()];

export async function loader() {
  return enabledServices.length > 1
    ? { services: enabledServices }
    : redirect(`/${enabledServices[0]}`);
}

const ServicesList = styled('ul')(({ theme }) => ({
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
  gridGap: theme.spacing(2),
}));

const serviceToDescriptionMap: Record<string, string> = {
  s3: 'Scalable object storage for any type of data',
  dynamodb: 'Fast and flexible NoSQL database service',
  sqs: 'Fully managed message queues for microservices & serverless applications',
};

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
          Console Home
        </Typography>
        <ServicesList>
          {services.map(service => (
            <li key={service}>
              <Link component={RemixLink} to={`/${service}`} underline="none">
                <ServiceCard>
                  <ServiceCardIconContainer service={service}>
                    <ServiceCardIcon service={service} />
                  </ServiceCardIconContainer>
                  <Stack px={2} py={1} justifyContent="space-evenly">
                    <CardHeader
                      title={serviceToNameMap[service]}
                      sx={{ p: 0 }}
                    />
                    <Typography lineHeight={1.3}>
                      {serviceToDescriptionMap[service]}
                    </Typography>
                  </Stack>
                </ServiceCard>
              </Link>
            </li>
          ))}
        </ServicesList>
      </Stack>
    </>
  );
}
