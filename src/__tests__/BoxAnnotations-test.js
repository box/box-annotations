import BoxAnnotations from '../BoxAnnotations';

describe('BoxAnnotations', () => {
    let loader;

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

    describe('determineAnnotator()', () => {
        let annotator;
        let options;

        beforeEach(() => {
            loader.canLoad = jest.fn().mockReturnValue(true);

            annotator = {
                NAME: 'Document',
                VIEWER: ['Document'],
                TYPES: ['region'],
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
                Document: { enabledTypes: ['region'] },
            };
            expect(loader.determineAnnotator(options).TYPES).toStrictEqual(['region']);
        });

        it('should filter and only keep allowed types of annotations', () => {
            const viewerConfig = { enabledTypes: ['region', 'timestamp'] };
            expect(loader.determineAnnotator(options, viewerConfig).TYPES).toStrictEqual(['region']);

            loader.viewerOptions = {
                Document: {
                    enabledTypes: ['region', 'timestamp'],
                },
            };
            expect(loader.determineAnnotator(options).TYPES).toStrictEqual(['region']);
        });

        it('should respect default annotators if none provided', () => {
            expect(loader.determineAnnotator(options).TYPES).toStrictEqual(['region']);
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
                TYPES: ['region'],
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

    describe('getOptions', () => {
        it.each([undefined, { messages: { test: 'Hello' } }])(
            'should return the passed in options when they are %o',
            mockOptions => {
                loader = new BoxAnnotations(null, mockOptions);

                const options = loader.getOptions();

                expect(options).toEqual(mockOptions);
            },
        );
    });
});
