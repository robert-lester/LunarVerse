#!/usr/bin/env ts-node
import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as print from '../util/print';
import * as shell from 'shelljs';
import { sleep } from 'sleep';
import * as yaml from 'js-yaml';

/**
 * @file Implements a wrapper around the knex migration CLI
 * @see https://knexjs.org/#Installation-migrations
 *
 * This wrapper imports information from a Lunar environment and passes
 * that information to the knex migrations CLI. Database connection
 * parameters are imported from the Lunar app environment and written
 * to the knexfile.js configuration. The knex CLI is invoked with a
 * generated knexfile and all other command line arguments.
 *
 * Example:
 *     knex.ts --stage qa wrap migrate:make <migration_name>
 *
 * By default, the app name is 'UPLINK' and the stage is 'test'.
 */
const knexPath = shell.which('knex');
if (! knexPath) {
    print.error('The knex command line utility must be installed! try `yarn gloabl add knex`');
    process.exit(1);
}

/**
 * This command sources application settings from a named environment
 * declared in YAML configuration file e.g. config/qa/env.yml.
 */
enum LunarAppsNames {
    Uplink = 'UPLINK',
    Default = Uplink,
}

// Wrapper commands operate relative to the root of Lunar Apps repository
const defaultBuildPath = `${path.resolve(__dirname, '../../../')}`;
const defaultCwd = `${defaultBuildPath}/uplink/api`;
const defaultDbPath = `${defaultCwd}/src/database`;

// Get the knex CLI version information before setting up processing
// of command line arguments. The wrapper version matches the knex
// CLI version.
const version = shell.exec(`${knexPath} --version`, { silent: true, async: false });
if (version.stderr !== '') {
    print.error(`Failed to get the knex CLI version because \"${version.stderr}\"`);
    process.exit(1);
}

commander
    .version(`${version.stdout}`, '-V, --version')
    .usage('[options] [command]')
    .description('Wraps knex cli passing environment settings from application stage')
    .option('-a, --app <name>', `application name defaults to ${LunarAppsNames.Default}`)
    .option('-b, --buildpath <name>', 'relative path to the root of Lunar Apps repository')
    .option('-c, --cwd <name>', 'path to a project directory such as uplink, core, shuttle, etc')
    .option('-d, --dbpath <path>', 'migrations are stored relative to the current working directory defaults to src/database')
    .option('--debugknex', 'enables knex debugging')
    .option('--debugmysql', 'enables mysql debugging')
    .option('--disablessl', 'disable nodejs/mysql attempts to connect via an SSL session')
    .option('--dryrun', 'print verbose without running knex')
    .option('-k, --keep', 'generate and keep knex configuration file (i.e. knexfile.js)')
    .option('-s, --stage <name>', 'application stage defaults to test')
    .option('--verbose', 'print more information to stdout')
    .on('--help', () => {
        // Appends the knex CLI help to the wrapper help
        print.info('------------------------------------------------------------------------------');
        print.info(shell.exec(`${knexPath} --help`, { silent: true }).stdout as string);
        process.exit(0);
    })
    // Error on unknown commands
    .on('command:*', () => {
        print.error(`Unrecognized command: ${commander.args.join(' ')}\nSee --help for a list of available commands.'`);
        process.exit(1);
    });

commander
    .command('migrate:snapshot')
    .description('Spins up a local database, runs latest migrations, and takes a snapshot')
    .option('-l, --loadwait <seconds>', 'wait for <seconds> to allow database to initialize defaults 20')
    .option('-o, --snapshotout <path>', 'relative path to snapshot file based on current working directory')
    .action(migrateSnapshot);

commander
    .command('wrap [knexArgs...]')
    .description('Executes a locally installed knex cli with the given [knexArgs...]')
    .action(wrapKnex);

// If no arguments are provided, output the help text
if (!process.argv.slice(2).length) {
    commander.outputHelp();
}

// Parse commands and options and do command actions. Then exit.
commander.parse(process.argv);
process.exit(0);

/**
 * Executes 'docker-compose' CLI to spin up the database container
 * @param options Examines options.verbose to determine what information to print to stdout
 * @param loadwait How many seconds to wait for the database container to fully spin up
 */
