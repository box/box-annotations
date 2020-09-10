import { IntlShape } from 'react-intl';
import { Store } from 'redux';

export type Options = {
    location?: number;
    referenceEl: HTMLElement;
};

export type Props = {
    intl: IntlShape;
    store: Store;
};

export default interface BaseManager {
    destroy(): void;
    exists(parentEl: HTMLElement): boolean;
    render(props: Props): void;
    style(styles: Partial<CSSStyleDeclaration>): CSSStyleDeclaration;
}
