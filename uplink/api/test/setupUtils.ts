import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export function configureTestEnvironment(): NodeJS.ProcessEnv {
    // Reads the stage configuration environment file
    // Validates the result is a properly formatted YAML document
    // Adds the settings into the process environment
    return Object.assign({}, process.env, yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../../../config/test/env.yml'), 'utf8')).UPLINK);
}