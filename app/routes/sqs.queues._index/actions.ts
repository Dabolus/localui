import {
  CreateQueueCommand,
  DeleteQueueCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { setupAwsClients } from '~/src/aws/server';

export const createQueueAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const [sqsClient] = setupAwsClients('sqs') as [SQSClient];
  const isFifo = formData.has('fifo');

  await sqsClient.send(
    new CreateQueueCommand({
      QueueName: `${formData.get('name')?.toString()}${isFifo ? '.fifo' : ''}`,
      Attributes: {
        FifoQueue: isFifo.toString(),
        ContentBasedDeduplication: formData
          .has('contentBasedDeduplication')
          .toString(),
      },
    }),
  );

  return redirect('/sqs/queues');
};

export const deleteQueuesAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const [sqsClient] = setupAwsClients('sqs') as [SQSClient];
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
