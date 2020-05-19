import { EditorState } from 'draft-js';

export type PropsFromState = {
    cursorPosition: number;
};

export type ContainerProps = {
    isPending: boolean;
    onCancel: (text: string) => void;
    onChange: (text: string) => void;
    onSubmit: (text: string) => void;
    value?: string;
} & PropsFromState;

export type FormErrors = {
    [V in keyof FormValues]?: string;
};

export type FormValues = {
    editorState: EditorState;
};
