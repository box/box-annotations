import { ApplicationState } from '../types';

const getAnnotationVisibility = (state: ApplicationState): boolean => state.common.visible;

// eslint-disable-next-line import/prefer-default-export
export { getAnnotationVisibility };
