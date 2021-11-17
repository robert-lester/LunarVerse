import { sortByName, sortDateAscending, sortDateDescending } from '../arrays';
import { Sort } from '../../types';

const names = [
  {
    name: 'Mary'
  },
  {
    name: 'John'
  }
];
const dates = [
  {
    date: '10/20/2017'
  },
  {
    date: '10/20/2018'
  }
];

describe('Array utils', () => {
  it('should sort an array of objects by name ascending by default, return John', () => {
    expect(names.sort(sortByName)[0].name).toEqual('John');
  });

  it('should sort by name, ascending, return -1', () => {
    expect(sortByName(names[0], names[1], Sort.ASC)).toEqual(-1);
  });

  it('should sort by name, ascending, return 0', () => {
    expect(sortByName(names[0], names[0], Sort.ASC)).toEqual(0);
  });

  it('should sort by name, ascending, returning 1', () => {
    expect(sortByName(names[1], names[0], Sort.ASC)).toEqual(1);
  });

  it('should sort by name, descending, returning 1', () => {
    expect(sortByName(names[0], names[1], Sort.DESC)).toEqual(1);
  });

  it('should sort by name, descending, returning -1', () => {
    expect(sortByName(names[1], names[0], Sort.DESC)).toEqual(-1);
  });
  
  it('should sort an array ascending by date based on key', () => {
    expect(dates.sort((a, b) => sortDateAscending(a, b, 'date'))[0].date).toEqual('10/20/2017');
  });

  it('should sort an array descending by date based on key', () => {
    expect(dates.sort((a, b) => sortDateDescending(a, b, 'date'))[0].date).toEqual('10/20/2018');
  });
});