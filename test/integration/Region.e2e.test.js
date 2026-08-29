/// <reference types="Cypress" />
describe('Regions', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should create a new region on a document', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC'));

        // Wait for the empty region layer to be present
        cy.getByTestId('ba-Layer--region');

        // Assert that no annotations are present
        cy.get('.ba-RegionAnnotation').should('not.exist');

        // Enter region creation mode
        cy.getByTestId('bp-AnnotationsControls-regionBtn').click();

        // Add a region annotation on the document
        cy.drawRegion();
        cy.submitReply();

        // Assert that at least one annotation is present on the document and is active
        cy.get('.ba-RegionAnnotation').should('have.class', 'is-active');

        // Exit region creation mode
        cy.getByTestId('bp-AnnotationsControls-regionBtn').click();

        // Assert that annotation target is not active
        cy.get('.ba-RegionAnnotation').should('not.have.class', 'is-active');

        // Select annotation target
        cy.get('.ba-RegionAnnotation').click();

        // Assert that annotation target is active
        cy.get('.ba-RegionAnnotation').should('have.class', 'is-active');

        // Select annotation target again should be a noop, it should remain active
        cy.get('.ba-RegionAnnotation').click();

        // Assert that annotation target is active
        cy.get('.ba-RegionAnnotation').should('have.class', 'is-active');
    });

    it('should create a new region on an image', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE'));

        // Wait for the empty region layer to be present
        cy.getByTestId('ba-Layer--region');

        // Assert that no annotations are present
        cy.get('.ba-RegionAnnotation').should('not.exist');

        // Add a region annotation on the image
        cy.drawRegion();
        cy.submitReply();

        // Assert that at least one annotation is present on the image and is active
        cy.get('.ba-RegionAnnotation').should('have.class', 'is-active');

        // Select annotation target again should be a noop, it should remain active
        cy.get('.ba-RegionAnnotation').click();

        // Assert that annotation target is active
        cy.get('.ba-RegionAnnotation').should('have.class', 'is-active');
    });

    it('should hide region button for rotated image', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE'));

        // The parent ControlsLayer starts at opacity 0 until a real pointer enters, and Cypress
        // synthetic mouseenter events do not reach React 18's onMouseEnter reliably. Since the app
        // unmounts the button entirely on rotate (AnnotationsButton returns null when isEnabled=false),
        // exist/not.exist is a truthful check that does not depend on the fade state.
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('exist');

        // Rotate image
        cy.getByTitle('Rotate left').click({ force: true });

        // Assert region button is unmounted
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('not.exist');

        // Rotate image back to non-rotated state
        cy.getByTitle('Rotate left')
            .click({ force: true })
            .click({ force: true })
            .click({ force: true });

        // Assert region button is remounted
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('exist');
    });
});
