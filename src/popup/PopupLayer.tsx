import * as React from 'react';
import noop from 'lodash/noop';
import PopupReply from '../components/Popups/PopupReply';
import { CreateArg as DrawingCreateArg } from '../drawing/actions';
import { CreateArg as HighlightCreateArg } from '../highlight/actions';
import { CreateArg as RegionCreateArg } from '../region/actions';
import {
    CreatorItem,
    CreatorStatus,
    isCreatorStagedDrawing,
    isCreatorStagedHighlight,
    isCreatorStagedRegion,
    Mode,
} from '../store';
import { PopupReference } from '../components/Popups/Popper';
import './PopupLayer.scss';
import { TARGET_TYPE_FRAME, TARGET_TYPE_PAGE } from '../constants';

export type Props = {
    createDrawing?: (arg: DrawingCreateArg) => void;
    createHighlight?: (arg: HighlightCreateArg) => void;
    createRegion?: (arg: RegionCreateArg) => void;
    isPromoting: boolean;
    location: number | null;
    message: string;
    mode: Mode;
    referenceId: string | null;
    resetCreator: () => void;
    setMessage: (message: string) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
    targetType: typeof TARGET_TYPE_FRAME | typeof TARGET_TYPE_PAGE;
    referenceEl?: HTMLElement;
};

const modeStagedMap: { [M in Mode]?: (staged: CreatorItem | null) => boolean } = {
    [Mode.DRAWING]: isCreatorStagedDrawing,
    [Mode.HIGHLIGHT]: isCreatorStagedHighlight,
    [Mode.REGION]: isCreatorStagedRegion,
};

const PopupLayer = (props: Props): JSX.Element | null => {
    const {
        createDrawing = noop,
        createHighlight = noop,
        createRegion = noop,
        isPromoting = false,
        message,
        mode,
        referenceId,
        resetCreator,
        setMessage,
        staged,
        status,
        targetType,
        referenceEl,
    } = props;

    const [reference, setReference] = React.useState<PopupReference | null>(null);
    const canCreate = (modeStagedMap[mode]?.(staged ?? null) ?? false) || isPromoting;
    const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
    const isPending = status === CreatorStatus.pending;
    const isFailed = status === CreatorStatus.rejected;

    const handleCancel = (): void => {
        resetCreator();
    };

    const handleChange = (text = ''): void => {
        setMessage(text);
    };

    const handleSubmit = (): void => {
        if (!staged) {
            return;
        }
        console.log('PopupLayer handleSubmit', staged, message, targetType, referenceEl);
        if (isCreatorStagedHighlight(staged)) {
            createHighlight({ ...staged, message, targetType });
        } else if (isCreatorStagedRegion(staged)) {
            createRegion({ ...staged, message, targetType });
        } else if (isCreatorStagedDrawing(staged)) {
            createDrawing({ ...staged, message, targetType });
        }
    };

    React.useEffect(() => {
        setReference(referenceId ? document.querySelector(`[data-ba-reference-id="${referenceId}"]`) : null);
    }, [referenceId]);

    if (isFailed) {
        return null;
    }
    console.log('PopupLayer', targetType, referenceEl,isPending);
    return (
        <>
            {canCreate && canReply && reference && staged && (
                <div className="ba-PopupLayer-popup">
                    <PopupReply
                        isPending={isPending}
                        onCancel={handleCancel}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        reference={reference}
                        value={message}
                    />
                </div>
            )}
        </>
    );
};

export default PopupLayer;
