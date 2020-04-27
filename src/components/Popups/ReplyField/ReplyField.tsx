import React from 'react';
import classnames from 'classnames';
import { Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';

import './ReplyField.scss';

export type Props = {
    className?: string;
    isDisabled?: boolean;
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
    onClick: (event: React.SyntheticEvent) => void;
    onMention?: (mention: string) => void;
    placeholder?: string;
    value?: string;
};

const ReplyField = (props: Props, ref: React.Ref<Editor>): JSX.Element => {
    const { className, editorState, isDisabled, placeholder, ...rest } = props;

    return (
        <div className={classnames(className, 'ba-ReplyField')}>
            <Editor
                ref={ref}
                editorState={editorState}
                placeholder={placeholder}
                readOnly={isDisabled}
                stripPastedStyles
                {...rest}
            />
        </div>
    );
};

export default React.forwardRef(ReplyField);
