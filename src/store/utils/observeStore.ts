import { Store } from 'redux';

// Taken from https://github.com/reduxjs/redux/issues/303#issuecomment-125184409
export default function observeStore(store: Store, select: Function, onChange: Function): Function {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentState: any;

    function handleChange(): void {
        const nextState = select(store.getState());
        if (nextState !== currentState) {
            currentState = nextState;
            onChange(currentState);
        }
    }

    const unsubscribe = store.subscribe(handleChange);
    handleChange();
    return unsubscribe;
}
