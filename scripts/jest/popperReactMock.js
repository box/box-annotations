module.exports = {
    usePopper: jest.fn(() => ({
        attributes: {},
        update: jest.fn(),
        styles: {},
    })),
};
