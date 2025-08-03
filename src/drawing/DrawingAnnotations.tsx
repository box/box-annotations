import React from 'react';
import classNames from 'classnames';
import DecoratedDrawingPath from './DecoratedDrawingPath';
import DrawingList from './DrawingList';
import DrawingCreator from './DrawingCreator';
import DrawingPathGroup from './DrawingPathGroup';
import DrawingSVG, { DrawingSVGRef } from './DrawingSVG';
import DrawingSVGGroup from './DrawingSVGGroup';
import PopupDrawingToolbar, { PopupBaseRef } from '../components/Popups/PopupDrawingToolbar';
import { AnnotationDrawing, PathGroup } from '../@types';
import { CreatorItemDrawing, CreatorStatus } from '../store';
import './DrawingAnnotations.scss';
import { TARGET_TYPE_FRAME, TARGET_TYPE_PAGE  } from '../constants';

export type Props = {
    activeAnnotationId: string | null;
    addDrawingPathGroup: (pathGroup: PathGroup) => void;
    annotations: AnnotationDrawing[];
    canShowPopupToolbar: boolean;
    color: string;
    drawnPathGroups: Array<PathGroup>;
    isCreating: boolean;
    location: number;
    redoDrawingPathGroup: () => void;
    resetDrawing: () => void;
    setActiveAnnotationId: (annotationId: string | null) => void;
    setReferenceId: (uuid: string) => void;
    setStaged: (staged: CreatorItemDrawing | null) => void;
    setStatus: (status: CreatorStatus) => void;
    setupDrawing: (location: number) => void;
    stashedPathGroups: Array<PathGroup>;
    undoDrawingPathGroup: () => void;
    targetType: typeof TARGET_TYPE_PAGE | typeof TARGET_TYPE_FRAME;
    referenceEl: HTMLElement;
};

const DrawingAnnotations = (props: Props): JSX.Element => {
    const {
        activeAnnotationId,
        addDrawingPathGroup,
        annotations,
        canShowPopupToolbar,
        color,
        drawnPathGroups,
        isCreating,
        location,
        redoDrawingPathGroup,
        resetDrawing,
        setActiveAnnotationId,
        setReferenceId,
        setStaged,
        setStatus,
        setupDrawing,
        stashedPathGroups, 
        undoDrawingPathGroup,
        targetType,
        referenceEl,
    } = props;
    const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
    const [stagedRootEl, setStagedRootEl] = React.useState<DrawingSVGRef | null>(null);
    const hasDrawnPathGroups = drawnPathGroups.length > 0;
    const hasStashedPathGroups = stashedPathGroups.length > 0;
    const hasPathGroups = hasDrawnPathGroups || hasStashedPathGroups;
    const popupDrawingToolbarRef = React.useRef<PopupBaseRef>(null);
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
    const handleRedo = (): void => {
        redoDrawingPathGroup();
    };
    const handleReply = (): void => {
        const annotationLocation = targetType !== TARGET_TYPE_FRAME ? location :(referenceEl as HTMLVideoElement).currentTime;
        setStaged({ location: annotationLocation, pathGroups: drawnPathGroups });
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
    const handleUndo = (): void => {
        undoDrawingPathGroup();
    };
    React.useEffect(() => {
        const { current: popup } = popupDrawingToolbarRef;
        if (popup?.popper && drawnPathGroups.length) {
            popup.popper.update();
        }
    }, [drawnPathGroups]);

    // change for video


    const annotationsToShow = targetType === TARGET_TYPE_FRAME ? annotations.filter(annotation => annotation.id === activeAnnotationId) : annotations;
    console.log('DrawingAnnotations', annotationsToShow);
    return (
        <>
            <DrawingList
                activeId={activeAnnotationId}
                annotations={annotationsToShow}
                className="ba-DrawingAnnotations-list"
                onSelect={handleAnnotationActive}
            />

            {hasPathGroups && (
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
                <DrawingCreator
                    className="ba-DrawingAnnotations-creator"
                    color={color}
                    onStart={handleStart}
                    onStop={handleStop}
                />
            )}

            {isCreating && hasPathGroups && drawingSVGGroup && canShowPopupToolbar && (
                <PopupDrawingToolbar
                    ref={popupDrawingToolbarRef}
                    canComment={hasDrawnPathGroups}
                    canRedo={hasStashedPathGroups}
                    canUndo={hasDrawnPathGroups}
                    className={classNames('ba-DrawingAnnotations-toolbar', { 'ba-is-drawing': isDrawing })}
                    onDelete={handleDelete}
                    onRedo={handleRedo}
                    onReply={handleReply}
                    onUndo={handleUndo}
                    reference={drawingSVGGroup}
                />
            )}
        </>
    );
};

export default DrawingAnnotations;
