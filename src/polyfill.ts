// Add support for SVGElement.contains in IE11
if (!SVGElement.prototype.contains) {
    Object.defineProperty(SVGElement.prototype, 'contains', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: function contains(node: Node) {
            let n: Node | null = node;
            do {
                if (this === n) {
                    return true;
                }
                n = n && n.parentNode;
            } while (n);

            return false;
        },
    });
}
