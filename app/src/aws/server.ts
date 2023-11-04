import {
  DeleteObjectsCommand,
  ListObjectVersionsCommand,
  ListObjectsV2Command,
  ObjectIdentifier,
  S3Client,
} from '@aws-sdk/client-s3';
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

export const getEnabledServices = () =>
  process.env.AWS_UI_ENABLED_SERVICES?.split(',') ?? ['s3']; // Default to all available services if no env variable is provided

export const emptyBucket = async (client: S3Client, bucket: string) => {
  // Delete all versions of all objects in the bucket
  const { Versions } = await client.send(
    new ListObjectVersionsCommand({
      Bucket: bucket,
    }),
  );

  const versionsToDelete = (Versions ?? []).filter(
    version => !!version.Key,
  ) as ObjectIdentifier[];

  if (versionsToDelete.length < 1) {
    return;
  }

  const result = await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: versionsToDelete,
      },
    }),
  );

  return result;
};