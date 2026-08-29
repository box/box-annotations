/// <reference types="Cypress" />
describe('Drawing', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should create a new drawing annotation on a document', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC'));

        // Wait for the empty drawing layer to be present
        cy.getByTestId('ba-Layer--drawing');

        // Assert that the drawing creator does not exist and no annotations are present
        cy.getByTestId('ba-DrawingCreator').should('not.exist');
        cy.get('.ba-DrawingTarget').should('not.exist');

        // Enter drawing creation mode
        cy.getByTestId('bp-AnnotationsControls-drawBtn').click();

        // Add a drawing annotation on the document
        cy.drawStroke();
        // Support multiple draws
        cy.drawStroke({ x: 300 });
        cy.getByTestId('ba-PopupDrawingToolbar-comment').click();
        cy.submitReply();

        // Assert that at least one annotation is present on the document and is active
        cy.get('.ba-DrawingTarget').should('have.class', 'is-active');

        // Exit drawing creation mode; DrawingCreator overlays the toolbar button
        cy.getByTestId('bp-AnnotationsControls-drawBtn').click({ force: true });

        // Assert that annotation target is not active
        cy.get('.ba-DrawingTarget').should('not.have.class', 'is-active');

        // Select annotation target
        cy.get('.ba-DrawingTarget').click();

        // Assert that annotation target is active
        cy.get('.ba-DrawingTarget').should('have.class', 'is-active');

        // Select annotation target should be a noop, it should remain active
        cy.get('.ba-DrawingTarget').click();

        // Assert that annotation target is active
        cy.get('.ba-DrawingTarget').should('have.class', 'is-active');
    });

    it('should show right drawing button status', () => {
        cy.showPreview(Cypress.env('FILE_ID_DOC'));

        cy.getByTestId('ba-Layer--drawing');

        cy.getByTestId('bp-AnnotationsControls-drawBtn').click();

        cy.drawStroke();
        cy.getByTestId('ba-PopupDrawingToolbar-undo').should('not.be.disabled');
        cy.getByTestId('ba-PopupDrawingToolbar-redo').should('be.disabled');
        cy.getByTestId('ba-PopupDrawingToolbar-comment').should('not.be.disabled');

        cy.getByTestId('ba-PopupDrawingToolbar-undo').click();
        cy.getByTestId('ba-PopupDrawingToolbar-undo').should('be.disabled');
        cy.getByTestId('ba-PopupDrawingToolbar-redo').should('not.be.disabled');
        cy.getByTestId('ba-PopupDrawingToolbar-comment').should('be.disabled');

        cy.getByTestId('ba-PopupDrawingToolbar-redo').click();
        cy.getByTestId('ba-PopupDrawingToolbar-undo').should('not.be.disabled');
        cy.getByTestId('ba-PopupDrawingToolbar-redo').should('be.disabled');
        cy.getByTestId('ba-PopupDrawingToolbar-comment').should('not.be.disabled');

        cy.getByTestId('ba-PopupDrawingToolbar-undo').click();
        cy.getByTestId('ba-PopupDrawingToolbar-redo').should('not.be.disabled');
        cy.drawStroke();
        cy.getByTestId('ba-PopupDrawingToolbar-redo').should('be.disabled');

        cy.getByTestId('ba-PopupDrawingToolbar-comment').click();
        cy.submitReply();

        cy.get('.ba-DrawingTarget').should('have.class', 'is-active');
    });

    it('should create a new drawing on an image', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE'));

        // Wait for the empty drawing layer to be present
        cy.getByTestId('ba-Layer--drawing');

        // Assert that the drawing creator does not exist and no annotations are present
        cy.getByTestId('ba-DrawingCreator').should('not.exist');
        cy.get('.ba-DrawingTarget').should('not.exist');

        // Enter drawing creation mode
        cy.getByTestId('bp-AnnotationsControls-drawBtn').click();

        // Add a drawing annotation on the image
        cy.drawStroke();
        // Support multiple draws
        cy.drawStroke({ x: 300 });
        cy.getByTestId('ba-PopupDrawingToolbar-comment').click();
        cy.submitReply();

        // Assert that at least one annotation is present on the image and is active
        cy.get('.ba-DrawingTarget').should('have.class', 'is-active');

        // Exit drawing creation mode; DrawingCreator overlays the toolbar button
        cy.getByTestId('bp-AnnotationsControls-drawBtn').click({ force: true });

        // Select annotation target
        cy.get('.ba-DrawingTarget').click();

        // Assert that annotation target is active
        cy.get('.ba-DrawingTarget').should('have.class', 'is-active');

        // Select annotation target should be a noop, it should remain active
        cy.get('.ba-DrawingTarget').click();

        // Assert that annotation target is active
        cy.get('.ba-DrawingTarget').should('have.class', 'is-active');
    });

    it('should preserve drawing annotations across image rotation', () => {
        cy.showPreview(Cypress.env('FILE_ID_IMAGE'));

        cy.getByTestId('bp-AnnotationsControls-drawBtn').click({ force: true });

        cy.drawStroke();
        cy.getByTestId('ba-PopupDrawingToolbar-comment').click();
        cy.submitReply();

        cy.get('.ba-DrawingTarget').should('exist');

        cy.getByTitle('Rotate left').click({ force: true });
        cy.get('.ba-DrawingTarget').should('exist');

        cy.getByTitle('Rotate left').click({ force: true });
        cy.get('.ba-DrawingTarget').should('exist');

        cy.getByTitle('Rotate left').click({ force: true });
        cy.get('.ba-DrawingTarget').should('exist');

        cy.getByTitle('Rotate left').click({ force: true });
        cy.get('.ba-DrawingTarget').should('exist');
    });
});
