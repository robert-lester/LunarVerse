import * as Nunjucks from 'nunjucks';
import * as customFilters from './nunjucks-extensions/filters';
import { MappableData } from '.';

const nunjucksEnvironment = new Nunjucks.Environment();

customFilters.forEach((filter) => {
  nunjucksEnvironment.addFilter(filter.name, filter.func as any);
});

export default abstract class IntakeUtils {
  /**
   * Pre-process a Nunjucks template to replace all dot-notated keys beginning with integers with bracket notation
   * @param nunjucksTemplate The initial Nunjucks template
   * @returns The processed Nunjucks template
   */
  public static fixIntegerDotNotation(nunjucksTemplate: string): string {
    let bracketDepth = 0;
    let currentQuoteBoundary = '';
    let rendered = '';

    for (let i = 0; i < nunjucksTemplate.length; i += 1) {
      const char = nunjucksTemplate[i];

      if (currentQuoteBoundary === '') {
        // If we're not in quotes, we want to keep track of nested bracket depth since variables can only be inside bracketed expressions
        if (['{%', '{{'].includes(nunjucksTemplate.slice(i, i + 2))) {
          bracketDepth += 1;
          rendered += nunjucksTemplate.slice(i, i + 2);
          i += 1;
        } else if (bracketDepth > 0) {
          if (['%}', '}}'].includes(nunjucksTemplate.slice(i, i + 2))) {
            bracketDepth -= 1;
            rendered += nunjucksTemplate.slice(i, i + 2);
            i += 1;
          } else if (['\'', '"', '`'].includes(char)) {
            currentQuoteBoundary = char;
            rendered += char;
          } else if (char === '.') {
            const indexMatch = nunjucksTemplate.slice(i + 1).match(/^\d[_\-$a-zA-Z\d]*/);

            if (indexMatch === null) {
              rendered += '.';
            } else {
              const indexString = `["${indexMatch[0]}"]`;
              rendered += indexString;
              i += (indexString.length - 4);
            }
          } else {
            rendered += char;
          }
        } else {
          rendered += char;
        }
      // Ignore all quoted characters except the current boundary (so we can close the quote)
      } else {
        if (char === currentQuoteBoundary) {
          currentQuoteBoundary = '';
        }
        rendered += char;
      }
    }
    return rendered;
  }

  public static flattenArrays(arrs: any[][]): any[] {
    return [].concat(...arrs);
  }

  public static recursivelyGetDestinationIDs(nodes: any[]): number[] {
    return IntakeUtils.flattenArrays(Array.from(new Set(nodes.map(
      (node) => (node.result || [])
        .concat(IntakeUtils.recursivelyGetDestinationIDs(node.children || [])),
    ))));
  }

  public static renderString(nunjucksTemplate: string, data: MappableData): string {
    return nunjucksEnvironment.renderString(IntakeUtils.fixIntegerDotNotation(nunjucksTemplate), data);
  }

  public static uniqueArray(arr: any[]): any[] {
    return Array.from(new Set(arr));
  }
}
