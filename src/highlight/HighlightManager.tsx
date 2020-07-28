import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Options, Props } from '../common/BaseManager';
import HighlightContainer from './HighlightContainer';

export default class HighlightManager implements BaseManager {
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
        const parentEl = referenceEl.parentNode || documentEl.body;

        // Construct a layer element where we can inject a root React component
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');
        rootLayerEl.classList.add('ba-Layer--highlight');
        rootLayerEl.dataset.testid = 'ba-Layer--highlight';
        rootLayerEl.setAttribute('data-resin-feature', 'annotations');

        // Append the new layer node to the end of the list of children of the parent node
        return parentEl.appendChild(rootLayerEl);
    }

    render(props: Props): void {
        ReactDOM.render(<HighlightContainer {...props} />, this.reactEl);
    }

    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration {
        return Object.assign(this.reactEl.style, styles);
    }
}
