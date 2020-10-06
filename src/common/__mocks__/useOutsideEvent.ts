export default jest.fn((_type: string, _ref?: React.RefObject<Element>, callback?: () => void): void => {
    if (callback) {
        callback();
    }
});
