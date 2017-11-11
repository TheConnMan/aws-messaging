import * as AWS from 'aws-sdk';
import Consumer from '../../ts/consumer/Consumer';

import * as assert from 'assert';
import * as sinon from 'sinon';

describe('Consumer', () => {
  it('should continue to run with empty results', () => {
    const consumer = new Consumer('queue-url', Object, () => null);
    const receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: []
    });

    consumer.start();
    consumer.stop();

    sinon.assert.calledOnce(receiveStub);
  });

  it('should not be started a second time', (done) => {
    const consumer = new Consumer('queue-url', Object, () => null);
    const receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: []
    });

    consumer.start();
    consumer.start().then((data) => {
      sinon.assert.calledOnce(receiveStub);
      assert.equal('Already running', data);
    }).then(done, done);
    consumer.stop();
  });

  it('should process with results', (done) => {
    const consumerFnStub = sinon.stub().resolves();
    const consumer = new Consumer('queue-url', Object, consumerFnStub);

    const receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: [{
        Body: '{"Message": "{}"}',
        ReceiptHandle: 'handle'
      }]
    });

    const deleteStub = sinon.stub(consumer.sqsClient, 'deleteMessage').callsArgWithAsync(1, null, 'data');

    consumer.start().then(() => {
      sinon.assert.calledOnce(receiveStub);
      sinon.assert.calledOnce(deleteStub);
      sinon.assert.calledOnce(consumerFnStub);
    }).then(done, done);
    consumer.stop();
  });

  it('should continue with AWS get errors', (done) => {
    const consumer = new Consumer('queue-url', Object, () => null);

    const receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, 'Error', null);

    consumer.start().then(() => {
      sinon.assert.calledOnce(receiveStub);
    }).then(done, done);
    consumer.stop();
  });

  it('should continue with AWS delete errors', (done) => {
    const consumerFnStub = sinon.stub().resolves();
    const consumer = new Consumer('queue-url', Object, consumerFnStub);

    const receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: [{
        Body: '{"Message": "{}"}',
        ReceiptHandle: 'handle'
      }]
    });

    const deleteStub = sinon.stub(consumer.sqsClient, 'deleteMessage').callsArgWithAsync(1, 'Error', null);

    consumer.start().then(() => {
      sinon.assert.calledOnce(receiveStub);
      sinon.assert.calledOnce(deleteStub);
      sinon.assert.calledOnce(consumerFnStub);
    }).then(done, done);
    consumer.stop();
  });
});
