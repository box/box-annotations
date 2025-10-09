import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BaseManager, { Props } from '../common/BaseManager';
import RegionCreationContainer from './RegionCreationContainer';

export default class RegionManager extends BaseManager {
    decorate(): void {
        this.reactEl.classList.add('ba-Layer--regionCreation');
        this.reactEl.dataset.testid = 'ba-Layer--regionCreation';
    }

    render(props: Props): void {
        if (!this.root) {
            this.root = ReactDOM.createRoot(this.reactEl);
        }

        this.root.render(<RegionCreationContainer targetType={this.targetType} referenceEl={this.referenceEl} location={this.location} {...props} />);
    }
}
