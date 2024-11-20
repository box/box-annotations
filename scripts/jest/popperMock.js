/* eslint-disable no-undef */
const createPopper = jest.fn(() => ({
    destroy: jest.fn(),
    forceUpdate: jest.fn(),
    setOptions: jest.fn(),
    update: jest.fn(),
}));

module.exports = {
    createPopper,
    popperGenerator: jest.fn(() => createPopper),
};
