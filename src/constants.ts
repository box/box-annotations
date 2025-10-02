export const ANNOTATOR_EVENT = {
    fetch: 'annotationsfetched',
    error: 'annotationerror',
    scale: 'scaleannotations',
    setVisibility: 'annotationsetvisibility',
};

export const MOUSE_PRIMARY = 1;

/**
 * This is the default location index for video annotations.
 * Documents have locations that represent a page but that doesn't apply to 
 * videos as they have no pages. The annnotations managers take  locations as
 * parameters so we need to provide a default value that indicates that this is a 
 * video annotation.
 */
export const MEDIA_LOCATION_INDEX = -1;


export enum TARGET_TYPE {
    FRAME = 'frame',
    PAGE = 'page',
}
