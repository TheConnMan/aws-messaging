import * as AWS from 'aws-sdk';
import Publisher from '../../ts/publisher/Publisher';

import * as chai from 'chai';
import * as sinon from 'sinon';

describe('Publisher', () => {
  it('should register and get the topic for a class then publish a message', () => {
    var publisher = new Publisher();
    var stub = sinon.stub(publisher.snsClient, 'publish').callsArgWithAsync(1, null, 'data');

    publisher.register('test-topic', 'Publisher');

    chai.assert.equal('test-topic', publisher.getTopic(publisher));

    publisher.send(publisher).then((data) => chai.assert.equal('data', data)).catch(() => chai.assert.fail());

    sinon.assert.calledOnce(stub);
  });

  it('should fail without a registered class', () => {
    var publisher = new Publisher();
    var stub = sinon.stub(publisher.snsClient, 'publish').callsArgWithAsync(1, 'Error', null);

    chai.assert.isUndefined(publisher.getTopic(publisher));

    publisher.send(publisher).then(() => chai.assert.fail()).catch(() => chai.assert.ok(true));

    sinon.assert.notCalled(stub);
  });

  it('should fail with an AWS error', () => {
    var publisher = new Publisher();
    var stub = sinon.stub(publisher.snsClient, 'publish').callsArgWithAsync(1, 'Error', null);

    publisher.register('test-topic', 'Publisher');

    publisher.send(publisher).then(() => chai.assert.fail()).catch((err) => chai.assert.equal('Error', err));

    sinon.assert.calledOnce(stub);
  });
})
