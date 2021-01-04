import * as ReactRedux from 'react-redux';
import { getCreatorStatus, getIsSelecting, CreatorStatus } from '../store';

// Returns whether rendered annotations should be interactive
export default function useIsListInteractive(): boolean {
    const status = ReactRedux.useSelector(getCreatorStatus);
    const isSelecting = ReactRedux.useSelector(getIsSelecting);

    return status === CreatorStatus.init && !isSelecting;
}
