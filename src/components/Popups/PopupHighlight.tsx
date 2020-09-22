import React from 'react';
import classNames from 'classnames';
import IconHighlightTextAnnotation from 'box-ui-elements/es/icon/fill/AnnotationsHighlight16';
import noop from 'lodash/noop';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import { Options } from './Popper';
import { Shape } from '../../@types/model';
import './PopupHighlight.scss';

export type Props = {
    disabled: boolean;
    onClick?: (event: React.MouseEvent) => void;
    shape: Shape;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'arrow',
            options: {
                element: '.ba-Popup-arrow',
            },
        },
        {
            name: 'eventListeners',
            options: {
                scroll: false,
            },
        },
        {
            name: 'offset',
            options: {
                offset: [0, 8],
            },
        },
        {
            name: 'preventOverflow',
            options: {
                padding: 5,
            },
        },
    ],
    placement: 'bottom',
};

export default function PopupHighlight({ disabled, onClick = noop, shape }: Props): JSX.Element {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { height, width, x, y } = shape;

    const reference = {
        getBoundingClientRect: () => ({
            bottom: y + height,
            height,
            left: x,
            right: x + width,
            top: y,
            width,
        }),
    };

    const handleClick = (event: React.MouseEvent): void => {
        onClick(event);
    };

    return (
        <PopupBase
            className={classNames('ba-PopupHighlight', { 'is-disabled': disabled })}
            options={options}
            reference={reference}
        >
            <button
                ref={buttonRef}
                className="ba-PopupHighlight-button"
                data-testid="ba-PopupHighlight-button"
                disabled={disabled}
                onClick={handleClick}
                type="button"
            >
                {disabled ? (
                    <FormattedMessage {...messages.popupHighlightRestrictedPrompt} />
                ) : (
                    <>
                        <IconHighlightTextAnnotation className="ba-PopupHighlight-icon" />
                        <FormattedMessage {...messages.popupHighlightPromoter} />
                    </>
                )}
            </button>
        </PopupBase>
    );
}
