import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import HighlightManager, { Options as BaseOptions } from '../highlight/HighlightManager';
import HtmlHighlightContainer, { GetShapes } from './HtmlHighlightContainer';
import { getHighlightShapes } from './htmlUtil';
import { Props } from '../common/BaseManager';
import { TargetHighlight } from '../@types';

type Options = BaseOptions & {
    // The element whose text anchors the highlights; the layer itself follows referenceEl
    contentEl: HTMLElement;
};

export default class HtmlHighlightManager extends HighlightManager {
    contentEl: HTMLElement;

    props?: Props;

    constructor({ contentEl, ...options }: Options) {
        super(options);
        this.contentEl = contentEl;
    }

    // A new resolver per render, since the layout may have changed since the last one
    createGetShapes(): GetShapes {
        const cache = new WeakMap<TargetHighlight, ReturnType<GetShapes>>();

        return target => {
            if (!cache.has(target)) {
                cache.set(target, getHighlightShapes(this.contentEl, target, this.popupPortalEl));
            }
            return cache.get(target) ?? null;
        };
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.props = props;
        this.root.render(
            <HtmlHighlightContainer
                getShapes={this.createGetShapes()}
                location={this.location}
                popupPortalEl={this.popupPortalEl}
                {...props}
            />,
        );
    }

    // Finds the highlight shapes again after the text moved, without touching the other layers. Commits synchronously
    // so open popups can be re-placed against the moved targets right after.
    updateShapes(): void {
        const { props } = this;

        if (props) {
            flushSync(() => this.render(props));
        }
    }
}
