import BaseManager, { Options, Props } from '../common/BaseManager';

export default class RegionManager implements BaseManager {
    page: string;

    pageEl: HTMLElement;

    constructor({ page, pageEl }: Options) {
        this.page = page;
        this.pageEl = pageEl;
    }

    destroy(): void {
        // No-op for now
    }

    exists(pageEl: HTMLElement): boolean {
        return !!pageEl;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render(props: Props): void {
        // No-op for now. Render area annotations here.
    }
}
