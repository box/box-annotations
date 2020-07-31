// <reference types="Cypress" />
describe('Regions', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should create a new region on a document', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC'));

        // Wait for the empty region layer to be present
        cy.getByTestId('ba-Layer--region');

        // Assert that the region creator does not exist and no annotations are present
        cy.getByTestId('ba-RegionCreator').should('not.exist');
        cy.get('[data-testid^="ba-AnnotationTarget"]').should('not.exist');

        // Enter region creation mode
        cy.getByTestId('bp-AnnotationsControls-regionBtn').click();

        // Draw a 50x50 region on the first page starting at x50, y50
        cy.drawRegion({ x: 50, y: 50, width: 50, height: 50 });
        cy.typeAndSubmitReplyForm();

        // Assert that at least one annotation is present on the document and is active
        cy.get('[data-testid^="ba-AnnotationTarget"]').should('have.class', 'is-active');

        // Exit region creation mode
        cy.getByTestId('bp-AnnotationsControls-regionBtn').click();

        // Assert that annotation target is not active
        cy.get('[data-testid^="ba-AnnotationTarget"]').should('not.have.class', 'is-active');

        // Select annotation target
        cy.get('[data-testid^="ba-AnnotationTarget"]').click();

        // Assert that annotation target is active
        cy.get('[data-testid^="ba-AnnotationTarget"]').should('have.class', 'is-active');
    });

    it('should create a new region on an image', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE'));

        // Wait for the empty region layer to be present
        cy.getByTestId('ba-Layer--region');

        // Assert that the region creator does not exist and no annotations are present
        cy.getByTestId('ba-RegionCreator').should('not.exist');
        cy.get('[data-testid^="ba-AnnotationTarget"]').should('not.exist');

        // Enter region creation mode
        cy.getByTestId('bp-AnnotationsControls-regionBtn').click();

        // Add a region annotation on the image
        cy.drawRegion();
        cy.typeAndSubmitReplyForm();

        // Assert that at least one annotation is present on the image and is active
        cy.get('[data-testid^="ba-AnnotationTarget"]').should('have.class', 'is-active');
    });

    it('should hide region button for rotated image', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE'));

        // Assert region button is not hidden
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('be.visible');

        // Rotate image
        cy.getByTitle('Rotate left').click();

        // Assert region button is hidden
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('not.be.visible');

        // Rotate image back to non-rotated state
        cy.getByTitle('Rotate left')
            .click()
            .click()
            .click();

        // Assert region button is not hidden
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('be.visible');
    });
});
