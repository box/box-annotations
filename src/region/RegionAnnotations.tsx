import merge from 'lodash/merge';
import * as React from 'react';
import { EditorState, ContentState } from 'draft-js';
import { IntlShape } from 'react-intl';
import PopupReply from '../components/Popups/PopupReply';
import { mentionDecorator } from '../components/Popups/ReplyField';
import RegionAnnotation from './RegionAnnotation';
import RegionCreator from './RegionCreator';
import RegionList from './RegionList';
import { AnnotationRegion, Rect } from '../@types';
import { CreatorItem, CreatorStatus } from '../store/creator';
import { scaleShape } from './regionUtil';
import './RegionAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    createRegion: (arg: { location: number; message: string; shape: Rect }) => void;
    intl: IntlShape;
    isCreating: boolean;
    page: number;
    scale: number;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setStaged: (staged: CreatorItem | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItem | null;
    status: CreatorStatus;
};

type State = {
    targetRef?: HTMLAnchorElement;
    editorState: EditorState;
};

export default class RegionAnnotations extends React.Component<Props, State> {
    static defaultProps = {
        annotations: [],
        isCreating: false,
        scale: 1,
    };

    constructor(props: Props) {
        super(props);

        let editorState = EditorState.createEmpty(mentionDecorator);
        if (props.staged && props.staged.message) {
            const contentState = ContentState.createFromText(props.staged.message);
            editorState = EditorState.createWithContent(contentState, mentionDecorator);
        }

        this.state = { editorState };
    }

    setStaged(data: Partial<CreatorItem> | null): void {
        const { page, setStaged, staged } = this.props;
        setStaged(data ? merge({ location: page, message: '' }, staged, data) : data);
    }

    setStatus(status: CreatorStatus): void {
        const { setStatus } = this.props;
        setStatus(status);
    }

    handleAnnotationActive = (annotationId: string): void => {
        const { setActiveAnnotationId } = this.props;

        setActiveAnnotationId(annotationId);
    };

    handleCancel = (): void => {
        this.setStaged(null);
        this.setStatus(CreatorStatus.init);
    };

    handleChange = (nextEditorState: EditorState): void => {
        this.setState({ editorState: nextEditorState });
        this.setStaged({ message: nextEditorState.getCurrentContent().getPlainText() });
    };

    handleDraw = (rawShape: Rect): void => {
        const { scale, staged } = this.props;
        const newShape = scaleShape(rawShape, scale, true);
        const prevShape = staged && staged.shape;

        if (
            prevShape &&
            prevShape.height === newShape.height &&
            prevShape.width === newShape.width &&
            prevShape.x === newShape.x &&
            prevShape.y === newShape.y
        ) {
            return;
        }

        this.setStaged({ shape: newShape }); // Store at a scale of 1
    };

    handleStart = (): void => {
        this.setStatus(CreatorStatus.init);
    };

    handleStop = (): void => {
        this.setStatus(CreatorStatus.staged);
    };

    handleSubmit = (): void => {
        const { createRegion, staged } = this.props;

        if (!staged) {
            return;
        }

        createRegion(staged);
    };

    setTargetRef = (targetRef: HTMLAnchorElement): void => {
        this.setState({ targetRef });
    };

    render(): JSX.Element {
        const { activeAnnotationId, annotations, intl, isCreating, scale, staged, status } = this.props;
        const { targetRef, editorState } = this.state;
        const canDraw = !staged || !staged.message;
        const isPending = status === CreatorStatus.pending;
        const canReply = status === CreatorStatus.staged || isPending;

        return (
            <>
                {/* Layer 1: Saved annotations */}
                <RegionList
                    activeId={isCreating ? null : activeAnnotationId}
                    annotations={annotations}
                    className="ba-RegionAnnotations-list"
                    onSelect={this.handleAnnotationActive}
                    scale={scale}
                />

                {/* Layer 2: Transparent layer to handle click/drag events */}
                {isCreating && (
                    <RegionCreator
                        canDraw={canDraw}
                        className="ba-RegionAnnotations-creator"
                        onDraw={this.handleDraw}
                        onStart={this.handleStart}
                        onStop={this.handleStop}
                    />
                )}

                {/* Layer 3a: New, unsaved annotation target, if any */}
                {isCreating && staged && (
                    <svg className="ba-RegionAnnotations-target">
                        <RegionAnnotation
                            ref={this.setTargetRef}
                            annotationId="staged"
                            isActive
                            shape={scaleShape(staged.shape, scale)}
                        />
                    </svg>
                )}

                {/* Layer 3b: New, unsaved annotation description popup, if 3a is ready */}
                {isCreating && staged && canReply && targetRef && (
                    <div className="ba-RegionAnnotations-popup">
                        <PopupReply
                            editorState={editorState}
                            intl={intl}
                            isPending={isPending}
                            onCancel={this.handleCancel}
                            onChange={this.handleChange}
                            onSubmit={this.handleSubmit}
                            reference={targetRef}
                        />
                    </div>
                )}
            </>
        );
    }
}
