import {
  CreateQueueCommand,
  DeleteQueueCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  QueueAttributeName,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { getAwsClient } from '~/src/aws/server';

const getOrCreateQueueUrl = async (
  sqsClient: SQSClient,
  name: string,
  attributes?: Partial<Record<QueueAttributeName, string>>,
): Promise<string | undefined> => {
  const existingQueue = await sqsClient
    .send(
      new GetQueueUrlCommand({
        QueueName: name,
      }),
    )
    .catch(() => ({ QueueUrl: undefined }));

  if (existingQueue.QueueUrl) {
    return existingQueue.QueueUrl;
  }

  const createdQueueOutput = await sqsClient.send(
    new CreateQueueCommand({
      QueueName: name,
      Attributes: attributes,
    }),
  );

  return createdQueueOutput.QueueUrl;
};

const getOrCreateQueueArn = async (
  sqsClient: SQSClient,
  name: string,
  attributes?: Partial<Record<QueueAttributeName, string>>,
): Promise<string | undefined> => {
  const queueUrl = await getOrCreateQueueUrl(sqsClient, name, attributes);
  const queueAttributes = await sqsClient.send(
    new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['QueueArn'],
    }),
  );

  return queueAttributes.Attributes?.QueueArn;
};

export const createQueueAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const sqsClient = getAwsClient('sqs');
  const isFifo = formData.has('fifo');
  const FifoQueue = isFifo.toString();
  const ContentBasedDeduplication = formData
    .has('contentBasedDeduplication')
    .toString();
  const SqsManagedSseEnabled = formData.has('sqsManagedSseEnabled').toString();
  const commonAttributes: Partial<Record<QueueAttributeName, string>> = {
    FifoQueue,
    ContentBasedDeduplication,
    SqsManagedSseEnabled,
  };

  // If a DLQ name is provided, create the DLQ first (or get its URL if it already exists)
  const providedDlqName = formData.get('dlqName')?.toString();
  const dlqName = `${providedDlqName}${isFifo ? '.fifo' : ''}`;
  const dlqArn = providedDlqName
    ? await getOrCreateQueueArn(sqsClient, dlqName, commonAttributes)
    : '';

  await sqsClient.send(
    new CreateQueueCommand({
      QueueName: `${formData.get('name')?.toString()}${isFifo ? '.fifo' : ''}`,
      Attributes: {
        FifoQueue,
        ContentBasedDeduplication,
        SqsManagedSseEnabled,
        ...(dlqArn
          ? {
              RedrivePolicy: JSON.stringify({
                deadLetterTargetArn: dlqArn,
                maxReceiveCount: formData.get('maxReceiveCount')?.toString(),
              }),
            }
          : {}),
      },
    }),
  );

  return redirect('/sqs/queues');
};

export const deleteQueuesAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const sqsClient = getAwsClient('sqs');
  const queuesToDelete = formData.get('names')?.toString().split(',') ?? [];

  await Promise.all(
    queuesToDelete.map(queue =>
      sqsClient.send(
        new DeleteQueueCommand({
          QueueUrl: queue,
        }),
      ),
    ),
  );

  return redirect('/sqs/queues');
};
