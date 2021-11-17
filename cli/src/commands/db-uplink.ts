import * as commander from 'commander';
import * as inquirer from 'inquirer';
import * as Knex from 'knex';
import * as Ora from 'ora';
import * as print from '../util/print';
import seed from '../util/seedUplink';
import * as env from 'dotenv';

env.config({
  path: './env.uplink.cli',
});

interface IAnswers {
  organization: string;
}

const config = {
  client: 'mysql',
  connection: {
    // Change these to env values to run `knex seed:run`
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_DATA,
  },
  migrations: {
    directory: '../uplink/api/src/database/migrations',
  },
};

let db: Knex;

commander.version('1.0.0', '-v, --version').name('Uplink Database Utilities CLI');

commander
  .command('version')
  .description('The current version of the database')
  .action(async () => {
    try {
      db = Knex(config);
      await db.migrate
        .currentVersion({
          database: process.env.DATABASE_DATA,
          directory: '../uplink/api/src/database/migrations',
        })
        .then(res => print.cyan(res));
    } catch (error) {
      throw new Error(error);
    } finally {
      db.destroy();
    }
  });

commander
  .command('migrate:make')
  .description('Create a new knex migration')
  .action(async () => {
    try {
      db = Knex(config);
      await db.migrate.make(process.argv[3] || 'new');
      print.success(`New ${process.argv[3] || 'new'} migration created`);
    } catch (error) {
      throw new Error(error);
    } finally {
      db.destroy();
    }
  });

commander
  .command('migrate:latest')
  .description('Run the latest migration')
  .action(async () => {
    try {
      db = Knex(config);
      await db.migrate.latest({
        database: process.env.DATABASE_DATA,
        directory: '../uplink/api/src/database/migrations',
      });
      print.success('Migration run');
    } catch (error) {
      throw new Error(error);
    } finally {
      db.destroy();
    }
  });

commander
  .command('rollback')
  .description('Rollback last migration')
  .action(async () => {
    try {
      db = Knex(config);
      await db.migrate.rollback({
        database: process.env.DATABASE_DATA,
        directory: '../uplink/api/src/database/migrations',
      });
      print.success('Latest migration rolled back');
    } catch (error) {
      throw new Error(error);
    } finally {
      db.destroy();
    }
  });

commander
  .command('seed')
  .description('Create seed data for specified organization')
  .action(async () => {
    try {
      db = Knex(config);
      const answers = (await inquirer.prompt([
        {
          type: 'input',
          name: 'organization',
          message: 'Enter the organization',
        },
      ])) as IAnswers;
      const spinner = new Ora(`Creating seed data...`).start();
      await seed(db, answers);
      spinner.stop();
      print.success(`Seed data created for ${answers.organization}`);
    } catch (error) {
      throw new Error(error);
    } finally {
      db.destroy();
    }
  });

commander.parse(process.argv);
