import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Message } from '../../../src/models';
import { MessageController } from '../../../src/controllers';
import { MessageType } from '../../../src/@types';

// TODO: Add more structure here
const enforceMessageStructure = (message: Message) => {
  expect(message).to.have.keys('call_completed_at', 'call_dialed_at', 'call_rang_at', 'call_started_at', 'call_status', 'recipient_snapshot', 'sender_snapshot', 'public_id', 'organization_id', 'message', 'media', 'conversation_id', 'created_at', 'updated_at', 'type', 'duration', 'from_phone_id', 'to_phone_id', 'direction', 'call_sid', 'billable_units', 'origin');
  // Ensure primary keys are hidden
  expect(message).to.not.have.key('id');
  expect(MessageType[message.type]).to.be.a('string');
};

describe('controllers/message', () => {
  let controller: MessageController;

  beforeEach(() => {
    controller = new MessageController((global as any).transaction);
  });

  describe('create', () => {
    it('creates properly structured messages', async () => {
      const message = await controller.create('data-accuracy-qa', { type: MessageType.USER });

      enforceMessageStructure(message);
    });

    it('fails when "type" is omitted', async () => {
      try {
        await controller.create('data-accuracy-qa', {});
        expect(1).to.equal(2);
      } catch (err) {
        expect(err.message).to.equal('undefined is not a valid Message type');
      }
    });

    it('fails when type is not a valid MessageType', async () => {
      try {
        await controller.create('data-accuracy-qa', { type: 'abc' } as any);
        expect(1).to.equal(2);
      } catch (err) {
        expect(err.message).to.equal('abc is not a valid Message type');
      }
    });
  });
  // TODO: Add billable unit query tests here
});