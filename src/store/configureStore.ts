import { createStore, applyMiddleware, compose, Store } from 'redux';
import createRootReducer from './createRootReducer';

const middleware = [];
/* eslint-disable no-underscore-dangle */
const composeEnhancers =
    process.env.NODE_ENV === 'dev' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
              // This is the default according to the docs,
              // but for some reason without it set explicitly there's a JS error.
              // See http://extension.remotedev.io/docs/API/Arguments.html#shouldhotreload
              // (tgupta: Note this was previous set to false due to this issue, but I can't seem
              // to find any problematic actions/reducers triggering this issue now:
              // https://github.com/gaearon/redux-devtools/issues/304#issuecomment-251715413)
              shouldHotReload: true,
          })
        : compose;
/* eslint-enable no-underscore-dangle */

const enhancer = composeEnhancers(applyMiddleware(...middleware));

export default function configureStore(preloadedState): Store {
    const store = createStore(createRootReducer(), preloadedState, enhancer);

    return store;
}
