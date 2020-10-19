import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BaseManager, { Props } from '../common/BaseManager';
import RegionCreationContainer from './RegionCreationContainer';

export default class RegionManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--regionCreation');
        this.reactEl.dataset.testid = 'ba-Layer--regionCreation';
    }

    render(props: Props): void {
        ReactDOM.render(<RegionCreationContainer location={this.location} {...props} />, this.reactEl);
    }
}
