const nunjucks = require('nunjucks');

/*
Usage:

const RulesEngine = require('LTAppAPI/utils/rules');

const rules = [{
  criteria: ['data.name == "chris"'],
  grouping: 'ALL'
}];

const isValid = RulesEngine.validate(rules);

const result = RulesEngine.test(rules, {
  name: 'chris'
});

// result == true

*/

exports.validate = function (rules, options) {
  options = options || {};

  if (Array.isArray(rules)) {
    const allValid = rules.find((childRules) => {
      return !exports.validate(childRules);
    }) === undefined;

    return allValid;
  }

  if (!(Array.isArray(rules.criteria) && typeof rules.grouping === 'string')) {
    return false;
  }

  if (options.requireResult && !rules.result) {
    return false;
  }

  if (rules.children) {
    if (!Array.isArray(rules.children)) {
      return false;
    }

    const hasInvalid = rules.children.find((childRules) => {
      return !exports.validate(childRules, { requireResult: true });
    }) !== undefined;

    if (hasInvalid) {
      return false;
    }
  }

  if (rules.grouping === 'ALL' || rules.grouping === 'ANY') {
    return true;
  }
  const criteriaCount = rules.criteria.length;
  const matches = rules.grouping.match(/\d+/g);
  if (!matches || matches.length === 0) {
    return false;
  }

  const hasInvalidMatch = matches.find((match) => {
    return (match < 1 || Number(match) > criteriaCount);
  }) !== undefined;
  if (hasInvalidMatch) {
    return false;
  }

  const validTokensRemoved = rules.grouping.replace(/ |AND|OR|\(|\)|(\d+)/g, '');
  if (validTokensRemoved !== '') {
    return false;
  }

  return true;
};

exports.test = function (rules, data) {
  if (Array.isArray(rules)) {
    const results = rules.map((childRules) => {
      return exports.test(childRules, data);
    });

    const result = results.reduce((arr, entry) => {
      if (Array.isArray(entry)) {
        entry.forEach((e) => {
          arr.push(e);
        });
      } else {
        arr.push(entry);
      }
      return arr;
    }, []);

    return result;
  }
  
  const criteria = rules.criteria.map(c => {
    const rx = new RegExp(/pod.(\d+)/, 'g');
    c = c.replace(/{{/g, '').replace(/}}/g, '').trim().replace(rx, "pod['$1']");

    return `(${c})`;
  });

  let compiled;
  if (rules.grouping === 'ALL') {
    compiled = criteria.join(' and ');
  } else if (rules.grouping === 'ANY') {
    compiled = criteria.join(' or ');
  } else {
    compiled = rules.grouping
      .replace(/AND/i, 'and')
      .replace(/OR/i, 'or')
      .replace(/(\d+)/, '>>RULE:$1<<');

    compiled = criteria.reduceRight((out, criterion, idx) => {
      return out.replace(`>>RULE:${idx + 1}<<`, criterion);
    }, compiled);
  }
  
  if (compiled === '') {
    compiled = ' true ';
  }

  const templateData = `{%if ${compiled} %}true{%else%}false{%endif%}`;
  const response = nunjucks.renderString(templateData, data);

  const success = response === 'true';
  let result = success;

  if (rules.result) {
    result = [];
    if (success) {
      result.push(rules.result);

      if (rules.children) {
        rules.children.forEach((child) => {
          const childResult = exports.test(child, data);
          if (!Array.isArray(childResult)) {
            throw new Error("'children' rules must have 'result' set");
          }
          childResult.forEach((it) => {
            result.push(it);
          });
        });
      }
    }
  }

  return result;
};

