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

const mockTextNode = document.createTextNode('test');

export const mockRange: Range = ({
    endContainer: mockTextNode,
    getBoundingClientRect: () => mockDOMRect,
    getClientRects: () => [mockDOMRect],
    startContainer: mockTextNode,
} as unknown) as Range;

// Simulates an 800x600 element rotated -90deg (appears as 600x800 on screen)
export const mockRotatedContainerEl = (() => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetWidth', { value: 800, configurable: true });
    Object.defineProperty(el, 'offsetHeight', { value: 600, configurable: true });
    return el;
})();

export const mockRotatedContainerRect: DOMRect = {
    left: 100,
    top: 50,
    width: 600,
    height: 800,
    right: 700,
    bottom: 850,
    x: 100,
    y: 50,
    toJSON: jest.fn(),
};
