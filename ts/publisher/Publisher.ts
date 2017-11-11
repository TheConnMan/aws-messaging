import * as AWS from 'aws-sdk';

class Publisher {

  public snsClient: AWS.SNS;

  private registry: { [key: string]: string; } = {};

  constructor(region = 'us-east-1') {
    this.snsClient = new AWS.SNS({
      region
    });
  }

  public register(topic: string, clazz: new () => object): void {
    this.registry[clazz.name] = topic;
  }

  public getTopic(object: any): string {
    return this.registry[object.constructor.name];
  }

  public send(object: any): Promise<any> {
    const topic = this.getTopic(object);
    return this.sendToTopic(object, topic);
  }

  public sendToTopic(object: any, topic: string): Promise<any> {
    if (!topic) {
      return Promise.reject('No topic found for ' + (object.constructor.name));
    }
    return new Promise((resolve, reject) => {
      this.snsClient.publish({
        Message: JSON.stringify(object),
        TargetArn: topic
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}

export default Publisher;
