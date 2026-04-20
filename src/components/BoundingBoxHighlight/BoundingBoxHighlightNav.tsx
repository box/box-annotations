import * as React from 'react';
import { useIntl } from 'react-intl';
import ChevronLeft from '../../icons/ChevronLeft';
import ChevronRight from '../../icons/ChevronRight';
import messages from './messages';
import './BoundingBoxHighlightNav.scss';

type Props = {
    currentIndex: number;
    total: number;
    onPrev: (event: React.MouseEvent | KeyboardEvent) => void;
    onNext: (event: React.MouseEvent | KeyboardEvent) => void;
};

const BoundingBoxHighlightNav = ({ currentIndex, total, onPrev, onNext }: Props): JSX.Element => {
    const intl = useIntl();
    const isPrevDisabled = currentIndex === 0;
    const isNextDisabled = currentIndex === total - 1;

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'ArrowLeft') {
                event.stopPropagation();
                if (!isPrevDisabled) {
                    onPrev(event);
                }
            } else if (event.key === 'ArrowRight') {
                event.stopPropagation();
                if (!isNextDisabled) {
                    onNext(event);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [isPrevDisabled, isNextDisabled, onPrev, onNext]);

    return (
        <div className="ba-BoundingBoxHighlightNav" data-testid="ba-BoundingBoxHighlightNav">
            <button
                aria-label={intl.formatMessage(messages.ariaLabelViewPrevReference)}
                className="ba-BoundingBoxHighlightNav-btn"
                data-testid="ba-BoundingBoxHighlightNav-prev"
                disabled={isPrevDisabled}
                onClick={onPrev}
                type="button"
            >
                <ChevronLeft width={20} height={20} />
            </button>
            <span className="ba-BoundingBoxHighlightNav-counter">
                {currentIndex + 1} / {total}
            </span>
            <button
                aria-label={intl.formatMessage(messages.ariaLabelViewNextReference)}
                className="ba-BoundingBoxHighlightNav-btn"
                data-testid="ba-BoundingBoxHighlightNav-next"
                disabled={isNextDisabled}
                onClick={onNext}
                type="button"
            >
                <ChevronRight width={20} height={20} />
            </button>
        </div>
    );
};

export default BoundingBoxHighlightNav;
