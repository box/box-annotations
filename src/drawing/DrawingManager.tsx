import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BaseManager, { Options as BaseOptions, Props } from '../common/BaseManager';
import DrawingAnnotationsContainer from './DrawingAnnotationsContainer';

export type Options = BaseOptions & {
    popupPortalEl?: HTMLElement | null;
};

export default class DrawingListManager extends BaseManager {
    popupPortalEl?: HTMLElement | null;

    constructor({ popupPortalEl, ...options }: Options) {
        super(options);
        this.popupPortalEl = popupPortalEl;
    }

    decorate(): void {
        this.reactEl.classList.add('ba-Layer--drawing');
        this.reactEl.dataset.testid = 'ba-Layer--drawing';
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(<DrawingAnnotationsContainer referenceEl={this.referenceEl} targetType={this.targetType} location={this.location} popupPortalEl={this.popupPortalEl} {...props} />);
    }
}
