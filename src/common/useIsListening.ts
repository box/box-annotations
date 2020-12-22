import * as ReactRedux from 'react-redux';
import { getCreatorStatus, getIsSelecting, CreatorStatus } from '../store';

// Returns whether rendered annotations should be listening for interaction events
export default function useIsListening(): boolean {
    const status = ReactRedux.useSelector(getCreatorStatus);
    const isSelecting = ReactRedux.useSelector(getIsSelecting);
    const isListening = status === CreatorStatus.init && !isSelecting;

    return isListening;
}
