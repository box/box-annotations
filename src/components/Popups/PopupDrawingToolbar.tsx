import React from 'react';
import classNames from 'classnames';
import ArrowBack from '@box/blueprint-web-assets/icons/Medium/ArrowBack';
import ArrowForward from '@box/blueprint-web-assets/icons/Medium/ArrowForward';
import Trash from '@box/blueprint-web-assets/icons/Medium/Trash';
import { Toolbar, Tooltip } from '@box/blueprint-web';
import { useIntl } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import PopupToolbar from './PopupToolbar';
import { Options, PopupReference, Rect } from './Popper';
import './PopupDrawingToolbar.scss';

export type PopupBaseRef = PopupBase;

export type Props = {
    canComment: boolean;
    canRedo: boolean;
    canUndo: boolean;
    className?: string;
    onDelete: () => void;
    onRedo: () => void;
    onReply: () => void;
    onUndo: () => void;
    reference: PopupReference;
    tooltipContainer?: HTMLElement | null;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: ({ popper }: { popper: Rect }) => [-popper.width / 2, 8],
            },
        },
        {
            name: 'preventOverflow',
            options: {
                padding: 50,
            },
        },
    ],
    placement: 'top',
};

const PopupDrawingToolbar = (props: Props, ref: React.Ref<PopupBaseRef>): JSX.Element => {
    const {
        canComment,
        canRedo,
        canUndo,
        className,
        onDelete,
        onRedo,
        onReply,
        onUndo,
        reference,
        tooltipContainer,
    } = props;

    const intl = useIntl();
    const deleteLabel = intl.formatMessage(messages.drawingButtonDelete);
    const redoLabel = intl.formatMessage(messages.drawingButtonRedo);
    const undoLabel = intl.formatMessage(messages.drawingButtonUndo);

    return (
        <PopupBase
            ref={ref}
            className={classNames(className, 'ba-PopupDrawingToolbar')}
            data-resin-component="popupDrawingToolbar"
            options={options}
            reference={reference}
        >
            <PopupToolbar
                aria-label={intl.formatMessage(messages.drawingToolbarLabel)}
                tooltipContainer={tooltipContainer}
            >
                <Tooltip content={undoLabel}>
                    <Toolbar.Button
                        aria-label={undoLabel}
                        data-testid="ba-PopupDrawingToolbar-undo"
                        disabled={!canUndo}
                        onClick={() => onUndo()}
                    >
                        <Toolbar.Icon icon={ArrowBack} />
                    </Toolbar.Button>
                </Tooltip>
                <Tooltip content={redoLabel}>
                    <Toolbar.Button
                        aria-label={redoLabel}
                        data-testid="ba-PopupDrawingToolbar-redo"
                        disabled={!canRedo}
                        onClick={() => onRedo()}
                    >
                        <Toolbar.Icon icon={ArrowForward} />
                    </Toolbar.Button>
                </Tooltip>
                <Tooltip content={deleteLabel}>
                    <Toolbar.Button
                        aria-label={deleteLabel}
                        data-testid="ba-PopupDrawingToolbar-delete"
                        onClick={() => onDelete()}
                    >
                        <Toolbar.Icon icon={Trash} />
                    </Toolbar.Button>
                </Tooltip>
                <Toolbar.Separator />
                <Toolbar.Button
                    data-testid="ba-PopupDrawingToolbar-comment"
                    disabled={!canComment}
                    onClick={() => onReply()}
                >
                    {intl.formatMessage(messages.drawingButtonAddComment)}
                </Toolbar.Button>
            </PopupToolbar>
        </PopupBase>
    );
};

export default React.forwardRef(PopupDrawingToolbar);
