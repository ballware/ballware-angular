type RemarkPlugin = (value: string) => string;

class MockRemarkProcessor {
  private readonly plugins: RemarkPlugin[] = [];

  use(plugin: unknown) {
    if (typeof plugin === 'function') {
      this.plugins.push(plugin as RemarkPlugin);
    }

    return this;
  }

  processSync(value: string) {
    const output = this.plugins.reduce((currentValue, plugin) => plugin(currentValue), value);

    return {
      toString: () => output,
    };
  }
}

export const remark = () => new MockRemarkProcessor();
