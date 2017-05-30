import * as AWS from 'aws-sdk';
import Publisher from '../../ts/publisher/Publisher';

import * as assert from 'assert';
import * as sinon from 'sinon';

describe('Publisher', () => {
  it('should register and get the topic for a class then publish a message', () => {
    var publisher = new Publisher();
    var stub = sinon.stub(publisher.snsClient, 'publish').callsArgWithAsync(1, null, 'data');

    publisher.register('test-topic', 'Publisher');

    assert.equal('test-topic', publisher.getTopic(publisher));

    publisher.send(publisher).then((data) => assert.equal('data', data)).catch(() => assert.ok(false));

    sinon.assert.calledOnce(stub);
  });

  it('should fail without a registered class', () => {
    var publisher = new Publisher();
    var stub = sinon.stub(publisher.snsClient, 'publish').callsArgWithAsync(1, 'Error', null);

    assert.ok(!publisher.getTopic(publisher));

    publisher.send(publisher).then(() => assert.ok(false)).catch(() => assert.ok(true));

    sinon.assert.notCalled(stub);
  });

  it('should fail with an AWS error', () => {
    var publisher = new Publisher();
    var stub = sinon.stub(publisher.snsClient, 'publish').callsArgWithAsync(1, 'Error', null);

    publisher.register('test-topic', 'Publisher');

    publisher.send(publisher).then(() => assert.ok(false)).catch((err) => assert.equal('Error', err));

    sinon.assert.calledOnce(stub);
  });
})
