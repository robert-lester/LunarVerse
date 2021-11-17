// Taken from https://gist.github.com/navix/6c25c15e0a2d3cd0e5bce999e0086fc9
// A deep partial allows properties of child types to be optional as well.
export type DeepPartial<T> = T extends object ? {
  [K in keyof T]?: DeepPartial<T[K]>
} : T;