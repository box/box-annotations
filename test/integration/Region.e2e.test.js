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
        cy.getByTestId('ba-RegionCreator')
            .first()
            .trigger('mousedown', {
                buttons: 1,
                clientX: 50,
                clientY: 50,
            })
            .trigger('mousemove', {
                buttons: 1,
                clientX: 100,
                clientY: 100,
            })
            .trigger('mouseup');

        // Type a message in the reply form and save the new annotation
        cy.getByTestId('ba-ReplyField-editor').type('This is an automated test annotation.');
        cy.getByTestId('ba-Popup-submit').click();

        // Assert that at least one annotation is present on the image
        cy.get('[data-testid^="ba-AnnotationTarget"]');
    });
});
