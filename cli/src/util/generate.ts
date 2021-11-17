import * as faker from "faker";

export const mapping = (arr: any[]) =>
  arr.reduce((prev, curr) => {
    prev[curr.id] = [`${faker.helpers.slugify(curr.name).replace("-", "")}`];
    return prev;
  }, {});

export const questions = [
  {
    type: "input",
    name: "organization",
    message: "Enter your organization",
  },
  {
    type: "input",
    name: "sources",
    message: "Enter the number of Sources to create"
  },
  {
    type: "input",
    name: "pods",
    message: "Enter the number of Pods to create",
  }
];
