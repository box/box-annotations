export type Options = {
    page: string;
    pageEl: HTMLElement;
};

export type Props = {
    annotations: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    scale: number;
};

export default interface BaseManager {
    destroy(): void;
    exists(pageEl: HTMLElement): boolean;
    render(props: Props): void;
}