function dockerComposeUp(options: any, loadwait: number): void {
    if (! shell.which('docker-compose')) {
        throw Error('docker-compose is required to take spin up the database and do knex migrate:latest!');
    }

    // Attempt docker-compose up; on fail throw an error message
    shell.exec('docker-compose up', { silent: !options.verbose }, (code, stdout, stderr) => {
        if (code !== 0) {
            throw Error(stderr);
        }
    });

    // A smarter solution would implement a check to determine
    // if the database is ready to rock. This waits for a bit to
    // allow the container and database to spin up.
    // In theory, the use of sleep is discouraged. In practice, KISS it bud.
    process.stdout.write(`Waiting ${loadwait} seconds for database to spin up`);

    // Prints a waiting indicator to stdout
    let sleepcount = 0;
    while (sleepcount < loadwait) {
        sleep(1);
        sleepcount++;
        process.stdout.write('.');
    }
    print.info('');
}

/**
 * Executes 'docker-compose' CLI to bring down the container and clean up container volumes
 * @param options Examines options.verbose to determine what information to print to stdout
 */
function dockerComposeDown(options: any): void {
    // Bring down the database container and remove named volumes
    shell.exec('docker-compose down --volumes', { silent: !options.verbose });
}

/**
 * Executes 'knex' CLI to run latest migrations against the database
 */
function runLatestMigrations(): void {
    wrapKnex(['migrate:latest']);
}

/**
 * Writes a snapshot of the database (i.e. a SQL script) to the filesystem
 * @param options Examines options.verbose to determine what information to print to stdout
 * @param snapshotout Where to store database dump. Path and filename is relative to this script.
 */
function takeSnapshot(options: any, snapshotout = ''): void {
    if (! shell.which('mysqldump')) {
        throw Error('mysqldump is required to take a snapshot of the database!');
    }

    if (snapshotout.length === 0) {
        // The name of SQL script includes a timestamp
        snapshotout = `db_snapshot_${(new Date()).valueOf()}.sql`;
    }

    // The path to the snapshot file is relative to this script
    const outfile = path.resolve('.', `${options.cwd}/${snapshotout}`);

    if (options.verbose) {
        print.info(`snapshot outfile: ${outfile}`);
    }

    print.info(`Writing database snapshot to file: '${outfile}'`);

    // The arguments to mysqldump were arrived at empirically. When connecting
    // to localhost, mysqldump attempts to connect through a unix socket first
    // and '--protocol tcp' overrides that. '--skip-extended-insert' breaks
    // SQL insert statements into multiple lines. Turns out there is a maximum
    // SQL insert line length. The latest mysqldump has a flag that nots fully
    // and '--column-statistics=0' disable that. The snapshot saves stored
    // procedures and event triggers. '--single-transaction' executes the dump
    // transactionally keeping the database consistent.
    const mysqlExec = `mysqldump --protocol tcp -h${process.env.DATABASE_HOST} -u${process.env.DATABASE_USER} -p${process.env.DATABASE_PASS} `
        + `--databases --skip-extended-insert --skip-quick --complete-insert --column-statistics=0 -R --triggers --single-transaction uplink > ${outfile}`;

    if (options.verbose || options.dryrun) {
        print.info(mysqlExec);
    }

    if (! options.dryrun) {
        const result = shell.exec(mysqlExec, { silent: !options.verbose }) as shell.ExecOutputReturnValue;
        if (result.code !== 0) {
            throw Error(result.stderr);
        }
    }
}

/**
 * A command action that spins up a database, runs the latest migrations, and takes a snapshot.
 * @param cmd Is passed by commander to this action. The cmd contains command options.
 */
function migrateSnapshot(cmd: any): void {
    // Get the commander options values
    const options = validateProgramOptions();

    if (options.app !== LunarAppsNames.Uplink) {
        print.error(`${cmd.name} is only valid for ${LunarAppsNames.Uplink} application`);
        process.exit(1);
    }

    // Load application settings into this processes environment
    loadProcessEnv(options);

    const loadwait = cmd.loadwait ? cmd.loadwait : 20;
    const snapshotout = cmd.snapshotout ? cmd.snapshotout : '';

    if (options.verbose) {
        print.info(`loadwait: ${loadwait}`);
        print.info(`snapshot filename: ${snapshotout}`);
    }

    // On a keyboard interrupt or terminate signal bring down the container
    process.on('SIGINT', () => {
        dockerComposeDown(options);
        process.exit(0);
    });

    // On a keyboard interrupt or terminate signal bring down the container
    process.on('SIGTERM', () => {
        dockerComposeDown(options);
        process.exit(0);
    });

    try {
        dockerComposeUp(options, loadwait);

        runLatestMigrations();

        takeSnapshot(options, snapshotout);

        dockerComposeDown(options);
    } catch (err) {
        print.error(err);
        dockerComposeDown(options);
        process.exit(1);
    }
}

