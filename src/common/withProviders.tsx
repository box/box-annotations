import * as React from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { Provider as StoreProvider } from 'react-redux';
import { Store } from 'redux';

type WrapperProps = {
    intl: IntlShape;
    store: Store;
};

type WrapperReturn<P> = React.FC<P & WrapperProps>;

export default function withProviders<P extends object>(WrappedComponent: React.ComponentType<P>): WrapperReturn<P> {
    return function RootProvider({ intl, store, ...rest }: P & WrapperProps): JSX.Element {
        return (
            <RawIntlProvider value={intl}>
                <StoreProvider store={store}>
                    <WrappedComponent {...(rest as P)} />
                </StoreProvider>
            </RawIntlProvider>
        );
    };
}
