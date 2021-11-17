import chalk from 'chalk';

const red = (str: string) => { console.log(chalk.red(str)); };
const gray = (str: string) => { console.log(chalk.gray(str)); };
const blue = (str: string) => { console.log(chalk.blue(str)); };
const cyan = (str: string) => { console.log(chalk.cyan(str)); };
const white = (str: string) => { console.log(chalk.white(str)); };
const green = (str: string) => { console.log(chalk.green(str)); };
const yellow = (str: string) => { console.log(chalk.yellow(str)); };
const magenta = (str: string) => { console.log(chalk.magenta(str)); };

const dim = gray;
const info = (str: string) => { cyan(`! ${str}`); };
const err = (str: string) => { red(`✘ ${str}`); };
const error = (str: string) => { red(`✘ ${str}`); };
const warn = (str: string) => { yellow(`⚠ ${str}`); };
const warning = (str: string) => { yellow(`⚠ ${str}`); };
const succeed = (str: string) => { green(`✔ ${str}`); };
const success = (str: string) => { green(`✔ ${str}`); };

export { red };
export { gray };
export { blue };
export { cyan };
export { white };
export { green };
export { yellow };
export { magenta };

export { dim };
export { info };
export { err };
export { error };
export { warn };
export { warning };
export { succeed };
export { success };