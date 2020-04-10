import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Options, Props } from '../common/BaseManager';
import { ICON_REGION_CROSSHAIR } from '../icons/icons';
import RegionContainer from './RegionContainer';

export default class RegionManager implements BaseManager {
    page: number;

    pageEl: HTMLElement;

    rootEl: HTMLElement;

    constructor({ page, pageEl, referenceEl }: Options) {
        this.page = page;
        this.pageEl = pageEl;
        this.rootEl = this.insert(referenceEl);
    }

    destroy(): void {
        ReactDOM.unmountComponentAtNode(this.rootEl);

        this.rootEl.remove();
    }

    exists(pageEl: HTMLElement): boolean {
        return pageEl.contains(this.rootEl);
    }

    insert(referenceEl: HTMLElement): HTMLElement {
        // Find the nearest applicable reference and document elements
        const documentEl = this.pageEl.ownerDocument || document;
        const parentEl = referenceEl.parentNode || documentEl;

        // Construct a layer element where we can inject a root React component
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');
        rootLayerEl.classList.add('ba-Layer--region');
        rootLayerEl.style.cursor = `url('data:image/svg+xml;utf8,${ICON_REGION_CROSSHAIR}'), crosshair`;
        rootLayerEl.dataset.testid = 'ba-Layer--region';

        // Insert the new layer element immediately after the reference element
        return parentEl.insertBefore(rootLayerEl, referenceEl.nextSibling);
    }

    render(props: Props): void {
        ReactDOM.render(<RegionContainer page={this.page} {...props} />, this.rootEl);
    }
}
