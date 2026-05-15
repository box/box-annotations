import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BaseManager, { Options as BaseOptions, Props } from '../common/BaseManager';
import HighlightContainer from './HighlightContainer';

export type Options = BaseOptions & {
    popupPortalEl?: HTMLElement | null;
};

export default class HighlightManager extends BaseManager {
    popupPortalEl?: HTMLElement | null;

    constructor({ popupPortalEl, ...options }: Options) {
        super(options);
        this.popupPortalEl = popupPortalEl;
    }

    decorate(): void {
        this.reactEl.classList.add('ba-Layer--highlight');
        this.reactEl.dataset.testid = 'ba-Layer--highlight';
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(<HighlightContainer location={this.location} popupPortalEl={this.popupPortalEl} {...props} />);
    }
}
