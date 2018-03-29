/* eslint-disable no-unused-expressions */
import BoxAnnotations from '../BoxAnnotations';
import { TYPES } from '../constants';
import * as util from '../util';
import DrawingModeController from '../controllers/DrawingModeController';

let loader;
let stubs;
const sandbox = sinon.sandbox.create();

describe('BoxAnnotations', () => {
    beforeEach(() => {
        stubs = {};
        loader = new BoxAnnotations();
    });

    afterEach(() => {
        sandbox.verifyAndRestore();

        if (typeof loader.destroy === 'function') {
            loader.destroy();
        }

        loader = null;
        stubs = null;
    });

    describe('getAnnotators()', () => {
        it('should return the loader\'s annotators', () => {
            expect(loader.getAnnotators()).to.deep.equal(loader.annotators);
        });

        it('should return an empty array if the loader doesn\'t have annotators', () => {
            loader.annotators = [];
            expect(loader.getAnnotators()).to.deep.equal([]);
        });
    });

    describe('getAnnotatorsForViewer()', () => {
        beforeEach(() => {
            stubs.instantiateControllers = sandbox.stub(loader, 'instantiateControllers');
        });
        it('should return undefined if the annotator does not exist', () => {
            const annotator = loader.getAnnotatorsForViewer('not_supported_type');
            expect(annotator).to.be.undefined;
            expect(stubs.instantiateControllers).to.be.called;
        });

        it('should return the correct annotator for the viewer name', () => {
            const name = 'Document';
            const annotator = loader.getAnnotatorsForViewer(name);
            expect(annotator.NAME).to.equal(name); // First entry is Document annotator
            expect(stubs.instantiateControllers).to.be.called;
        });

        it('should return nothing if the viewer requested is disabled', () => {
            const annotator = loader.getAnnotatorsForViewer('Document', ['Document']);
            expect(annotator).to.be.undefined;
            expect(stubs.instantiateControllers).to.be.called;
        });
    });

    describe('instantiateControllers()', () => {
        it('Should do nothing when a controller exists', () => {
            const config = {
                CONTROLLERS: {
                    [TYPES.draw]: {
                        CONSTRUCTOR: sandbox.stub()
                    }
                }
            };

            expect(() => loader.instantiateControllers(config)).to.not.throw();
        });

        it('Should do nothing when given an undefined object', () => {
            const config = undefined;
            expect(() => loader.instantiateControllers(config)).to.not.throw();
        });

        it('Should do nothing when config has no types', () => {
            const config = {
                TYPE: undefined
            };
            expect(() => loader.instantiateControllers(config)).to.not.throw();
        });

        it('Should instantiate controllers and assign them to the CONTROLLERS attribute', () => {
            const config = {
                TYPE: [TYPES.draw, 'typeWithoutController']
            };
            loader.viewerConfig = { enabledTypes: [TYPES.draw] };

            loader.instantiateControllers(config);
            expect(config.CONTROLLERS).to.not.equal(undefined);
            expect(config.CONTROLLERS[TYPES.draw] instanceof DrawingModeController).to.be.true;
            const assignedControllers = Object.keys(config.CONTROLLERS);
            expect(assignedControllers.length).to.equal(1);
        });
    });

    describe('getAnnotatorTypes()', () => {
        beforeEach(() => {
            stubs.config = {
                NAME: 'Document',
                VIEWER: ['Document'],
                TYPE: ['point', 'highlight', 'highlight-comment', 'draw'],
                DEFAULT_TYPES: ['point', 'highlight']
            };
        });

        it('should use the specified types from options', () => {
            loader.viewerOptions = {
                Document: { enabledTypes: ['draw'] }
            };
            expect(loader.getAnnotatorTypes(stubs.config)).to.deep.equal(['draw']);
        });

        it('should filter disabled annotation types from the annotator.TYPE', () => {
            loader.viewerConfig = { disabledTypes: ['point'] };
            expect(loader.getAnnotatorTypes(stubs.config)).to.deep.equal(['highlight']);
        });

        it('should filter and only keep allowed types of annotations', () => {
            loader.viewerConfig = { enabledTypes: ['point', 'timestamp'] };
            expect(loader.getAnnotatorTypes(stubs.config)).to.deep.equal(['point']);

            loader.viewerOptions = {
                Document: {
                    enabledTypes: ['point', 'timestamp']
                }
            };
            expect(loader.getAnnotatorTypes(stubs.config)).to.deep.equal(['point']);
        });

        it('should respect default annotators if none provided', () => {
            expect(loader.getAnnotatorTypes(stubs.config)).to.deep.equal(['point', 'highlight']);
        });
    });

    describe('determineAnnotator()', () => {
        beforeEach(() => {
            stubs.instantiateControllers = sandbox.stub(loader, 'instantiateControllers');
            stubs.canLoad = sandbox.stub(util, 'canLoadAnnotations').returns(true);

            stubs.annotator = {
                NAME: 'Document',
                VIEWER: ['Document'],
                TYPE: ['point'],
                DEFAULT_TYPES: ['point']
            };

            stubs.options = {
                file: {
                    permissions: {}
                },
                viewer: {
                    NAME: 'Document'
                }
            };
            sandbox.stub(loader, 'getAnnotatorTypes').returns(['point']);
        });

        it('should not return an annotator if the user has incorrect permissions/scopes', () => {
            sandbox.stub(loader, 'getAnnotatorsForViewer').returns(stubs.annotator);
            stubs.canLoad.returns(false);
            expect(loader.determineAnnotator(stubs.options)).to.be.null;
        });

        it('should choose the first annotator that matches the viewer', () => {
            const viewer = 'Document';
            sandbox.stub(loader, 'getAnnotatorsForViewer').returns(stubs.annotator);
            const annotator = loader.determineAnnotator(stubs.options);
            expect(annotator.NAME).to.equal(viewer);
            expect(loader.getAnnotatorsForViewer).to.be.called;
        });

        it('should not return an annotator if no matching annotator is found', () => {
            sandbox.stub(loader, 'getAnnotatorsForViewer').returns(undefined);
            const annotator = loader.determineAnnotator(stubs.options);
            expect(annotator).to.be.null;
        });

        it('should return a copy of the annotator that matches', () => {
            const viewer = 'Document';

            const docAnnotator = {
                NAME: viewer,
                VIEWER: ['Document'],
                TYPE: ['point', 'highlight'],
                DEFAULT_TYPES: ['point']
            };

            sandbox.stub(loader, 'getAnnotatorsForViewer').returns(docAnnotator);
            const annotator = loader.determineAnnotator(stubs.options);

            stubs.annotator.NAME = 'another_name';
            expect(annotator.NAME).to.not.equal(stubs.annotator.NAME);
        });

        it('should return null if the config for the viewer disables annotations', () => {
            const config = {
                enabled: false
            };
            sandbox.stub(loader, 'getAnnotatorsForViewer').returns(stubs.annotator);
            const annotator = loader.determineAnnotator(stubs.options, config);
            expect(annotator).to.be.null;
        });
    });
});
