import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
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

export class WrappedDynamoDBClient extends DynamoDBDocumentClient {
  constructor(config: DynamoDBClientConfig) {
    const client = new DynamoDBClient(config);
    super(client);
  }
}

const serviceToConfigMap = {
  s3: {
    Client: S3Client,
    envName: 'S3',
  },
  dynamodb: {
    Client: WrappedDynamoDBClient,
    envName: 'DYNAMODB',
  },
  sqs: {
    Client: SQSClient,
    envName: 'SQS',
  },
} satisfies Record<
  string,
  {
    Client: AwsClientConstructor;
    envName: string;
  }
>;

export type ServiceToConfigMap = typeof serviceToConfigMap;
export type SupportedService = keyof ServiceToConfigMap;
export type ServiceClient<T extends SupportedService> =
  ServiceToConfigMap[T]['Client']['prototype'];

const resolveEnvironmentVariable = (
  suffix: string,
  serviceEnvName: string,
  defaultValue = '',
  fallbackEnvName = '',
): string =>
  // Try to get the specific service variable in singular form
  process.env[`LOCALUI_${serviceEnvName}_${suffix}`] ??
  // If not available, try to get the specific service variable in plural form (i.e. with a trailing 'S')
  process.env[`LOCALUI_${serviceEnvName}_${suffix}S`] ??
  // If not available, try to get the generic services variable
  process.env[`LOCALUI_${fallbackEnvName || suffix}`] ??
  // If not available, try to get the generic services variable in plural form (i.e. with a trailing 'S')
  process.env[`LOCALUI_${fallbackEnvName || suffix}S`] ??
  // If not available, use the default value provided
  defaultValue;

const resolveEnvironmentVariablesGroup = (
  suffix: string,
  serviceEnvName: string,
  defaultValue = '',
  fallbackEnvName = '',
): string[] =>
  resolveEnvironmentVariable(
    suffix,
    serviceEnvName,
    defaultValue,
    fallbackEnvName,
  )
    .split(',')
    .map(val => val.trim())
    .filter(Boolean);

export const setupAwsClientsGroup = <T extends SupportedService>(
  service: T,
): Map<string, ServiceClient<T>> => {
  const { Client, envName } = serviceToConfigMap[service];
  const endpoints = resolveEnvironmentVariablesGroup(
    'SERVICE_ENDPOINT',
    envName,
    // Use localstack endpoint as default if no env variable is provided
    process.env.AWS_ENDPOINT_URL ?? 'http://localhost:4566',
    'SERVICES_ENDPOINT',
  );
  const regions = resolveEnvironmentVariablesGroup(
    'REGION',
    envName,
    // Default to us-east-1 if no region is provided
    process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
  );
  const accessKeyIds = resolveEnvironmentVariablesGroup(
    'ACCESS_KEY_ID',
    envName,
    process.env.AWS_ACCESS_KEY_ID,
  );
  const secretAccessKeys = resolveEnvironmentVariablesGroup(
    'SECRET_ACCESS_KEY',
    envName,
    process.env.AWS_SECRET_ACCESS_KEY,
  );
  const clientsGroup = new Map<string, ServiceClient<T>>(
    endpoints.map((endpoint, index) => [
      endpoint,
      new Client({
        endpoint,
        region: regions[index] ?? regions[0],
        credentials: {
          accessKeyId: accessKeyIds[index] ?? accessKeyIds[0],
          secretAccessKey: secretAccessKeys[index] ?? secretAccessKeys[0],
        },
        forcePathStyle: true,
      }),
    ]),
  );
  return clientsGroup;
};

export const setupAwsClients = (
  ...services: SupportedService[]
): Map<SupportedService, Map<string, AwsClient>> =>
  new Map(services.map(service => [service, setupAwsClientsGroup(service)]));

export const enabledServices = (process.env.LOCALUI_ENABLED_SERVICES?.split(
  ',',
).map(service => service.trim()) ?? [
  // Default to all available services if no env variable is provided
  's3',
  'dynamodb',
  'sqs',
]) as SupportedService[];

export const awsClients: Map<
  SupportedService,
  Map<string, AwsClient>
> = setupAwsClients(...enabledServices);

export const getAwsClientsGroup = <T extends SupportedService>(
  service: T,
): Map<string, ServiceClient<T>> =>
  awsClients.get(service) as Map<string, ServiceClient<T>>;

export const getAwsClient = <T extends SupportedService>(
  service: T,
  endpoint?: string | null,
): ServiceClient<T> => {
  const group = getAwsClientsGroup<T>(service);
  return endpoint
    ? // If the endpoint is provided, return the client for that endpoint
      group.get(endpoint)
    : // Otherwise, return the first client in the group
      group.values().next().value;
};
