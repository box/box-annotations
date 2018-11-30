/**
 * @flow
 * @file withFocus higher order component
 * @author Box
 */

import * as React from 'react';

import { CLASS_FOCUSED } from '../constants';

type Props = {};
type State = {
    isFocused: boolean
};

const withFocus = (WrappedComponent: React.ComponentType<any>) => {
    return class extends React.Component<Props, State> {
        state = {
            isFocused: false
        };

        onKeyDown = (event: SyntheticKeyboardEvent<>): void => {
            const { nativeEvent } = event;
            nativeEvent.stopImmediatePropagation();
        };

        handleFocus = (): void => {
            this.setState({ isFocused: true });
        };

        handleBlur = (): void => {
            this.setState({ isFocused: false });
        };

        render() {
            const { isFocused } = this.state;
            return (
                <WrappedComponent
                    className={isFocused ? CLASS_FOCUSED : ''}
                    onBlur={this.handleBlur}
                    onFocus={this.handleFocus}
                    {...this.props}
                />
            );
        }
    };
};

export default withFocus;
