import { ConfigService } from './../../config/config.service.js';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer } from 'sqs-consumer';
import { SQSClient } from '@aws-sdk/client-sqs';
import { TenantLogger } from '../../logger/tenantLogger.service.js';
import { EmailWorker } from './workers/email.worker.js';
import { MerchantService } from '../merchant/merchant.service.js';

@Injectable()
export class SubscribersService implements OnModuleDestroy{
  private consumer: any;
  private ConfigService: ConfigService;
  logger: TenantLogger;
  constructor(
    // private readonly emailService: MerchantService,
  ) // private readonly emailService: EmailSettingService,

  {
    this.ConfigService = new ConfigService();
    // console.log("im service..............................")
  }
  // onModuleInit() {
  //   console.log('Initializing workers..........', );
  //   // console.log(this.emailSettingService)
  //   const configService = new ConfigService();
  //   this.subscribe(
  //     {
  //       queueUrl: configService.get('EMAIL_QUEUE_URL') as string,
  //       batchSize: 1,
  //       visibilityTimeout: 30
  //     },
  //     async (payload, done) => {
  //       console.log('Message Received................................................', payload);


  //       // const worker = new EmailWorker()
  //       // await worker.exec(payload);
  //       done();
  //     }
  //   );
  // }
  // onModuleInit() {
  //   console.log("Initializing workers..........")
  //   this.subscribe(
  //     {
  //       queueUrl: this.ConfigService.get('EMAIL_QUEUE_URL') as string,
  //       batchSize: 1,
  //       visibilityTimeout: 30
  //     },
  //     async (payload, done) => {
  //       console.log("Message Received................................................", payload);

  //       const worker = new EmailWorker(this.emailService)
  //       await worker.exec(payload);
  //       done();
  //     }
  //   );
  // }

  subscribe(
    options: {
      queueUrl: string;
      batchSize?: number;
      visibilityTimeout?: number;
    },
    handler: (payload: any, done: (error?: Error) => void) => void
  ): void {
    const { queueUrl, batchSize = 1, visibilityTimeout } = options;

    this.consumer = Consumer.create({
      sqs: new SQSClient({
        region: this.ConfigService.get('AWS_REGION') as string,
        credentials: {
          accessKeyId: this.ConfigService.get('AWS_ACCESS_KEY') as string,
          secretAccessKey: this.ConfigService.get('AWS_SECRET_KEY') as string
        }
      }),
      queueUrl,
      batchSize,
      visibilityTimeout,
      messageAttributeNames: ['All'],
      handleMessage: async (message: any): Promise<void> => {
        const start = Date.now();
        const done = (err?: Error): void => {
          if (err) {
            throw err;
          }
          console.log(`Processing Time (ms) - ${Date.now() - start}`);
        };

        console.log(`[subscribe > handleMessage] ${message}`);

        let body = undefined;
        let isObject = true;

        try {
          body = JSON.parse(message.Body);
        } catch (err) {
          isObject = false;
          body = message.Body;
          console.log(`ERROR: ${JSON.stringify(err)}`);
          return done(err);
        }

        const attr: { [key: string]: any } = {};

        message.MessageAttributes &&
          Object.keys(message.MessageAttributes).forEach((attribute) => {
            if (message.MessageAttributes[attribute].DataType === 'String') {
              attr[attribute] = message.MessageAttributes[attribute].DataType.StringValue;
            } else if (message.MessageAttributes[attribute].DataType === 'Number') {
              attr[attribute] = +message.MessageAttributes[attribute].DataType.StringValue;
            } else if (message.MessageAttributes[attribute].DataType === 'Boolean') {
              attr[attribute] = message.MessageAttributes[attribute].DataType.StringValue[0].toLowerCase() === 't';
            }
          });

        // console.log('Calling handler: ', attr);
        handler({ message: body, attr }, done);
      }
    });

    this.consumer.start();

    console.log(`Subscribed to ${options.queueUrl}`);
  }

  onModuleDestroy() {
    if (this.consumer) {
      this.consumer.stop();
      console.error(`Stopping SQS consumer `);
    }
  }
}
