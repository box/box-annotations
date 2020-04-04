import { IntlShape } from 'react-intl';
import { Store } from 'redux';

export type Options = {
    page: string;
    pageEl: HTMLElement;
    referenceEl: HTMLElement;
};

export type Props = {
    annotations: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    intl: IntlShape;
    scale: number;
    store: Store;
};

export default interface BaseManager {
    destroy(): void;
    exists(pageEl: HTMLElement): boolean;
    render(props: Props): void;
}