/**
 * Sets commander options to passed values or default values
 */
function validateProgramOptions(): any {
    // Get the stage and application environment name
    const options = {
        stage: commander.stage ? commander.stage : 'test',
        app: commander.app ? commander.app.toUpperCase() : LunarAppsNames.Default,
        buildpath: commander.buildpath ? commander.buildpath : defaultBuildPath,
        cwd: commander.cwd ? commander.cwd : defaultCwd,
        dbpath: commander.dbpath ? commander.dbpath : defaultDbPath,
        keep: commander.keep ? commander.keep : false,
        verbose: commander.verbose ? commander.verbose : false,
        dryrun: commander.dryrun ? commander.dryrun : false,
        disablessl: commander.disablessl ? commander.disablessl : false,
        debugknex: commander.debugknex ? commander.debugknex : false,
        debugmysql: commander.debugmysql ? commander.debugmysql : false,
    };

    if (options.verbose) {
        print.info(JSON.stringify(options, null, 4));
    }

    if (! fs.existsSync(path.resolve('.', options.buildpath))) {
        print.err(`The buildpath option path \"${options.buildpath}\" does not exist!`);
        process.exit(1);
    }

    if (! fs.existsSync(path.resolve('.', options.cwd))) {
        print.err(`The current working directory option path \"${options.cwd}\" does not exist!`);
        process.exit(1);
    }

    // Change to the current working directory for the duration of this script
    shell.cd(options.cwd);
    if (options.verbose) {
        print.info(`Changed directory into given CWD: ${process.cwd()}`);
    }

    if (! fs.existsSync(path.resolve('.', options.dbpath))) {
        print.err(`The database option path \"${options.cwd}\" does not exist!`);
        process.exit(1);
    }

    return options;
}

/**
 * Loads the Lunar application environment settings
 * @param options options.stage is used to find and load the environment file
 *                options.app is used to load the application environment (e.g. UPLINK)
 */
function loadProcessEnv(options: any): void {
    // Lunar Apps configuration settings are stored YAML files. Each stage
    // e.g. production, qa, staging has its own corresponding env.yml.
    const fileName = path.resolve(__dirname, `${options.buildpath}/config/${options.stage}/env.yml`);
    if (options.verbose) {
        print.info(`Sourcing \"${fileName}\" configuration...`);
    }
    const appEnv = (yaml.safeLoad(fs.readFileSync(fileName, 'utf8')))[options.app];
    process.env = Object.assign({}, process.env, appEnv);
}

/**
 * A command action that executes the 'knex' CLI
 * @param knexArgs Command line arguments to be passed into the 'knex' CLI
 */
function wrapKnex(knexArgs: string[]): void {
    // Get the commander options values
    const options = validateProgramOptions();

    // Load application settings into this processes environment
    loadProcessEnv(options);

    // Define a knex configuration file based on application environment
    // This format is generated by the 'knex' CLI with knex init
    const knexConfig = {};
    knexConfig[options.stage] = {
        client: 'mysql',
        connection: {
            user: process.env.DATABASE_USER,
            host: process.env.DATABASE_HOST,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_DATA,
        },
        debug: options.debugknex,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    };

    // If SSL is enabled, add the nodejs mysql ssl connection option
    if (! options.disablessl) {
        knexConfig[options.stage].connection.ssl = 'Amazon RDS';
    }

    if (options.debugmysql) {
        knexConfig[options.stage].connection.debug = true;
    }

    const knexConfigFile = `module.exports  = ${JSON.stringify(knexConfig, null, 4)};`;

    // Write the knex configuration file to the knex current working directory
    const knexFilePath = options.dbpath + '/knexfile.js';

    try {
        fs.writeFileSync(knexFilePath, knexConfigFile, 'utf8');

        // Construct a knex command
        const knexExec = `${knexPath} --knexfile ${knexFilePath} --env ${options.stage} --cwd ${options.dbpath} ${knexArgs.join(' ')}`;
        if (options.verbose || options.dryrun) {
            print.info(knexExec);
        }

        // Run the knex command
        if (! options.dryrun) {
            const result = shell.exec(knexExec, { silent: false }) as shell.ExecOutputReturnValue;
            if (result.code !== 0) {
                throw Error(result.stderr);
            }
        }
    } finally {
        // Remove the configuration file
        if (! options.keep) {
            shell.rm(knexFilePath);
        }
    }
}
