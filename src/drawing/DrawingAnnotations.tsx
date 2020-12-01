import * as React from 'react';
import * as uuid from 'uuid';
import DrawingList from './DrawingList';
import DrawingCreator from './DrawingCreator';
import DrawingPathGroup from './DrawingPathGroup';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import { AnnotationDrawing, PathGroup } from '../@types';
import { CreatorItemDrawing, CreatorStatus } from '../store';
import './DrawingAnnotations.scss';

export type Props = {
    activeAnnotationId: string | null;
    addStagedPathGroup: (pathGroup: PathGroup) => void;
    annotations: AnnotationDrawing[];
    isCreating: boolean;
    isCurrentFileVersion: boolean;
    location: number;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setStaged: (staged: CreatorItemDrawing | null) => void;
    setStatus: (status: CreatorStatus) => void;
    staged?: CreatorItemDrawing | null;
};

const DrawingAnnotations = (props: Props): JSX.Element => {
    const {
        activeAnnotationId,
        addStagedPathGroup,
        annotations,
        isCreating,
        isCurrentFileVersion,
        location,
        setActiveAnnotationId,
        setStaged,
        setStatus,
        staged,
    } = props;
    const [stagedRootEl, setStagedRootEl] = React.useState<DrawingSVGRef | null>(null);
    const uuidRef = React.useRef<string>(uuid.v4());

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };
    const handleStart = (): void => {
        if (staged === null) {
            setStaged(null);
        }
        setStatus(CreatorStatus.started);
    };
    const handleStop = (pathGroup: PathGroup): void => {
        // If staged is null, then we need to create the initial CreatorItemDrawing shape,
        // otherwise, add the the path group to the existing staged shape
        if (!staged) {
            setStaged({
                drawnPathGroups: [pathGroup],
                location,
                stashedPathGroups: [],
            });
        } else {
            addStagedPathGroup(pathGroup);
        }

        setStatus(CreatorStatus.staged);
    };

    return (
        <>
            <DrawingList
                activeId={activeAnnotationId}
                annotations={annotations}
                className="ba-DrawingAnnotations-list"
                data-resin-iscurrent={isCurrentFileVersion}
                onSelect={handleAnnotationActive}
            />

            {staged && (
                <DrawingSVG ref={setStagedRootEl} className="ba-DrawingAnnotations-target">
                    <g data-ba-reference-id={uuidRef.current}>
                        {staged.drawnPathGroups.map(pathGroup => (
                            <DrawingPathGroup key={pathGroup.clientId} pathGroup={pathGroup} rootEl={stagedRootEl} />
                        ))}
                    </g>
                </DrawingSVG>
            )}

            {isCreating && (
                <DrawingCreator className="ba-DrawingAnnotations-creator" onStart={handleStart} onStop={handleStop} />
            )}
        </>
    );
};

export default DrawingAnnotations;
