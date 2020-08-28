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
