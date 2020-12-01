import * as ReactDOM from 'react-dom';
import { IntlShape } from 'react-intl';
import { Store } from 'redux';
import { getIsCurrentFileVersion } from '../store';

export type Options = {
    location?: number;
    referenceEl: HTMLElement;
    store: Store;
};

export type Props = {
    intl: IntlShape;
    store: Store;
};

export interface Manager {
    destroy(): void;
    exists(parentEl: HTMLElement): boolean;
    render(props: Props): void;
    store: Store;
    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration;
}

export default class BaseManager implements Manager {
    location: number;

    reactEl: HTMLElement;

    store: Store;

    constructor({ location = 1, referenceEl, store }: Options) {
        this.location = location;
        this.store = store;
        this.reactEl = this.insert(referenceEl);

        this.decorate();
    }

    decorate(): void {
        throw new Error('Method not implemented.');
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
        const isCurrent = getIsCurrentFileVersion(this.store.getState());
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');
        rootLayerEl.setAttribute('data-resin-feature', 'annotations');
        rootLayerEl.setAttribute('data-resin-iscurrent', String(isCurrent));

        // Insert the new layer element immediately after the reference element
        return parentEl.insertBefore(rootLayerEl, referenceEl.nextSibling);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render(props: Props): void {
        throw new Error('Method not implemented.');
    }

    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration {
        return Object.assign(this.reactEl.style, styles);
    }
}
