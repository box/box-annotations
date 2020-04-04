import * as React from 'react';
import * as ReactDOM from 'react-dom';
import merge from 'lodash/merge';
import { Annotation, TargetRegion } from '../@types';
import BaseManager, { Options, Props } from '../common/BaseManager';
import RegionContainer from './RegionContainer';

export default class RegionManager implements BaseManager {
    page: string;

    pageEl: HTMLElement;

    rootEl: HTMLElement;

    constructor({ page, pageEl, referenceEl }: Options) {
        this.page = page;
        this.pageEl = pageEl;
        this.rootEl = this.insert(referenceEl);
    }

    destroy(): void {
        ReactDOM.unmountComponentAtNode(this.rootEl);

        this.rootEl.remove();
    }

    exists(pageEl: HTMLElement): boolean {
        return pageEl.contains(this.rootEl);
    }

    format({ annotations = [], scale = 1 }: Partial<Props>): Annotation[] {
        return annotations
            .filter(({ type }) => type === 'region')
            .map(annotation => {
                const { target } = annotation;
                const { shape } = target as TargetRegion;

                return merge({}, annotation, {
                    target: {
                        shape: {
                            height: shape.height * scale,
                            width: shape.width * scale,
                            x: shape.x * scale,
                            y: shape.y * scale,
                        },
                    },
                });
            });
    }

    insert(referenceEl: HTMLElement): HTMLElement {
        // Find the nearest applicable reference and document elements
        const documentEl = this.pageEl.ownerDocument || document;
        const parentEl = referenceEl.parentNode || documentEl;

        // Construct a layer element where we can inject a root React component
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');
        rootLayerEl.classList.add('ba-Layer--region');
        rootLayerEl.dataset.testid = 'ba-Layer--region';

        // Insert the new layer element immediately after the reference element
        return parentEl.insertBefore(rootLayerEl, referenceEl.nextSibling);
    }

    render({ annotations, scale, ...rest }: Props): void {
        ReactDOM.render(<RegionContainer annotations={this.format({ annotations, scale })} {...rest} />, this.rootEl);
    }
}
