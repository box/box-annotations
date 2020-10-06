import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Options, Props } from '../common/BaseManager';
import RegionAnnotationsContainer from './RegionAnnotationsContainer';

export default class RegionListManager implements BaseManager {
    location: number;

    reactEl: HTMLElement;

    constructor({ location = 1, referenceEl }: Options) {
        this.location = location;
        this.reactEl = this.insert(referenceEl);
    }

    destroy(): void {
        ReactDOM.unmountComponentAtNode(this.reactEl);

        this.reactEl.remove();
    }

    exists(parentEl: HTMLElement): boolean {
        return parentEl.contains(this.reactEl);
    }

    insert(referenceEl: HTMLElement): HTMLElement {
        // Find the nearest applicable reference and document elements
        const documentEl = referenceEl.ownerDocument || document;
        const parentEl = referenceEl.parentNode || documentEl;

        // Construct a layer element where we can inject a root React component
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');
        rootLayerEl.classList.add('ba-Layer--regionList');
        rootLayerEl.dataset.testid = 'ba-Layer--regionList';
        rootLayerEl.setAttribute('data-resin-feature', 'annotations');

        // Insert the new layer element immediately after the reference element
        return parentEl.insertBefore(rootLayerEl, referenceEl.nextSibling);
    }

    render(props: Props): void {
        ReactDOM.render(<RegionAnnotationsContainer location={this.location} {...props} />, this.reactEl);
    }

    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration {
        return Object.assign(this.reactEl.style, styles);
    }
}
