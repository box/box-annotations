import { IntlShape } from 'react-intl';

export type Options = {
    page: string;
    pageEl: HTMLElement;
    referenceEl: HTMLElement;
};

export type Props = {
    annotations: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    intl: IntlShape;
    scale: number;
};

export default interface BaseManager {
    destroy(): void;
    exists(pageEl: HTMLElement): boolean;
    render(props: Props): void;
}
