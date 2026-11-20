import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import DrawingAnnotationsContainer from '../drawing/DrawingAnnotationsContainer';
import DrawingManager from '../drawing/DrawingManager';
import UniformBlurContext from '../drawing/UniformBlurContext';
import { Props } from '../common/BaseManager';

// The drawing layer spans the whole content box, which on a long page is far taller than wide; blur the drawing
// shadows equally in pixels so they look as they do on a page-sized layer
export default class HtmlDrawingManager extends DrawingManager {
    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(
            <UniformBlurContext.Provider value>
                <DrawingAnnotationsContainer
                    referenceEl={this.referenceEl}
                    targetType={this.targetType}
                    location={this.location}
                    popupPortalEl={this.popupPortalEl}
                    {...props}
                />
            </UniformBlurContext.Provider>,
        );
    }
}
