import { ObjectStorageClass } from '@aws-sdk/client-s3';

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

export const serviceToNameMap: Record<string, string> = {
  home: 'Home',
  s3: 'S3',
  dynamodb: 'DynamoDB',
  sqs: 'Simple Queue Service',
};

export const s3StorageClassToNameMap: Record<ObjectStorageClass, string> = {
  [ObjectStorageClass.DEEP_ARCHIVE]: 'Glacier DA',
  [ObjectStorageClass.GLACIER]: 'Glacier FR',
  [ObjectStorageClass.GLACIER_IR]: 'Glacier IR',
  [ObjectStorageClass.INTELLIGENT_TIERING]: 'Intelligent-Tiering',
  [ObjectStorageClass.ONEZONE_IA]: 'One Zone-IA',
  [ObjectStorageClass.OUTPOSTS]: 'Outposts',
  [ObjectStorageClass.REDUCED_REDUNDANCY]: 'Reduced Redundancy',
  [ObjectStorageClass.SNOW]: 'Snow',
  [ObjectStorageClass.STANDARD]: '-',
  [ObjectStorageClass.STANDARD_IA]: 'IA',
  [ObjectStorageClass.EXPRESS_ONEZONE]: 'Express One Zone',
};
