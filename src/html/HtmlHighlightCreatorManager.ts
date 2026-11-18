import HighlightCreatorManager from '../highlight/HighlightCreatorManager';

// HighlightCreatorManager listens for mouseup on this page's document. The content may live in a frame document,
// where the mouseup that ends a text selection fires instead.
export default class HtmlHighlightCreatorManager extends HighlightCreatorManager {
    render(): void {
        super.render();

        document.removeEventListener('mouseup', this.handleMouseUp);
        this.referenceEl.ownerDocument.addEventListener('mouseup', this.handleMouseUp);
    }

    destroy(): void {
        super.destroy();

        this.referenceEl.ownerDocument.removeEventListener('mouseup', this.handleMouseUp);
    }
}
