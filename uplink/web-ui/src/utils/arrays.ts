import moment from 'moment';

import { Sort } from '../types';

export const sortDateAscending = (a: any, b: any, key: string) => {
  const aDate = new Date(a[key]).toISOString();
  const bDate = new Date(b[key]).toISOString();
  return moment(aDate).diff(bDate);
};

export const sortDateDescending = (a: any, b: any, key: string) => {
  const aDate = new Date(a[key]).toISOString();
  const bDate = new Date(b[key]).toISOString();
  return moment(bDate).diff(aDate);
};

export const sortByName = (a: any, b: any, type?: Sort) => {
  const ascending = type === 'ASC' || !type;
  if (a.name > b.name) {
    return ascending ? 1 : -1;
  } else if (a.name < b.name) {
    return ascending ? -1 : 1;
  }
  return 0;
};