import React from 'react';
import noop from 'lodash/noop';
import TextHighlight from '@box/blueprint-web-assets/icons/Medium/TextHighlight';
import { Toolbar } from '@box/blueprint-web';
import { useIntl } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import PopupToolbar from './PopupToolbar';
import useOutsideEvent from '../../common/useOutsideEvent';
import { clientBoundingRect, Options } from './Popper';
import { Shape } from '../../@types/model';
import './PopupHighlightV2.scss';

export type Props = {
    onCancel?: () => void;
    onSubmit?: () => void;
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

export default function PopupHighlightV2({ onCancel = noop, onSubmit = noop, shape }: Props): JSX.Element {
    const intl = useIntl();
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    const { height, width, x, y } = shape;

    const reference = {
        getBoundingClientRect: () => clientBoundingRect(height, width, x, y),
    };

    const handleKeydownOutside = (event: Event): void => {
        if (!(event instanceof KeyboardEvent) || event.key !== 'Enter' || event.ctrlKey || event.metaKey) {
            return;
        }

        event.preventDefault(); // Consume any enter keydown event if the promoter is open
        event.stopPropagation(); // Prevent the enter keydown event from adding a new line to the textarea

        onSubmit();
    };

    useOutsideEvent('keydown', toolbarRef, handleKeydownOutside);
    useOutsideEvent('mousedown', toolbarRef, onCancel);

    return (
        <PopupBase
            aria-label={intl.formatMessage(messages.popupHighlightPromoter)}
            aria-live="polite"
            className="ba-PopupHighlightBlueprint"
            options={options}
            reference={reference}
            role="dialog"
        >
            <PopupToolbar ref={toolbarRef}>
                <Toolbar.Button aria-haspopup="dialog" data-testid="ba-PopupHighlight-button" onClick={onSubmit}>
                    <Toolbar.Icon icon={TextHighlight} />
                    {intl.formatMessage(messages.popupHighlightPromoter)}
                </Toolbar.Button>
            </PopupToolbar>
        </PopupBase>
    );
}
