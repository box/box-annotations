import * as React from 'react';
import classNames from 'classnames';
import './HighlightCreator.scss';

type Props = {
    className?: string;
};

export default function HighlightCreator({ className }: Props): JSX.Element {
    return <div className={classNames(className, 'ba-HighlightCreator')} data-testid="ba-HighlightCreator" />;
}
