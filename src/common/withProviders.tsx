import * as React from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { Provider as StoreProvider } from 'react-redux';
import { Store } from 'redux';
import AnnotationCallbacksContext, { AnnotationCallbacks } from './AnnotationCallbacksContext';

type WrapperProps = {
    callbacks?: AnnotationCallbacks;
    intl: IntlShape;
    store: Store;
};

type WrapperReturn<P> = React.FC<P & WrapperProps>;

export default function withProviders<P extends object>(WrappedComponent: React.ComponentType<P>): WrapperReturn<P> {
    return function RootProvider({ callbacks, intl, store, ...rest }: P & WrapperProps): JSX.Element {
        return (
            <RawIntlProvider value={intl}>
                <StoreProvider store={store}>
                    <AnnotationCallbacksContext.Provider value={callbacks ?? {}}>
                        <WrappedComponent {...(rest as P)} />
                    </AnnotationCallbacksContext.Provider>
                </StoreProvider>
            </RawIntlProvider>
        );
    };
}
