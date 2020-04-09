import { IntlShape } from 'react-intl';
import { Store } from 'redux';

export type Options = {
    page: number;
    pageEl: HTMLElement;
    referenceEl: HTMLElement;
};

export type Props = {
    intl: IntlShape;
    scale: number;
    store: Store;
};

export default interface BaseManager {
    destroy(): void;
    exists(pageEl: HTMLElement): boolean;
    render(props: Props): void;
}
