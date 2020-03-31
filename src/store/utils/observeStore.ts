// Taken from https://github.com/reduxjs/redux/issues/303#issuecomment-125184409
export default function observeStore(store, select, onChange): Function {
    let currentState;

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
