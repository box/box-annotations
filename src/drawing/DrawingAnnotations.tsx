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
    addDrawingPathGroup: (pathGroup: PathGroup) => void;
    annotations: AnnotationDrawing[];
    drawnPathGroups: Array<PathGroup>;
    isCreating: boolean;
    location: number;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setDrawingLocation: (location: number) => void;
    setStaged: (staged: CreatorItemDrawing | null) => void;
    setStatus: (status: CreatorStatus) => void;
};

const DrawingAnnotations = (props: Props): JSX.Element => {
    const {
        activeAnnotationId,
        addDrawingPathGroup,
        annotations,
        drawnPathGroups,
        isCreating,
        location,
        setActiveAnnotationId,
        setDrawingLocation,
        setStatus,
    } = props;
    const [stagedRootEl, setStagedRootEl] = React.useState<DrawingSVGRef | null>(null);
    const uuidRef = React.useRef<string>(uuid.v4());

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };
    const handleStart = (): void => {
        setStatus(CreatorStatus.started);
        setDrawingLocation(location);
    };
    const handleStop = (pathGroup: PathGroup): void => {
        addDrawingPathGroup(pathGroup);
    };

    return (
        <>
            <DrawingList
                activeId={activeAnnotationId}
                annotations={annotations}
                className="ba-DrawingAnnotations-list"
                onSelect={handleAnnotationActive}
            />

            {drawnPathGroups && (
                <DrawingSVG ref={setStagedRootEl} className="ba-DrawingAnnotations-target">
                    <g data-ba-reference-id={uuidRef.current}>
                        {drawnPathGroups.map(({ clientId, paths, stroke }) => (
                            <DrawingPathGroup key={clientId} paths={paths} rootEl={stagedRootEl} stroke={stroke} />
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
