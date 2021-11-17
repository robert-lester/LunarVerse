import * as faker from 'faker';
import * as Knex from 'knex';
import Airlock from '../../../lib/airlock';

interface IAnswers {
  organization: string;
}

export default async function seed(db: Knex, answers: IAnswers): Promise<void> {
  const organization_id = answers.organization.toLowerCase().replace(/ /g, '-') || 'lunar';
  const lock: Airlock = new Airlock('alias/uplink/dev/lunar');
  const created_at = new Date();
  const updated_at = new Date();
  // Reset
  await Promise.all([
    db('phonenumbers').truncate(),
    db('users').truncate(),
    db('phonenumbers_users').del(),
    db('conversations').truncate(),
    db('messages').truncate(),
    db('conversations_phonenumbers').del(),
    db('invites').truncate(),
  ]);

  // Insert reserved twilio numbers & users for testing
  await Promise.all([
    db
      .table('phonenumbers')
      .insert({
        systemNumber: '+18566198690',
        sid: 'PN6825fd38ba2c9c30f8236cf50e1037e4',
        type: 'USER',
        organization_id,
        created_at,
        updated_at,
      })
      .then(() =>
        db.table('phonenumbers').insert({
          systemNumber: '+17067012975',
          sid: 'PN4a2c04031d19a0f907cb8408442fe2fb',
          type: 'CONTACT',
          organization_id,
          created_at,
          updated_at,
        }),
      ),
    db
      .table('users')
      .insert({
        physicalNumber: '+14079850779',
        name: 'Damien Guyton',
        type: 'USER',
        organization_id,
        created_at,
        updated_at,
      })
      .then(() =>
        db.table('users').insert({
          physicalNumber: '+13212346805',
          name: 'Damien GV',
          type: 'CONTACT',
          organization_id,
          created_at,
          updated_at,
        }),
      ),
    db.table('phonenumbers_users').insert({
      phone_id: 1,
      user_id: 1,
    }),
    db.table('phonenumbers_users').insert({
      phone_id: 2,
      user_id: 2,
    }),
    db.table('invites').insert({
      organization_id,
      message: 'This is an opt-in message',
      created_at,
      updated_at,
    }),
  ]);

  const poolPhoneNumbers = Array.from({ length: 10 }).map(() => ({
    systemNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}`,
    notified: false,
    sid: faker.random.uuid(),
    type: 'POOL',
    organization_id: 'lunar-pool',
    created_at,
    updated_at,
  }));

  await Promise.all(poolPhoneNumbers.map(phone => db.table('phonenumbers').insert(phone)));

  // Create 10 new phone numbers
  const phoneNumbers = Array.from({ length: 10 }).map((_, i) => ({
    systemNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}`,
    notified: false,
    sid: faker.random.uuid(),
    type: i % 2 === 0 ? 'CONTACT' : 'USER',
    organization_id,
    created_at,
    updated_at,
  }));
  // Create 10 users
  const users = Array.from({ length: 10 }).map((_, i) => ({
    name: faker.name.findName(),
    initialOptIn: false,
    shouldContact: true,
    type: i % 2 === 0 ? 'CONTACT' : 'USER',
    physicalNumber: `+1${faker.phone.phoneNumberFormat(0).replace(/-/g, '')}`,
    organization_id,
    created_at,
    updated_at,
  }));
  // Create 50 conversations
  const conversations = Array.from({ length: 50 }).map(() => ({
    organization_id,
    created_at: new Date(
      new Date('6/19/2018').getTime() +
        Math.random() * (new Date('7/19/2018').getTime() - new Date('6/19/2018').getTime()),
    ),
    updated_at: new Date(
      new Date('6/19/2018').getTime() +
        Math.random() * (new Date('7/19/2018').getTime() - new Date('6/19/2018').getTime()),
    ),
  }));
  // Create 200 messages
  const messages = await Promise.all(
    Array.from({ length: 200 }).map(async () => ({
      message: await lock.encrypt(faker.hacker.phrase()),
      organization_id,
      created_at,
      updated_at,
    })),
  );

  const insertedNumbers = await Promise.all(
    phoneNumbers.map(phone =>
      db
        .table('phonenumbers')
        .insert(phone)
        .returning('id')
        .then(rows =>
          db
            .table('phonenumbers')
            .where('id', '=', rows[0])
            .first(),
        )
        .then(row => Object.assign(phone, row)),
    ),
  );

  const insertedConversations = await Promise.all(
    conversations.map((conversation, pos) =>
      db
        .table('conversations')
        .insert(conversation)
        .returning('id')
        .then(rows =>
          db
            .table('conversations')
            .where('id', '=', rows[0])
            .first()
            .then(c =>
              Promise.all([
                db.table('conversations_phonenumbers').insert({
                  conversation_id: c.id,
                  phone_id: insertedNumbers[pos % insertedNumbers.length].id,
                }),
                db.table('conversations_phonenumbers').insert({
                  conversation_id: c.id,
                  phone_id: insertedNumbers[(pos + 1) % insertedNumbers.length].id,
                }),
              ]).then(() => c),
            ),
        )
        .then(row => Object.assign(conversation, row)),
    ),
  );

  await Promise.all(
    messages.map(message =>
      db.table('messages').insert(
        Object.assign({}, message, {
          conversation_id:
            insertedConversations[Math.floor(Math.random() * insertedConversations.length)].id,
          phone_id: insertedNumbers[Math.floor(Math.random() * insertedNumbers.length)].id,
        }),
      ),
    ),
  );

  await Promise.all(
    users.map((user, pos) =>
      db
        .table('users')
        .insert(user)
        .returning('id')
        .then(rows =>
          db
            .table('users')
            .where('id', '=', rows[0])
            .first()
            .then(u =>
              db
                .table('phonenumbers_users')
                .insert({
                  user_id: u.id,
                  phone_id: insertedNumbers[pos % insertedNumbers.length].id
                    ? insertedNumbers[pos].id
                    : insertedNumbers[pos % 2].id,
                })
                .then(() => u),
            ),
        )
        .then(row => Object.assign(user, row)),
    ),
  );
}
