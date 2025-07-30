import * as ReactDOM from 'react-dom/client';
import { IntlShape } from 'react-intl';
import { Store } from 'redux';
import { applyResinTags } from '../utils/resin';

export type ResinTags = Record<string, unknown>;

export type Options = {
    location?: number;
    referenceEl: HTMLElement;
    resinTags?: ResinTags;
    targetType?: 'frame' | 'page';
};

export type Props = {
    intl: IntlShape;
    store: Store;
};

export interface Manager {
    destroy(): void;
    exists(parentEl: HTMLElement): boolean;
    render(props: Props): void;
    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration;
}

export default class BaseManager implements Manager {
    location: number;

    reactEl: HTMLElement;

    root: ReactDOM.Root | null = null;

    targetType: 'page' | 'frame';

    referenceEl: HTMLElement;

    constructor({ location = 1, referenceEl, resinTags = {}, targetType = 'page' }: Options) {
        this.location = location;
        this.reactEl = this.insert(referenceEl, {
            ...resinTags,
            feature: 'annotations',
        });

        this.referenceEl = referenceEl;
        this.targetType = targetType;
        this.root = ReactDOM.createRoot(this.reactEl);

        this.decorate();
    }

    decorate(): void {
        throw new Error('Method not implemented.');
    }

    destroy(): void {
        if (this.root) {
            this.root.unmount();
        }
        if (this.reactEl.parentNode) {
            this.reactEl.parentNode.removeChild(this.reactEl);
        }
    }

    exists(parentEl: HTMLElement): boolean {
        return parentEl.contains(this.reactEl);
    }

    insert(referenceEl: HTMLElement, resinTags: ResinTags = {}): HTMLElement {
        // Find the nearest applicable reference and document elements
        const documentEl = referenceEl.ownerDocument || document;
        const parentEl = referenceEl.parentNode || documentEl;

        // Construct a layer element where we can inject a root React component
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');

        // Apply any resin tags
        applyResinTags(rootLayerEl, resinTags);

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
