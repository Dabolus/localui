import {
  CreateTableCommand,
  DeleteTableCommand,
  KeyType,
  ScalarAttributeType,
} from '@aws-sdk/client-dynamodb';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { getAwsClient } from '~/src/aws/server';

export const createTableAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const dynamoDbClient = getAwsClient('dynamodb');
  const partitionKeyName = formData.get('partitionKeyName')?.toString() ?? '';
  const sortKeyName = formData.get('sortKeyName')?.toString();

  await dynamoDbClient.send(
    new CreateTableCommand({
      TableName: formData.get('name')?.toString() ?? '',
      AttributeDefinitions: [
        {
          AttributeName: partitionKeyName,
          AttributeType:
            (formData
              .get('partitionKeyType')
              ?.toString() as ScalarAttributeType) ?? ScalarAttributeType.S,
        },
        ...(sortKeyName
          ? [
              {
                AttributeName: sortKeyName,
                AttributeType:
                  (formData
                    .get('sortKeyType')
                    ?.toString() as ScalarAttributeType) ??
                  ScalarAttributeType.S,
              },
            ]
          : []),
      ],
      KeySchema: [
        {
          AttributeName: partitionKeyName,
          KeyType: KeyType.HASH,
        },
        ...(sortKeyName
          ? [
              {
                AttributeName: sortKeyName,
                KeyType: KeyType.RANGE,
              },
            ]
          : []),
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: Number(
          formData.get('readCapacityUnits')?.toString() ?? 1,
        ),
        WriteCapacityUnits: Number(
          formData.get('writeCapacityUnits')?.toString() ?? 1,
        ),
      },
    }),
  );

  return redirect('/dynamodb/tables');
};

export const deleteTablesAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const dynamoDbClient = getAwsClient('dynamodb');
  const tablesToDelete = formData.get('names')?.toString().split(',') ?? [];

  await Promise.all(
    tablesToDelete.map(table =>
      dynamoDbClient.send(
        new DeleteTableCommand({
          TableName: table,
        }),
      ),
    ),
  );

  return redirect('/dynamodb/tables');
};
