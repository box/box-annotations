import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Props } from '../common/BaseManager';
import RegionAnnotationsContainer from './RegionAnnotationsContainer';

export default class RegionListManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--region');
        this.reactEl.dataset.testid = 'ba-Layer--region';
    }

    render(props: Props): void {
        ReactDOM.render(<RegionAnnotationsContainer location={this.location} {...props} />, this.reactEl);
    }
}
