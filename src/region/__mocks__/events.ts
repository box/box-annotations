export const mockNativeEvent = {
    stopImmediatePropagation: jest.fn(),
};

export const mockEvent = {
    nativeEvent: mockNativeEvent,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
};
