import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Options, Props, InsertStrategy } from '../common/BaseManager';
import RegionContainer from './RegionContainer';

export default class RegionManager implements BaseManager {
    location: number;

    reactEl: HTMLElement;

    constructor({ location = 1, referenceEl, insertStrategy = InsertStrategy.NEXT_SIBLING }: Options) {
        this.location = location;
        const modifiedReferenceEl = this.applyInsertStrategy(referenceEl, insertStrategy);
        this.reactEl = this.insert(modifiedReferenceEl);
    }

    applyInsertStrategy(referenceEl: HTMLElement, insertStrategy: InsertStrategy): HTMLElement | null {
        let element = referenceEl;

        switch (insertStrategy) {
            case InsertStrategy.NEXT_SIBLING:
                element = referenceEl.nextSibling;
                break;
            case InsertStrategy.SELF:
                element = referenceEl;
                break;
            default:
                break;
        }

        return element;
    }

    destroy(): void {
        ReactDOM.unmountComponentAtNode(this.reactEl);

        this.reactEl.remove();
    }

    exists(parentEl: HTMLElement): boolean {
        return parentEl.contains(this.reactEl);
    }

    insert(referenceEl: HTMLElement | null): HTMLElement {
        // Find the nearest applicable reference and document elements
        const documentEl = referenceEl.ownerDocument || document;
        const parentEl = referenceEl.parentNode || documentEl;

        // Construct a layer element where we can inject a root React component
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');
        rootLayerEl.classList.add('ba-Layer--region');
        rootLayerEl.dataset.testid = 'ba-Layer--region';
        rootLayerEl.setAttribute('data-resin-feature', 'annotations');

        // Insert the new layer element immediately after the reference element
        return parentEl.insertBefore(rootLayerEl, referenceEl);
    }

    render(props: Props): void {
        ReactDOM.render(<RegionContainer location={this.location} {...props} />, this.reactEl);
    }

    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration {
        return Object.assign(this.reactEl.style, styles);
    }
}
