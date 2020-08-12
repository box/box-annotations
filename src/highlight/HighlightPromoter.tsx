import React from 'react';
import classNames from 'classnames';
import useOutsideEvent from '../common/useOutsideEvent';
import { getSelectionRange } from './highlightUtil';
import { MOUSE_PRIMARY } from '../constants';
import './HighlightPromoter.scss';

type Props = {
    className?: string;
    pageEl: HTMLElement;
};

export default function HighlightPromoter({ className, pageEl }: Props): JSX.Element {
    const isSelectingRef = React.useRef<boolean>(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleRangeChange = (_range: Range | null): void => {
        // show highlight promotion popover
    };

    const handleMouseDown = ({ buttons }: MouseEvent): void => {
        if (buttons !== MOUSE_PRIMARY) {
            return;
        }

        isSelectingRef.current = true;
    };

    const handleMouseUp = (): void => {
        if (!isSelectingRef.current) {
            return;
        }

        isSelectingRef.current = false;

        timerRef.current = setTimeout(() => {
            handleRangeChange(getSelectionRange());
            timerRef.current = null;
        }, 300); // Pdf.js textLayer enhancement waits 300ms (they hardcode this magic number)
    };

    React.useEffect(() => {
        pageEl.addEventListener('mouseup', handleMouseUp);
        pageEl.addEventListener('mousedown', handleMouseDown);

        return () => {
            pageEl.removeEventListener('mouseup', handleMouseUp);
            pageEl.removeEventListener('mousedown', handleMouseDown);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    });

    // Multi-page highlight is not supported, reset isSelecting
    useOutsideEvent('mousedown', { current: pageEl }, () => {
        isSelectingRef.current = false;
        handleRangeChange(null);
    });

    return <div className={classNames(className, 'ba-HighlightPromoter')} data-testid="ba-HighlightPromoter" />;
}
