import React from 'react';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import ArrowBack from '../../icons/ArrowBack';
import ArrowForward from '../../icons/ArrowForward';
import Trash from '../../icons/Trash';
import messages from './messages';
import PopupBase from './PopupBase';
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
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'eventListeners',
            options: {
                scroll: false,
            },
        },
        {
            name: 'offset',
            options: {
                offset: ({ popper }: { popper: Rect }) => [-popper.width / 2, 8],
            },
        },
        {
            name: 'preventOverflow',
            options: {
                altAxis: true,
                padding: 50,
            },
        },
    ],
    placement: 'top',
};

const ICON_SIZE = 20;

const PopupDrawingToolbar = (props: Props, ref: React.Ref<PopupBaseRef>): JSX.Element => {
    const { canComment, canRedo, canUndo, className, onDelete, onRedo, onReply, onUndo, reference } = props;
    const intl = useIntl();

    return (
        <PopupBase
            ref={ref}
            className={classNames(className, 'ba-PopupDrawingToolbar')}
            data-resin-component="popupDrawingToolbar"
            options={options}
            reference={reference}
        >
            <div className="ba-PopupDrawingToolbar-group">
                <button
                    className="ba-PopupDrawingToolbar-undo"
                    data-testid="ba-PopupDrawingToolbar-undo"
                    disabled={!canUndo}
                    onClick={() => onUndo()}
                    title={intl.formatMessage(messages.drawingButtonUndo)}
                    type="button"
                >
                    <ArrowBack height={ICON_SIZE} width={ICON_SIZE} />
                </button>
                <button
                    className="ba-PopupDrawingToolbar-redo"
                    data-testid="ba-PopupDrawingToolbar-redo"
                    disabled={!canRedo}
                    onClick={() => onRedo()}
                    title={intl.formatMessage(messages.drawingButtonRedo)}
                    type="button"
                >
                    <ArrowForward height={ICON_SIZE} width={ICON_SIZE} />
                </button>
                <button
                    className="ba-PopupDrawingToolbar-delete"
                    data-testid="ba-PopupDrawingToolbar-delete"
                    onClick={() => onDelete()}
                    title={intl.formatMessage(messages.drawingButtonDelete)}
                    type="button"
                >
                    <Trash height={ICON_SIZE} width={ICON_SIZE} />
                </button>
            </div>
            <div className="ba-PopupDrawingToolbar-group">
                <button
                    className="ba-PopupDrawingToolbar-comment"
                    data-testid="ba-PopupDrawingToolbar-comment"
                    disabled={!canComment}
                    onClick={() => onReply()}
                    type="button"
                >
                    <FormattedMessage {...messages.drawingButtonAddComment} />
                </button>
            </div>
        </PopupBase>
    );
};

export default React.forwardRef(PopupDrawingToolbar);
