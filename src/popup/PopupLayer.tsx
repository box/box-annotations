import * as React from 'react';
import noop from 'lodash/noop';
import PopupReply from '../components/Popups/PopupReply';
import { CreateArg as HighlightCreateArg } from '../highlight/actions';
import { CreateArg as RegionCreateArg } from '../region/actions';
import { CreatorItem, CreatorStatus, isCreatorStagedHighlight, isCreatorStagedRegion, Mode } from '../store';
import { PopupReference } from '../components/Popups/Popper';
import { Shape } from '../@types';
import './PopupLayer.scss';

type Props = {
    createHighlight?: (arg: HighlightCreateArg) => void;
    createRegion?: (arg: RegionCreateArg) => void;
    isPromoting: boolean;
    location: number;
    message: string;
    mode: Mode;
    popupReference?: Shape;
    resetCreator: () => void;
    setMessage: (message: string) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
};

const modeStagedMap: { [M in Mode]?: Function } = {
    [Mode.HIGHLIGHT]: isCreatorStagedHighlight,
    [Mode.REGION]: isCreatorStagedRegion,
};

const PopupLayer = (props: Props): JSX.Element | null => {
    const {
        createHighlight = noop,
        createRegion = noop,
        isPromoting = false,
        message,
        mode,
        popupReference,
        resetCreator,
        setMessage,
        staged,
        status,
    } = props;

    const [reference, setReference] = React.useState<PopupReference | null>(null);
    const canCreate = (modeStagedMap[mode] || noop)(staged) || isPromoting;
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
        }
    };

    React.useEffect(() => {
        if (!popupReference) {
            return;
        }

        const { height, width, x, y } = popupReference;

        const virtualElement = {
            getBoundingClientRect: () => ({
                bottom: y + height,
                height,
                left: x,
                right: x + width,
                top: y,
                width,
            }),
        };

        setReference(virtualElement);
    }, [popupReference]);

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
