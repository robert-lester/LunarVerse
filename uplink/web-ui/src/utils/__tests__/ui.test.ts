import { getUserColor } from '../ui';

describe('UI utils', () => {
  it('should return rgba(255,193,7,1)', () => {
    expect(getUserColor('amber')).toEqual('rgba(255,193,7,1)');
  });

  it('should return rgba(158,158,158,1)', () => {
    expect(getUserColor('')).toEqual('rgba(158,158,158,1)');
  });
});