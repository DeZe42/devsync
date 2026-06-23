import { PullRequest } from './pull-request.interface';

describe('PullRequest Interface', () => {
  it('should compile successfully with the correct types', () => {
    const dummyPr: PullRequest = {
      id: 1,
      author: 'zsoltdenes',
      status: 'OPEN',
      leadTime: 24,
    };

    expect(dummyPr.id).toBe(1);
    expect(dummyPr.status).toBe('OPEN');
  });
});