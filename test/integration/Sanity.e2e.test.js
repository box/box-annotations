/// <reference types="Cypress" />
describe('Annotations', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should load annotations for a document file', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC_SANITY'));

        // Wait for viewer to load
        cy.get('.bp').should('have.class', 'bp-loaded');
        // Wait for annotations to load
        cy.get('.bp-doc').should('have.class', 'ba-annotations-loaded');

        // Assert document content is present
        cy.contains('The Content Platform for Your Apps');

        // Assert that at least one annotation is present on the document
        cy.get('[data-testid^="ba-AnnotationTarget"]');
    });

    it('should load annotations for an image file', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE_SANITY'));

        // Wait for viewer to load
        cy.get('.bp').should('have.class', 'bp-loaded');
        // Wait for annotations to load
        cy.get('.bp-image').should('have.class', 'ba-annotations-loaded');

        // Assert that at least one annotation is present on the image
        cy.get('[data-testid^="ba-AnnotationTarget"]');
    });
});
