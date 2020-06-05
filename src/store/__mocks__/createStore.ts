export default jest.fn(() => ({
    dispatch: jest.fn(),
    getState: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
}));
