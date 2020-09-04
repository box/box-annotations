export default function usePreventEventPropagationRef<T extends HTMLElement>(): (element: T) => void {
    return (element: T) => element;
}
