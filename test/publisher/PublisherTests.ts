import Publisher from '../../ts/publisher/Publisher';
import * as chai from 'chai';

describe('Publisher', () => {
  it('should register and get the topic for a class', () => {
    var publisher = new Publisher();

    publisher.register('test-topic', 'Publisher');

    chai.assert.equal('test-topic', publisher.getTopic(publisher));
  })
})
