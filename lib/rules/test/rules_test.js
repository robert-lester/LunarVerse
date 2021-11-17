const Lab = require('lab');
const { test, validate } = require('../../utils/rules');

exports.lab = Lab.script();

const {
  describe,
  expect,
  it,
} = exports.lab;

describe('test', () => {
  it('executes basic rules', () => {
    const rules = {
      criteria: [
        'data.shoes == "banana"',
        '"IL" in data.states',
      ],
      grouping: 'ALL',
    };
    const data = {
      shoes: 'banana',
      states: ['IL'],
    };

    const result = test(rules, data);

    expect(result).to.be.true();
  });

  it('returns an array if "result" is set', () => {
    const rules = {
      criteria: [
        'data.shoes == "banana"',
        '"IL" in data.states',
      ],
      grouping: '1 AND (2 OR 2)',
      result: 'result1',
    };
    const data = {
      shoes: 'banana',
      states: ['IL'],
    };

    const result = test(rules, data);

    expect(result).to.equal(['result1']);

    data.shoes = 'apple';
    const result2 = test(rules, data);
    expect(result2).to.equal([]);
  });

  it('accepts an array of rules', () => {
    const rules = [
      {
        criteria: [
          'data.shoes == "banana"',
        ],
        grouping: 'ALL',
      },
      {
        criteria: [
          'data.shoes|length == 6',
          'data.states|length == 1',
        ],
        grouping: 'ALL',
      },
    ];
    const data = {
      shoes: 'banana',
      states: ['IL'],
    };

    const result = test(rules, data);

    expect(result).to.equal([true, true]);
  });

  it('accepts an array of rules with result IDs', () => {
    const rules = [
      {
        criteria: [
          'data.shoes == "banana"',
        ],
        grouping: 'ALL',
        result: 'result1',
      },
      {
        criteria: [
          'data.shoes|length == 6',
          'data.states|length == 1',
        ],
        grouping: 'ALL',
        result: 'result2',
      },
    ];
    const data = {
      shoes: 'banana',
      states: ['IL'],
    };

    const result = test(rules, data);
    expect(result).to.equal(['result1', 'result2']);

    rules[1].criteria[1] = 'data.states|length > 1';

    const result2 = test(rules, data);
    expect(result2).to.equal(['result1']);
  });

  it('accepts child rules in the "children" key', () => {
    const rules = [
      {
        criteria: [
          'data.shoes == "banana"',
        ],
        grouping: 'ALL',
        result: 'result1',
        children: [
          {
            criteria: [
              'data.shoes|length > 0',
            ],
            grouping: 'ALL',
            result: 'result3',
          },
        ],
      },
      {
        criteria: [
          'data.shoes|length == 6',
          'data.states|length == 1',
        ],
        grouping: 'ALL',
        result: 'result2',
      },
    ];
    const data = {
      shoes: 'banana',
      states: ['IL'],
    };

    const result = test(rules, data);
    expect(result).to.equal(['result1', 'result3', 'result2']);

    rules[1].criteria[1] = 'data.states|length > 1';

    const result2 = test(rules, data);
    expect(result2).to.equal(['result1', 'result3']);

    data.shoes = 'apple';

    // even through result3 is still true, because it is a child of result1 it does not get emitted
    const result3 = test(rules, data);
    expect(result3).to.equal([]);
  });

  it('does not allow children to be boolean rules', () => {
    const rules = [
      {
        criteria: [
          'data.shoes == "banana"',
        ],
        grouping: 'ALL',
        result: 'result1',
        children: [
          {
            criteria: [
              'data.shoes|length > 0',
            ],
            grouping: 'ALL',
          },
        ],
      },
      {
        criteria: [
          'data.shoes|length == 6',
          'data.states|length == 1',
        ],
        grouping: 'ALL',
        result: 'result2',
      },
    ];
    const data = {
      shoes: 'banana',
      states: ['IL'],
    };

    expect(() => {
      test(rules, data);
    }).to.throw();
  });
});

describe('validate', () => {
  it('accepts valid flat rules', () => {
    const rules = {
      criteria: [
        'data.shoes == "banana"',
        '"IL" in data.states',
      ],
      grouping: '1 AND (2 OR 2)',
    };

    const result = validate(rules);

    expect(result).to.be.true();
  });
  it('rejects invalid groupings', () => {
    const rules = {
      criteria: [
        'data.shoes == "banana"',
        '"IL" in data.states',
      ],
      grouping: '1 AND (2 OR 3)',
    };

    const result = validate(rules);

    expect(result).to.be.false();
  });

  it('accepts valid array rules', () => {
    const rules = [{
      criteria: [
        'data.shoes == "banana"',
        '"IL" in data.states',
      ],
      grouping: 'ALL',
    }];

    const result = validate(rules);

    expect(result).to.be.true();
  });

  it('rejects invalid array groupings', () => {
    const rules = [{
      criteria: [
        'data.shoes == "banana"',
        '"IL" in data.states',
      ],
      grouping: '2 banana',
    }];

    const result = validate(rules);

    expect(result).to.be.false();
  });

  it('accepts valid array rules with children', () => {
    const rules = [{
      criteria: [
        'data.shoes == "banana"',
      ],
      grouping: 'ALL',
      result: 'result1',
      children: [
        {
          criteria: [
            '"IL" in data.states',
          ],
          grouping: 'ALL',
          result: 'result2',
        },
      ],
    }];

    const result = validate(rules);

    expect(result).to.be.true();
  });

  it('rejects invalid array groupings with children', () => {
    const rules = [{
      criteria: [
        'data.shoes == "banana"',
      ],
      grouping: 'ALL',
      result: 'result1',
      children: [
        {
          criteria: [
            '"IL" in data.states',
          ],
          grouping: 'banana',
          result: 'result2',
        },
      ],
    }];

    const result = validate(rules);

    expect(result).to.be.false();
  });

  it('requires children to have result IDs', () => {
    const rules = [{
      criteria: [
        'data.shoes == "banana"',
      ],
      grouping: 'ALL',
      result: 'result1',
      children: [
        {
          criteria: [
            '"IL" in data.states',
          ],
          grouping: 'ALL',
        },
      ],
    }];

    const result = validate(rules);

    expect(result).to.be.false();
  });
});
