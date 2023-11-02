import { S3Client } from '@aws-sdk/client-s3';
import type { RegionInputConfig } from '@smithy/config-resolver';
import type { EndpointInputConfig } from '@smithy/middleware-endpoint';
import type { AwsAuthInputConfig } from '@aws-sdk/middleware-signing';
import type {
  Client,
  SmithyResolvedConfiguration,
} from '@smithy/smithy-client';
import type { HttpHandlerOptions, MetadataBearer } from '@smithy/types';

type AwsClientConfig = HttpHandlerOptions &
  RegionInputConfig &
  EndpointInputConfig &
  AwsAuthInputConfig & { forcePathStyle?: boolean };

type AwsClient = Client<
  HttpHandlerOptions,
  object,
  MetadataBearer,
  SmithyResolvedConfiguration<AwsClientConfig>
>;

type AwsClientConstructor = new (config: AwsClientConfig) => AwsClient;

const serviceToConfigMap: Record<
  string,
  {
    Client: AwsClientConstructor;
    envName: string;
  }
> = {
  s3: {
    Client: S3Client,
    envName: 'S3',
  },
};

const resolveEnvironmentVariable = (
  suffix: string,
  serviceEnvName: string,
  defaultValue = '',
  fallbackEnvName = '',
): string =>
  // Try to get the specific service variable
  process.env[`AWS_UI_${serviceEnvName}_${suffix}`] ??
  // If not available, try to get the generic services variable
  process.env[`AWS_UI_${fallbackEnvName || suffix}`] ??
  // If not available, use the default value provided
  defaultValue;

export const setupAwsClients = (...services: string[]): AwsClient[] =>
  services.map(service => {
    const { Client, envName } = serviceToConfigMap[service];
    return new Client({
      endpoint: resolveEnvironmentVariable(
        'SERVICE_ENDPOINT',
        envName,
        // Use localstack endpoint as default if no env variable is provided
        'http://localhost:4566',
        'SERVICES_ENDPOINT',
      ),
      // Default to us-east-1 if no region is provided
      region: resolveEnvironmentVariable('REGION', envName, 'us-east-1'),
      credentials: {
        accessKeyId: resolveEnvironmentVariable('ACCESS_KEY_ID', envName),
        secretAccessKey: resolveEnvironmentVariable(
          'SECRET_ACCESS_KEY',
          envName,
        ),
      },
      forcePathStyle: true,
    });
  });

export interface AwsRegion {
  id: string;
  region: string;
  zone?: string;
}

export const awsRegions: Record<string, AwsRegion[]> = {
  'United States': [
    {
      id: 'us-east-1',
      region: 'N. Virginia',
      zone: 'US East',
    },
    {
      id: 'us-east-2',
      region: 'Ohio',
      zone: 'US East',
    },
    {
      id: 'us-west-1',
      region: 'N. California',
      zone: 'US West',
    },
    {
      id: 'us-west-2',
      region: 'Oregon',
      zone: 'US West',
    },
  ],
  Africa: [
    {
      id: 'af-south-1',
      region: 'Cape Town',
    },
  ],
  'Asia Pacific': [
    {
      id: 'ap-east-1',
      region: 'Hong Kong',
    },
    {
      id: 'ap-south-2',
      region: 'Hyderabad',
    },
    {
      id: 'ap-southeast-3',
      region: 'Jakarta',
    },
    {
      id: 'ap-southeast-4',
      region: 'Melbourne',
    },
    {
      id: 'ap-south-1',
      region: 'Mumbai',
    },
    {
      id: 'ap-northeast-3',
      region: 'Osaka',
    },
    {
      id: 'ap-northeast-2',
      region: 'Seoul',
    },
    {
      id: 'ap-southeast-1',
      region: 'Singapore',
    },
    {
      id: 'ap-southeast-2',
      region: 'Sydney',
    },
    {
      id: 'ap-northeast-1',
      region: 'Tokyo',
    },
  ],
  Canada: [
    {
      id: 'ca-central-1',
      region: 'Central',
    },
  ],
  Europe: [
    {
      id: 'eu-central-1',
      region: 'Frankfurt',
    },
    {
      id: 'eu-west-1',
      region: 'Ireland',
    },
    {
      id: 'eu-west-2',
      region: 'London',
    },
    {
      id: 'eu-south-1',
      region: 'Milan',
    },
    {
      id: 'eu-west-3',
      region: 'Paris',
    },
    {
      id: 'eu-south-2',
      region: 'Spain',
    },
    {
      id: 'eu-north-1',
      region: 'Stockholm',
    },
    {
      id: 'eu-central-2',
      region: 'Zurich',
    },
  ],
  Israel: [
    {
      id: 'il-central-1',
      region: 'Tel Aviv',
    },
  ],
  'Middle East': [
    {
      id: 'me-south-1',
      region: 'Bahrain',
    },
    {
      id: 'me-central-1',
      region: 'UAE',
    },
  ],
  'South America': [
    {
      id: 'sa-east-1',
      region: 'São Paulo',
    },
  ],
};

export interface AwsRegionWithContinent extends AwsRegion {
  continent: string;
}

export const awsRegionsWithContinents: AwsRegionWithContinent[] =
  Object.entries(awsRegions).flatMap(([continent, regions]) =>
    regions.map(region => ({
      ...region,
      continent,
    })),
  );

export const getEnabledServices = () =>
  process.env.AWS_UI_ENABLED_SERVICES?.split(',') ?? ['s3']; // Default to all available services if no env variable is provided

export const serviceToNameMap: Record<string, string> = {
  s3: 'S3',
};
