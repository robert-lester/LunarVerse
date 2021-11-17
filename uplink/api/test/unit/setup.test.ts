import { configureTestEnvironment } from '../setupUtils';

// https://mochajs.org/#root-level-hooks
// setup
before(async () => {
    process.env = configureTestEnvironment();
});
beforeEach(function() {
});

// teardown
after(async () => {
});
afterEach(() => {
});