/* eslint-disable no-unused-expressions */
import BoxAnnotations from '../BoxAnnotations';
import { TYPES } from '../constants';
import * as util from '../util';
import DrawingModeController from '../controllers/DrawingModeController';

let loader;

describe('BoxAnnotations', () => {
    beforeEach(() => {
        loader = new BoxAnnotations();
    });

    afterEach(() => {
        if (typeof loader.destroy === 'function') {
            loader.destroy();
        }

        loader = null;
    });

    describe('getAnnotators()', () => {
        it("should return the loader's annotators", () => {
            expect(loader.getAnnotators()).toStrictEqual(loader.annotators);
        });

        it("should return an empty array if the loader doesn't have annotators", () => {
            loader.annotators = [];
            expect(loader.getAnnotators()).toStrictEqual([]);
        });
    });

    describe('getAnnotatorsForViewer()', () => {
        beforeEach(() => {
            loader.instantiateControllers = jest.fn();
        });

        it('should return undefined if the annotator does not exist', () => {
            const annotator = loader.getAnnotatorsForViewer('not_supported_type');
            expect(annotator).toBeUndefined();
            expect(loader.instantiateControllers).toBeCalled();
        });

        it('should return the correct annotator for the viewer name', () => {
            const name = 'Document';
            const annotator = loader.getAnnotatorsForViewer(name);
            expect(annotator.NAME).toEqual(name); // First entry is Document annotator
            expect(loader.instantiateControllers).toBeCalled();
        });

        it('should return nothing if the viewer requested is disabled', () => {
            const annotator = loader.getAnnotatorsForViewer('Document', ['Document']);
            expect(annotator).toBeUndefined();
            expect(loader.instantiateControllers).toBeCalled();
        });
    });

    describe('instantiateControllers()', () => {
        it('Should do nothing when a controller exists', () => {
            const config = {
                CONTROLLERS: {
                    [TYPES.draw]: {
                        CONSTRUCTOR: jest.fn(),
                    },
                },
            };

            expect(() => loader.instantiateControllers(config)).not.toThrow();
        });

        it('Should do nothing when given an undefined object', () => {
            const config = undefined;
            expect(() => loader.instantiateControllers(config)).not.toThrow();
        });

        it('Should do nothing when config has no types', () => {
            const config = {
                TYPE: undefined,
            };
            expect(() => loader.instantiateControllers(config)).not.toThrow();
        });

        it('Should instantiate controllers and assign them to the CONTROLLERS attribute', () => {
            const config = {
                TYPE: [TYPES.draw, 'typeWithoutController'],
            };
            loader.viewerConfig = { enabledTypes: [TYPES.draw] };

            loader.instantiateControllers(config);
            expect(config.CONTROLLERS).not.toEqual(undefined);
            expect(config.CONTROLLERS[TYPES.draw] instanceof DrawingModeController).toBeTruthy();
            const assignedControllers = Object.keys(config.CONTROLLERS);
            expect(assignedControllers.length).toEqual(1);
        });
    });

    describe('getAnnotatorTypes()', () => {
        const config = {
            NAME: 'Document',
            VIEWER: ['Document'],
            TYPE: ['point', 'highlight', 'highlight-comment', 'draw'],
            DEFAULT_TYPES: ['point', 'highlight'],
        };

        it('should use the specified types from options', () => {
            loader.viewerOptions = {
                Document: { enabledTypes: ['draw'] },
            };
            expect(loader.getAnnotatorTypes(config)).toStrictEqual(['draw']);
        });

        it('should filter disabled annotation types from the annotator.TYPE', () => {
            loader.viewerConfig = { disabledTypes: ['point'] };
            expect(loader.getAnnotatorTypes(config)).toStrictEqual(['highlight']);
        });

        it('should filter and only keep allowed types of annotations', () => {
            loader.viewerConfig = { enabledTypes: ['point', 'timestamp'] };
            expect(loader.getAnnotatorTypes(config)).toStrictEqual(['point']);

            loader.viewerOptions = {
                Document: {
                    enabledTypes: ['point', 'timestamp'],
                },
            };
            expect(loader.getAnnotatorTypes(config)).toStrictEqual(['point']);
        });

        it('should respect default annotators if none provided', () => {
            expect(loader.getAnnotatorTypes(config)).toStrictEqual(['point', 'highlight']);
        });
    });

    describe('determineAnnotator()', () => {
        let annotator;
        let options;

        beforeEach(() => {
            util.canLoadAnnotations = jest.fn().mockReturnValue(true);
            loader.instantiateControllers = jest.fn();

            annotator = {
                NAME: 'Document',
                VIEWER: ['Document'],
                TYPE: ['point'],
                DEFAULT_TYPES: ['point'],
            };

            options = {
                file: {
                    permissions: {},
                },
                viewer: {
                    NAME: 'Document',
                },
            };
            loader.getAnnotatorTypes = jest.fn().mockReturnValue(['point']);
        });

        it('should not return an annotator if the user has incorrect permissions/scopes', () => {
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(annotator);
            util.canLoadAnnotations = jest.fn().mockReturnValue(false);
            expect(loader.determineAnnotator(options)).toBeNull();
        });

        it('should choose the first annotator that matches the viewer', () => {
            const viewer = 'Document';
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(annotator);
            const result = loader.determineAnnotator(options);
            expect(result.NAME).toEqual(viewer);
            expect(loader.getAnnotatorsForViewer).toBeCalled();
        });

        it('should not return an annotator if no matching annotator is found', () => {
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(null);
            expect(loader.determineAnnotator(options)).toBeNull();
        });

        it('should return a copy of the annotator that matches', () => {
            const viewer = 'Document';

            const docAnnotator = {
                NAME: viewer,
                VIEWER: ['Document'],
                TYPE: ['point', 'highlight'],
                DEFAULT_TYPES: ['point'],
            };

            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(docAnnotator);
            const result = loader.determineAnnotator(options);

            annotator.NAME = 'another_name';
            expect(result.NAME).not.toEqual(annotator.NAME);
        });

        it('should return null if the config for the viewer disables annotations', () => {
            const config = {
                enabled: false,
            };
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(annotator);
            expect(loader.determineAnnotator(options, config)).toBeNull();
        });
    });
});
