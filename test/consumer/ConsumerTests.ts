import * as AWS from 'aws-sdk';
import Consumer from '../../ts/consumer/Consumer';

import * as chai from 'chai';
import * as sinon from 'sinon';

describe('Consumer', () => {
  it('should continue to run with empty results', () => {
    var consumer = new Consumer('queue-url', () => null);
    var receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: []
    });

    consumer.start();
    consumer.stop();

    sinon.assert.calledOnce(receiveStub);
  });

  it('should not be started a second time', (done) => {
    var consumer = new Consumer('queue-url', () => null);
    var receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: []
    });

    consumer.start();
    consumer.start().then(data => {
      sinon.assert.calledOnce(receiveStub);
      chai.assert.equal('Already running', data);
    }).then(done, done);
    consumer.stop();
  });

  it('should process with results', (done) => {
    var consumerFnStub = sinon.stub().resolves();
    var consumer = new Consumer('queue-url', consumerFnStub);

    var receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: [{
        ReceiptHandle: "handle",
        Body: "{}"
      }]
    });

    var deleteStub = sinon.stub(consumer.sqsClient, 'deleteMessage').callsArgWithAsync(1, null, 'data');

    consumer.start().then(() => {
      sinon.assert.calledOnce(receiveStub);
      sinon.assert.calledOnce(deleteStub);
      sinon.assert.calledOnce(consumerFnStub);
    }).then(done, done);
    consumer.stop();
  });

  it('should continue with AWS get errors', (done) => {
    var consumer = new Consumer('queue-url', () => null);

    var receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, 'Error', null);

    consumer.start().then(() => {
      sinon.assert.calledOnce(receiveStub);
    }).then(done, done);
    consumer.stop();
  });

  it('should continue with AWS delete errors', (done) => {
    var consumerFnStub = sinon.stub().resolves();
    var consumer = new Consumer('queue-url', consumerFnStub);

    var receiveStub = sinon.stub(consumer.sqsClient, 'receiveMessage').callsArgWithAsync(1, null, {
      Messages: [{
        ReceiptHandle: "handle",
        Body: "{}"
      }]
    });

    var deleteStub = sinon.stub(consumer.sqsClient, 'deleteMessage').callsArgWithAsync(1, 'Error', null);

    consumer.start().then(() => {
      sinon.assert.calledOnce(receiveStub);
      sinon.assert.calledOnce(deleteStub);
      sinon.assert.calledOnce(consumerFnStub);
    }).then(done, done);
    consumer.stop();
  });
})
