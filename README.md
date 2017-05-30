# AWS Messaging

[![NPM](https://nodei.co/npm/aws-messaging.png)](https://nodei.co/npm/aws-messaging/)

AWS messaging wrapper for multicasting published messages to consumer groups

## Description

For low throughput messaging queues (e.g. domain object persistence topics, export notifications) Kinesis or Kafka aren't economical. Publishing messages to SNS and multicasting to different SQS queues (one for each consumer cluster) yields the same result of published messages being sent to multiple application clusters.

This library abstracts away the SNS sending and SQS polling instead providing a Publisher class and a Consumer class. A good article describing this technique is <http://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html>.

## Usage

**NOTE:** This library uses default AWS credentials through the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

```javascript
// TypeScript
import { Consumer, Publisher } from 'aws-messaging';

// JavaScript
var Consumer = require('aws-messaging').Consumer;
var Publisher = require('aws-messaging').Publisher;
```

### Publishing to SNS Topics

First create an [AWS SNS topic](https://console.aws.amazon.com/sns/v2/home) and pull it's SNS topic ARN. Create a `Publisher` and register a JavaScript object class with that topic (or skip this step and send objects directly to that topic as shown further down):

```javascript
var publisher = new Publisher(/* awsRegion (default: us-east-1) */);
publisher.register('arn:aws:sns:us-east-1:000000000000:sns-topic', 'MyClass');

// Publishing with a registered class
var myClass = new MyClass();
publisher.send(myClass);

// Publishing directly to a topic
publisher.sendToTopic(myClass, topic);
```

### Consuming from SQS Topics

First create an [AWS SQS topic](https://console.aws.amazon.com/sqs/home), subscribe it to your SNS topic, and give the SNS topic publish permissions to the SQS topic (details can be found in <http://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html>). **NOTE:** Make sure to set the SQS **Receive Message Wait Time** to 20s for long polling and to reduce the total number of SQS API calls (which you are billed for).

```javascript
var consumer = new Consumer('https://sqs.us-east-1.amazonaws.com/000000000000/sqs-topic', /* awsRegion (default: us-east-1) */, item => {
  // Perform work with the item
  return Promise.resolve();
});

// Start the consumer function
consumer.start();

// Optionally stop SQS consumption
consumer.stop();
```
