module.exports = class Scaffold {
  constructor() {
    if (!this.handler) {
      throw new Error('Scaffold must be extended by a class with a handler method');
    }

    const { handler } = this;
    const scaffold = this;

    return new Proxy(this, {
      get(target, key) {
        const targetKey = target[key];

        return typeof targetKey === 'function' ? handler.bind(scaffold, target, key) : targetKey;
      },
    });
  }
};
