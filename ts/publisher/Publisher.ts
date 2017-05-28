import * as AWS from 'aws-sdk';

class Publisher {

  private registry: { [key:string]:string; } = {};

  private snsClient: AWS.SNS = new AWS.SNS();

  public register(topic: string, clazz: string): void {
    this.registry[clazz] = topic;
  }

  public getTopic(object: any): string {
    return this.registry[object.constructor.name];
  }

  public send(object: any): Promise<any> {
    var topic = this.getTopic(object);
    if (!topic) {
      throw new Error('No topic found for ' + (object.constructor.name));
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
      })
    });
  }
}

export default Publisher;
