import * as faker from 'faker';
import * as Knex from 'knex';
import Airlock from '../../../lib/airlock';
import { mapping } from './generate';
import { IAnswers } from '../../types/util/seed';

export default async function seed(db: Knex, answers: IAnswers): Promise<void> {
  const { pods, organization, sources } = answers;
  const organization_id = organization.toLowerCase().replace(/ /g, '-');
  const airlock: Airlock = new Airlock(`alias/shuttle/airlock/demo/lunar`);

  // Clean up seed organization
  await Promise.all([
    db('destinations')
      .where('organization_id', organization_id)
      .del(),
    db('fields')
      .where('organization_id', organization_id)
      .del(),
    db('pods')
      .where('organization_id', organization_id)
      .del(),
    db('sources')
      .where('organization_id', organization_id)
      .del(),
    db('tags')
      .where('organization_id', organization_id)
      .del(),
  ]);

  // Static fields for simplicity
  const fieldsStaged = [
    {
      archived: false,
      name: 'FirstName',
      organization_id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      archived: false,
      name: 'LastName',
      organization_id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      archived: false,
      name: 'Phone',
      organization_id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      archived: false,
      name: 'Email',
      organization_id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  // Create destinations boilerplate
  let destinationsStaged = Array.from({ length: 5 }).map((_: any, i: number) => {
    const base = {
      config: {},
      mapping: {},
      organization_id,
      validation: {},
      archived: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    switch (i) {
      case 0:
        return {
          ...base,
          name: `${organization} email`,
          type: 'email',
        };
      case 1:
        return {
          ...base,
          config: {
            title: `${organization} Sheet`,
            sheetId: faker.random.uuid(),
          },
          name: `${organization} google sheets`,
          type: 'google sheets',
        };
      case 2:
        return {
          ...base,
          name: `${organization} post`,
          type: 'post',
        };
      case 3:
        return {
          ...base,
          name: `${organization} salesforce`,
          type: 'salesforce',
        };
      case 4:
        return {
          ...base,
          name: `${organization} slack`,
          type: 'slack',
        };
    }
  });

  // Create sources boilerplate
  let sourcesStaged = Array.from({ length: parseInt(sources, 10) }).map(() => ({
    api_key: faker.random.uuid(),
    name: `${organization} ${faker.name.jobArea()}`,
    organization_id,
    mapping: null,
    fields: fieldsStaged.map(field => field.name),
    router: null,
    archived: false,
    form: {
      layout: [
        [
          {
            customName: false,
            label: 'FirstName',
            name: 'FirstName',
            type: 'input',
            validation: { required: false },
            allowableParentConditionFields: ['Select'],
            allowableParentOptions: ['Select'],
            row: '1',
            col: '1',
            allowedRows: [1],
            allowedCols: [1],
            canChangeRow: false,
            canChangeCol: false,
            isConditionallyVisible: false,
            relayFieldId: null,
            relayFieldName: 'Select',
            visibilityConditionOption: null,
            visibilityConditionOptions: [],
            visibilityConditionParent: null,
          },
          {
            customName: false,
            label: 'LastName',
            name: 'LastName',
            type: 'input',
            validation: { required: false },
            allowableParentConditionFields: ['Select'],
            allowableParentOptions: ['Select'],
            row: '1',
            col: '2',
            allowedRows: [1, 2],
            allowedCols: [1, 2],
            canChangeRow: true,
            canChangeCol: true,
            isConditionallyVisible: false,
            relayFieldId: null,
            relayFieldName: 'Select',
            visibilityConditionOption: null,
            visibilityConditionOptions: [],
            visibilityConditionParent: null,
          },
        ],
        [
          {
            customName: false,
            label: 'Email',
            name: 'Email',
            type: 'input',
            validation: { required: true, preset: 'Email' },
            allowableParentConditionFields: ['Select'],
            allowableParentOptions: ['Select'],
            row: '2',
            col: '1',
            allowedRows: [1, 2],
            allowedCols: [1],
            canChangeRow: true,
            canChangeCol: false,
            isConditionallyVisible: false,
            relayFieldId: '32',
            relayFieldName: 'Email',
            visibilityConditionOption: null,
            visibilityConditionOptions: [],
            visibilityConditionParent: null,
          },
        ],
      ],
      theme: {
        'background-color': '#ffffff',
        'button-color': '#cccccc',
        'font-color': '#000000',
        'font-family': 'Arial, Helvetica, sans-serif',
        'font-size': '16px',
      },
      rules: [],
    },
    created_at: new Date(),
    updated_at: new Date(),
  }));

  const insertedFields = await Promise.all(
    fieldsStaged.map(field =>
      db
        .table('fields')
        .insert(field)
        .returning('id')
        .then(rows =>
          db
            .table('fields')
            .where('id', '=', rows[0])
            .first(),
        )
        .then(row => Object.assign({}, field, row)),
    ),
  );

  const emailField = insertedFields.find(f => f.name === 'Email');
  const firstNameField = insertedFields.find(f => f.name === 'FirstName');
  const lastNameField = insertedFields.find(f => f.name === 'LastName');
  const phoneField = insertedFields.find(f => f.name === 'Phone');
  const availableCriteria = [
    `{{ \"407\" in pod.${phoneField.id} }}`,
    `{{ pod.${firstNameField.id} !== '' }}`,
    `{{ pod.${emailField.id} !== '' }}`,
    `{{ pod.${lastNameField.id} !== '' }}`,
  ];

  destinationsStaged = destinationsStaged.map((dest: any) => {
    switch (dest.type) {
      case 'email':
        return {
          ...dest,
          config: {
            to: faker.internet.exampleEmail(),
            replyTo: 'donotreply@belunar.com',
            subject: `${organization} email`,
            body: `Email Address: {{ pod.${emailField.id} }}\n
                    Name: {{ pod.${firstNameField.id} }}
                    {{ pod.${lastNameField.id} }}\n
                    Phone Number: {{ pod.${phoneField.id} }}`,
          },
          validation: {
            criteria: [`{{ pod.${emailField.id} !== '' }}`],
            grouping: 'ANY',
          },
        };
      case 'post':
        return {
          ...dest,
          config: {
            dataType: 'form',
            httpAuthEnabled: false,
            httpAuthUser: '',
            httpAuthPassword: '',
            postingURL: faker.internet.url(),
          },
          mapping: mapping(insertedFields),
          validation: {
            criteria: [availableCriteria[Math.floor(Math.random() * availableCriteria.length)]],
            grouping: 'ANY',
          },
        };
      case 'slack':
        return {
          ...dest,
          config: {
            channel: `@${faker.commerce.department()}`,
            from: `${organization} slackbot`,
            message: `New contact {{ pod.${firstNameField.id} }} {{ pod.${lastNameField.id} }}`,
            webhook:
              'https://hooks.slack.com/services/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',
            to: faker.internet.userName(),
          },
        };
      case 'salesforce':
        return {
          ...dest,
          mapping: insertedFields.reduce((prev, curr) => {
            prev[curr.id] = [`${faker.helpers.slugify(curr.name).replace(' ', '_')}__c`];
            return prev;
          }, {}),
        };
      default:
        return dest;
    }
  });

  const insertedDestinations = await Promise.all(
    destinationsStaged.map(dest =>
      db
        .table('destinations')
        .insert({
          ...dest,
          config: JSON.stringify(dest.config),
          mapping: JSON.stringify(dest.mapping),
          validation: JSON.stringify(dest.validation),
        })
        .returning('id')
        .then(rows =>
          db
            .table('destinations')
            .where('id', '=', rows[0])
            .first(),
        )
        .then(row => Object.assign({}, dest, row)),
    ),
  );

  sourcesStaged = sourcesStaged.map(source => {
    let randomCriteria = availableCriteria;
    let length = randomCriteria.length;
    while (length) {
      const index = Math.floor(Math.random() * length--);
      [randomCriteria[length], randomCriteria[index]] = [
        randomCriteria[index],
        randomCriteria[length],
      ];
    }
    return {
      ...source,
      mapping: insertedFields.reduce((prev, curr) => {
        prev[curr.id] = `{{ pod.${faker.helpers.slugify(curr.name).replace('-', '')} }}`;
        return prev;
      }, {}),
      router: [
        {
          children: [],
          criteria: [randomCriteria[0], randomCriteria[1]],
          grouping: 'ANY',
          result: [
            insertedDestinations[Math.floor(Math.random() * insertedDestinations.length)].id,
          ],
        },
      ],
    };
  });

  const insertedSources = await Promise.all(
    sourcesStaged.map(source =>
      db
        .table('sources')
        .insert({
          ...source,
          fields: JSON.stringify(source.fields),
          form: JSON.stringify(source.form),
          mapping: JSON.stringify(source.mapping),
          router: JSON.stringify(source.router),
        })
        .returning('id')
        .then(rows =>
          db
            .table('sources')
            .where('id', '=', rows[0])
            .first(),
        )
        .then(row => Object.assign({}, source, row)),
    ),
  );

  const podsStaged = await Promise.all(
    Array.from({ length: parseInt(pods, 10) }).map(async () => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const encrypted = await airlock.encrypt(
        JSON.stringify({
          FirstName: firstName,
          LastName: lastName,
          Phone: faker.phone.phoneNumberFormat(0).replace(/-/g, ''),
          Email: `${firstName}_${lastName}@demo.com`,
        }),
      );
      return {
        encrypted,
        encryption_version: 1,
        metadata: JSON.stringify({
          telecope: {
            id: '',
            visitor_uid: '',
            visit_uid: '',
            event_uid: '',
          },
        }),
        organization_id,
        source_id: insertedSources[Math.floor(Math.random() * insertedSources.length)].id,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }),
  );

  await Promise.all(
    podsStaged.map(pod =>
      db
        .table('pods')
        .insert(pod)
        .returning('id')
        .then(rows =>
          db
            .table('pods')
            .where('id', '=', rows[0])
            .first()
            .then(p =>
              Promise.all(
                Array.from({ length: Math.floor(Math.random() * 3 + 1) }).map(() =>
                  db.table('responses').insert({
                    pod_id: p.id,
                    destination_id:
                      insertedDestinations[Math.floor(Math.random() * insertedDestinations.length)]
                        .id,
                    raw_message: JSON.stringify({
                      RequestId: faker.random.uuid(),
                    }),
                    status_code: 200,
                    created_at: new Date(),
                    updated_at: new Date(),
                  }),
                ),
              ).then(() => p),
            ),
        )
        .then(row => Object.assign({}, pod, row)),
    ),
  );

  return;
}
