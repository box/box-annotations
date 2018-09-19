// @flow
import React from 'react';
import classNames from 'classnames';

import PlainButton from 'box-react-ui/lib/components/plain-button';
import IconHighlightAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightAnnotation';
import IconHighlightCommentAnnotation from 'box-react-ui/lib/icons/annotations/IconHighlightCommentAnnotation';

import './HighlightControls.scss';

type Props = {
    canDelete: boolean,
    canAnnotate: boolean,
    canComment: boolean,
    isPending?: boolean,
    onCreate: Function,
    onCommentClick: Function
};

class HighlightControls extends React.PureComponent<Props> {
    static defaultProps = {
        canDelete: false,
        canAnnotate: false,
        isPending: false
    };

    render() {
        const { canDelete, canAnnotate, canComment, onCreate, onCommentClick, isPending } = this.props;
        return (
            <div className='ba-action-controls-highlight'>
                {(canAnnotate || canDelete) && (
                    <PlainButton type='button' className='ba-highlight-btn' onClick={onCreate} isDisabled={isPending}>
                        <IconHighlightAnnotation
                            className={classNames({
                                'ba-saved-highlight': !isPending
                            })}
                        />
                    </PlainButton>
                )}
                {canComment && (
                    <PlainButton type='button' className='ba-highlight-comment-btn' onClick={onCommentClick}>
                        <IconHighlightCommentAnnotation />
                    </PlainButton>
                )}
            </div>
        );
    }
}

export default HighlightControls;
