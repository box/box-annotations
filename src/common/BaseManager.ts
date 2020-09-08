import { IntlShape } from 'react-intl';
import { Store } from 'redux';

export type Options = {
    location?: number;
    referenceEl: HTMLElement;
    insertStrategy?: InsertStrategy;
};

export type Props = {
    intl: IntlShape;
    store: Store;
};

export enum InsertStrategy {
    NEXT_SIBLING = 'nextSibling',
    SELF = 'self',
}

export default interface BaseManager {
    destroy(): void;
    exists(parentEl: HTMLElement): boolean;
    render(props: Props): void;
    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration;
}
