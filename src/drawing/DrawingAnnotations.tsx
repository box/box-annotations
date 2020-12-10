import React from 'react';
import classNames from 'classnames';
import DecoratedDrawingPath from './DecoratedDrawingPath';
import DrawingList from './DrawingList';
import DrawingCreator from './DrawingCreator';
import DrawingPathGroup from './DrawingPathGroup';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import DrawingSVGGroup from './DrawingSVGGroup';
import PopupDrawingToolbar from '../components/Popups/PopupDrawingToolbar';
import { AnnotationDrawing, PathGroup } from '../@types';
import { CreatorItemDrawing, CreatorStatus } from '../store';
import './DrawingAnnotations.scss';

export type Props = {
    activeAnnotationId: string | null;
    addDrawingPathGroup: (pathGroup: PathGroup) => void;
    annotations: AnnotationDrawing[];
    canShowPopupToolbar: boolean;
    drawnPathGroups: Array<PathGroup>;
    isCreating: boolean;
    location: number;
    resetDrawing: () => void;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setReferenceId: (uuid: string) => void;
    setStaged: (staged: CreatorItemDrawing | null) => void;
    setStatus: (status: CreatorStatus) => void;
    setupDrawing: (location: number) => void;
};

const DrawingAnnotations = (props: Props): JSX.Element => {
    const {
        activeAnnotationId,
        addDrawingPathGroup,
        annotations,
        canShowPopupToolbar,
        drawnPathGroups,
        isCreating,
        location,
        resetDrawing,
        setActiveAnnotationId,
        setReferenceId,
        setStaged,
        setStatus,
        setupDrawing,
    } = props;
    const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
    const [stagedRootEl, setStagedRootEl] = React.useState<DrawingSVGRef | null>(null);
    const hasDrawnPathGroups = drawnPathGroups.length > 0;
    const stagedGroupRef = React.useRef<SVGGElement>(null);
    const { current: drawingSVGGroup } = stagedGroupRef;

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };
    const handleDelete = (): void => {
        resetDrawing();
    };
    const handleDrawingMount = (uuid: string): void => {
        setReferenceId(uuid);
    };
    const handleReply = (): void => {
        setStaged({ location, pathGroups: drawnPathGroups });
        setStatus(CreatorStatus.staged);
    };
    const handleStart = (): void => {
        setupDrawing(location);
        setStatus(CreatorStatus.started);
        setIsDrawing(true);
    };
    const handleStop = (pathGroup: PathGroup): void => {
        addDrawingPathGroup(pathGroup);
        setIsDrawing(false);
    };

    return (
        <>
            <DrawingList
                activeId={activeAnnotationId}
                annotations={annotations}
                className="ba-DrawingAnnotations-list"
                onSelect={handleAnnotationActive}
            />

            {hasDrawnPathGroups && (
                <DrawingSVG ref={setStagedRootEl} className="ba-DrawingAnnotations-target">
                    {/* Group element to capture the bounding box around the drawn path groups */}
                    <DrawingSVGGroup ref={stagedGroupRef} onMount={handleDrawingMount}>
                        {drawnPathGroups.map(({ clientId: pathGroupClientId, paths, stroke }) => (
                            <DrawingPathGroup key={pathGroupClientId} rootEl={stagedRootEl} stroke={stroke}>
                                {/* Use the children render function to pass down the calculated strokeWidthWithBorder value */}
                                {strokeWidthWithBorder =>
                                    paths.map(({ clientId: pathClientId, points }) => (
                                        <DecoratedDrawingPath
                                            key={pathClientId}
                                            borderStrokeWidth={strokeWidthWithBorder}
                                            isDecorated
                                            points={points}
                                        />
                                    ))
                                }
                            </DrawingPathGroup>
                        ))}
                    </DrawingSVGGroup>
                </DrawingSVG>
            )}

            {isCreating && (
                <DrawingCreator className="ba-DrawingAnnotations-creator" onStart={handleStart} onStop={handleStop} />
            )}

            {isCreating && hasDrawnPathGroups && drawingSVGGroup && canShowPopupToolbar && (
                <PopupDrawingToolbar
                    className={classNames('ba-DrawingAnnotations-toolbar', { 'ba-is-drawing': isDrawing })}
                    onDelete={handleDelete}
                    onReply={handleReply}
                    reference={drawingSVGGroup}
                />
            )}
        </>
    );
};

export default DrawingAnnotations;
