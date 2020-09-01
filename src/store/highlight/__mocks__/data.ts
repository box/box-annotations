export const mockContainerRect: DOMRect = {
    bottom: 1000,
    height: 1000,
    left: 0,
    right: 1000,
    toJSON: jest.fn(),
    top: 0,
    width: 1000,
    x: 0,
    y: 0,
};

export const mockDOMRect: DOMRect = {
    bottom: 300,
    height: 100,
    left: 200,
    right: 300,
    toJSON: jest.fn(),
    top: 200,
    width: 100,
    x: 200,
    y: 200,
};

export const mockRange: Range = ({
    getBoundingClientRect: () => mockDOMRect,
    getClientRects: () => [mockDOMRect],
} as unknown) as Range;
