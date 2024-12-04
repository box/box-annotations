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

export type Props = {
    createDrawing?: (arg: DrawingCreateArg) => void;
    createHighlight?: (arg: HighlightCreateArg) => void;
    createRegion?: (arg: RegionCreateArg) => void;
    isPromoting: boolean;
    location: number;
    message: string;
    mode: Mode;
    referenceId: string | null;
    resetCreator: () => void;
    setMessage: (message: string) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
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
    } = props;

    const [reference, setReference] = React.useState<PopupReference | null>(null);
    const canCreate = (modeStagedMap[mode]?.(staged ?? null) ?? false) || isPromoting;
    const canReply = status !== CreatorStatus.started && status !== CreatorStatus.init;
    const isPending = status === CreatorStatus.pending;

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

        if (isCreatorStagedHighlight(staged)) {
            createHighlight({ ...staged, message });
        } else if (isCreatorStagedRegion(staged)) {
            createRegion({ ...staged, message });
        } else if (isCreatorStagedDrawing(staged)) {
            createDrawing({ ...staged, message });
        }
    };

    React.useEffect(() => {
        setReference(referenceId ? document.querySelector(`[data-ba-reference-id="${referenceId}"]`) : null);
    }, [referenceId]);

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
