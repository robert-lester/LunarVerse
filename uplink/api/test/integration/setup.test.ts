import * as compose from 'docker-compose';
import * as Knex from 'knex';
import * as path from 'path';
import * as shell from 'shelljs';
import * as execSQL from 'exec-sql';
import { configureTestEnvironment } from '../setupUtils';
import { before, beforeEach, afterEach } from 'mocha';

const databaseHost = process.env.DATABASE_HOST || 'localhost';
const databasePassword = process.env.DATABASE_PASS || 'lunarr0cks!!';
const databasePort = +process.env.DATABASE_PORT || 3306;
const databaseUser = process.env.DATABASE_USER || 'uplink';
const databaseLoadWait = +process.env.DATABASE_LOAD_WAIT || 45; // in seconds
const databaseName = process.env.DATABASE_DATA || 'uplink';
const testPath = path.join(__dirname);

let knex: Knex;

// https://mochajs.org/#root-level-hooks
// setup
before(async function() {
    compose.upAll({ cwd: path.join(__dirname), log: true });

    process.env = configureTestEnvironment();
    const knexFilePath = path.join(__dirname, '../../src/database/knexfile.ts');
    knex = Knex(require(knexFilePath).default);

    const sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    process.stdout.write(`Waiting ${databaseLoadWait} seconds for database to spin up.`);
    let sleepCount = databaseLoadWait;

    // A smarter solution would implement a check to determine if all the
    // dependent services are ready to rock. This waits for a bit to allow
    // the containers (i.e. database, redis) to spin up.
    while (sleepCount !== 0) {
        await sleep(1000);
        process.stdout.write('.');
        sleepCount--;
    }
    console.info('');
});

beforeEach(() => new Promise((resolve) => {
    knex.transaction((trx) => {
        (global as any).transaction = trx;
        resolve();
    // The "catch" here is necessary, otherwise rolling back the transaction will throw an error
    }).catch(() => {});
}));

afterEach(async () => {
    await (global as any).transaction.rollback();
});

/**
 * Executes a sql script in the test path
 * @param fileName The name of SQL script to execute
 * @return  An object with the return code, stdout, and stderr
 */
export async function execSqlScript(fileName: string): Promise<void> {
    const filePath = path.join(testPath, fileName);
    if (! shell.test('-e', path.join(filePath))) {
        throw new Error(`File ${fileName} does not exist at ${filePath}`);
    }

    execSQL.connect({
        'host': databaseHost,
        'password': databasePassword,
        'user': databaseUser,
        'port': databasePort,
        'database': databaseName
    });

    await execSQL.executeFile(filePath).catch(err => {
        execSQL.disconnect();
        throw new Error(err);
    });

    execSQL.disconnect();
}

/**
 * @name resetDb
 * @description Syntactic sugar around the executeSqlScript for resetting the database
 * @returns {void}
 */
export async function resetDb() {
    try {
        await execSqlScript('./init/uplink_db_init.sql');
    } catch (error) {
        throw new Error(error && error.message ? error.message : 'Error Resetting Database - [uplink/api/test/integration/setup.test.ts]');
    }
};