import * as AWS from 'aws-sdk';

class Consumer {

  public sqsClient: AWS.SQS;

  private active: boolean = false;

  constructor(private queueUrl: string, private consumerFn: (item) => Promise<void>, region = 'us-east-1') {
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
    var me = this;
    return me.processMessages().then(() => {
      if (me.active) {
        return me.run();
      }
      return Promise.resolve('Exiting loop');
    });
  }

  private async processMessages(): Promise<Array<void>> {
    try {
      var me = this;
      var messages: Array<AWS.SQS.Message> = await this.getMessages();
      return Promise.all(messages.map(message => me.processMessage(message)));
    } catch (e) {
      return Promise.all([]);
    }
  }

  private getMessages(): Promise<Array<AWS.SQS.Message>> {
    var me = this;
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
    var me = this;
    var snsMessage = JSON.parse(message.Body);
    return me.consumerFn(snsMessage).then(() => {
      return me.deleteMessage(message);
    })
  }

  private deleteMessage(message: AWS.SQS.Message): Promise<null> {
    var me = this;
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
    })
  }
}

export default Consumer;
