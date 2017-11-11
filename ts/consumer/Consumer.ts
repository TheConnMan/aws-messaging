import * as AWS from 'aws-sdk';

import {plainToClass} from 'class-transformer';

class Consumer<T> {

  public sqsClient: AWS.SQS;

  private clazz: new () => T;
  private active: boolean = false;

  constructor(
      private queueUrl: string,
      clazz: new () => T,
      private consumerFn: (item: T) => Promise<void>,
      region = 'us-east-1') {
    this.clazz = clazz;
    this.sqsClient = new AWS.SQS({
      region
    });
  }

  public start(): Promise<string> {
    if (this.active) {
      return Promise.resolve('Already running');
    }
    this.active = true;
    return this.run();
  }

  public stop(): void {
    this.active = false;
  }

  private run(): Promise<string> {
    const me = this;
    return me.processMessages().then(() => {
      if (me.active) {
        return me.run();
      }
      return Promise.resolve('Exiting loop');
    });
  }

  private async processMessages(): Promise<void[]> {
    try {
      const me = this;
      const messages: AWS.SQS.Message[] = await this.getMessages();
      return Promise.all(messages.map((message) => me.processMessage(message)));
    } catch (e) {
      return Promise.all([]);
    }
  }

  private getMessages(): Promise<AWS.SQS.Message[]> {
    const me = this;
    return new Promise((resolve, reject) => {
      me.sqsClient.receiveMessage({
        QueueUrl: me.queueUrl
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Messages);
        }
      });
    });
  }

  private processMessage(message: AWS.SQS.Message): Promise<void> {
    const me = this;
    const snsMessage: object = JSON.parse(JSON.parse(message.Body).Message);
    const object: T = plainToClass(this.clazz, snsMessage);
    return me.consumerFn(object).then(() => {
      return me.deleteMessage(message);
    });
  }

  private deleteMessage(message: AWS.SQS.Message): Promise<null> {
    const me = this;
    return new Promise((resolve, reject) => {
      me.sqsClient.deleteMessage({
        QueueUrl: me.queueUrl,
        ReceiptHandle: message.ReceiptHandle
      }, (err, data) => {
        if (err) {
          resolve();
        } else {
          resolve();
        }
      });
    });
  }
}

export default Consumer;
