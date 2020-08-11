import React from 'react';
import classNames from 'classnames';
import { getSelectionRange, isInRect } from './highlightUtil';
import { MOUSE_PRIMARY } from '../constants';
import './HighlightPromoter.scss';

type Props = {
    className?: string;
    onSelectionChange?: (range: Range | null) => void;
    pageEl: HTMLElement;
};

export default function HighlightPromoter({ className, onSelectionChange, pageEl }: Props): JSX.Element {
    const [isSelecting, setIsSelecting] = React.useState<boolean>(false);

    const handleMouseDown = ({ buttons }: MouseEvent): void => {
        if (!onSelectionChange || buttons !== MOUSE_PRIMARY) {
            return;
        }

        setIsSelecting(true);
    };

    const handleMouseUp = ({ clientX, clientY }: MouseEvent): void => {
        if (!onSelectionChange || !isSelecting) {
            return;
        }

        setIsSelecting(false);

        // Multi-page highlight is not supported
        if (!isInRect(clientX, clientY, pageEl.getBoundingClientRect())) {
            return;
        }

        setTimeout(() => {
            onSelectionChange(getSelectionRange());
        }, 300); // Pdf.js textLayer enhancement waits 300ms (they hardcode this magic number)
    };

    const handleSelectionChange = (): void => {
        if (!onSelectionChange) {
            return;
        }

        const selection = document.getSelection();

        if (!selection || selection.isCollapsed) {
            onSelectionChange(null);
        }
    };

    React.useEffect(() => {
        // Only document has selectionchange event. Document-level event listener
        // allows the creator to respond even if the selection is on the other pages
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mouseup', handleMouseUp);
        pageEl.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mouseup', handleMouseUp);
            pageEl.removeEventListener('mousedown', handleMouseDown);
        };
    });

    return <div className={classNames(className, 'ba-HighlightPromoter')} data-testid="ba-HighlightPromoter" />;
}
