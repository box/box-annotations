import BoxAnnotations from '../BoxAnnotations';
import DrawingModeController from '../controllers/DrawingModeController';
import { TYPES } from '../constants';

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

    describe('canLoad()', () => {
        let permissions;

        beforeEach(() => {
            permissions = {
                can_annotate: false,
                can_view_annotations_all: false,
                can_view_annotations_self: false,
            };
        });

        it('should return false if permissions do not exist', () => {
            expect(loader.canLoad()).toBe(false);
        });

        it('should return true if user has at least can_annotate permissions', () => {
            permissions.can_annotate = true;
            expect(loader.canLoad(permissions)).toBe(true);
        });

        it('should return true if user has at least can_view_annotations_all permissions', () => {
            permissions.can_view_annotations_all = true;
            expect(loader.canLoad(permissions)).toBe(true);
        });

        it('should return true if user has at least can_view_annotations_self permissions', () => {
            permissions.can_view_annotations_self = true;
            expect(loader.canLoad(permissions)).toBe(true);
        });
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
        it('should return undefined if the annotator does not exist', () => {
            const annotator = loader.getAnnotatorsForViewer('not_supported_type');
            expect(annotator).toBeUndefined();
        });

        it('should return the correct annotator for the viewer name', () => {
            const name = 'Document';
            const annotator = loader.getAnnotatorsForViewer(name);
            expect(annotator.NAME).toEqual(name); // First entry is Document annotator
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
                TYPES: undefined,
            };
            expect(() => loader.instantiateControllers(config)).not.toThrow();
        });

        it('Should instantiate controllers and assign them to the CONTROLLERS attribute', () => {
            const config = {
                TYPES: [TYPES.draw, 'typeWithoutController'],
            };
            loader.viewerConfig = { enabledTypes: [TYPES.draw] };
            loader.instantiateControllers(config);
            expect(config.CONTROLLERS).not.toEqual(undefined);
            expect(config.CONTROLLERS[TYPES.draw] instanceof DrawingModeController).toBeTruthy();
            const assignedControllers = Object.keys(config.CONTROLLERS);
            expect(assignedControllers.length).toEqual(1);
        });
    });

    describe('determineAnnotator()', () => {
        let annotator;
        let options;

        beforeEach(() => {
            loader.canLoad = jest.fn().mockReturnValue(true);
            loader.instantiateControllers = jest.fn(val => val);

            annotator = {
                NAME: 'Document',
                VIEWER: ['Document'],
                TYPES: ['point'],
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
        });

        it('should use the specified types from options', () => {
            loader.viewerOptions = {
                Document: { enabledTypes: ['draw'] },
            };
            expect(loader.determineAnnotator(options).TYPES).toStrictEqual(['draw']);
        });

        it('should filter and only keep allowed types of annotations', () => {
            const viewerConfig = { enabledTypes: ['point', 'timestamp'] };
            expect(loader.determineAnnotator(options, viewerConfig).TYPES).toStrictEqual(['point']);

            loader.viewerOptions = {
                Document: {
                    enabledTypes: ['point', 'timestamp'],
                },
            };
            expect(loader.determineAnnotator(options).TYPES).toStrictEqual(['point']);
        });

        it('should respect default annotators if none provided', () => {
            expect(loader.determineAnnotator(options).TYPES).toStrictEqual([
                'draw',
                'highlight',
                'highlight-comment',
                'point',
            ]);
        });

        it('should not return an annotator if the user has incorrect permissions/scopes', () => {
            loader.canLoad = jest.fn().mockReturnValue(false);
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(annotator);
            expect(loader.determineAnnotator(options)).toBeNull();
        });

        it('should choose the first annotator that matches the viewer', () => {
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(annotator);

            const result = loader.determineAnnotator(options);
            expect(result.NAME).toEqual('Document');
            expect(loader.getAnnotatorsForViewer).toBeCalled();
        });

        it('should not return an annotator if no matching annotator is found', () => {
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(null);
            expect(loader.determineAnnotator(options)).toBeNull();
        });

        it('should return a copy of the annotator that matches', () => {
            const docAnnotator = {
                NAME: 'Document',
                VIEWER: ['Document'],
                TYPES: ['point', 'highlight'],
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
