import * as fs from 'fs';
import * as Joi from 'joi';
import * as knex from 'knex';
import * as path from 'path';
import * as program from 'commander';
import * as yaml from 'js-yaml';

import { PhoneNumberController } from '../src/controllers';
import { PhoneType } from '../src/@types';

program
  .command('purchase')
  .option('-a, --area-code [code]', 'Optional area code')
  .option('-c, --count <count>', 'How many numbers to purchase')
  .option('-d, --dry-run', 'If true, return list of numbers but do not purchase them')
  .option('-o, --org <org>', 'Organization to purchase numbers for')
  .option('-s, --stage <stage>', 'Stage to purchase numbers for', /^production|staging|uplink-prod|qa|integration$/)
  .option('-t, --type <type>', 'Type of numbers', /^Contact|User$/)
  .action(async (cmd) => {
    cmd.areaCode = typeof cmd.areaCode === 'string' ? parseInt(cmd.areaCode, 10) : undefined;
    cmd.count = typeof cmd.count === 'string' ? parseInt(cmd.count, 10) : undefined;

    const options: any = {
      area_code: cmd.areaCode,
      count: cmd.count,
      stage: cmd.stage,
      type: cmd.type,
    };

    if (cmd.org) {
      options.org = cmd.org;
    }

    // Throws if the options don't match either of the following schemas
    Joi.assert(options, Joi.alternatives().try(
      Joi.object().keys({
        area_code: Joi.number().integer().min(0).max(999),
        count: Joi.number().integer().min(0).max(50).required(),
        stage: Joi.string().allow('production', 'staging', 'uplink-prod', 'qa', 'integration').required(),
        // The "Contact" schema will throw if the "org" argument is passed
        type: Joi.string().allow('Contact').required(),
      }),
      Joi.object().keys({
        area_code: Joi.number().integer().min(0).max(999),
        count: Joi.number().integer().min(0).max(50).required(),
        // The "User" schema requires the "org" argument to be present
        org: Joi.string().min(1).required(),
        stage: Joi.string().allow('production', 'staging', 'uplink-prod', 'qa', 'integration').required(),
        type: Joi.string().allow('User').required(),
      }),
    ));

    // Since several of the dependent modules read from process.env as soon as they are instantiated, we must load the environment before instantiating them.
    // This must be done manually since YAML environments are only loaded by default in the Serverless environment.
    process.env = Object.assign({}, process.env, yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, `../../../config/${options.stage}/env.yml`), 'utf8')).UPLINK);

    const connection = knex(require('../src/database/knexfile').default);
    const pnc = new PhoneNumberController(connection);
    console.log(`Purchasing ${options.count} ${options.type} numbers${options.area_code === undefined ? '' : ` with the ${options.area_code} area code`} in the ${options.stage} stage${options.type === 'User' ? ` for the ${options.org} Organization` : ''}...`);
    await pnc.batchCreate({
      amount: cmd.count,
      options: {
        area_code: cmd.areaCode,
      },
      organization_id: cmd.org,
      type: cmd.type === 'Contact' ? PhoneType.CONTACT : PhoneType.UNASSIGNED,
    });
    console.log('Finished');
  });

program.parse(process.argv);