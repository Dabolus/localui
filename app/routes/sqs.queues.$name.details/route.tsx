import { GetQueueUrlCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { getAwsClient } from '~/src/aws/server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const sqsClient = getAwsClient('sqs');
  const queue = await sqsClient.send(
    new GetQueueUrlCommand({
      QueueName: params.name,
    }),
  );
  const response = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: queue.QueueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 3,
    }),
  );

  return json({ messages: response.Messages ?? [] });
};
