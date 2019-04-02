// <reference types="Cypress" />
describe('Annotations Sanity', () => {
    let token;

    beforeEach(() => {
        token = Cypress.env('ACCESS_TOKEN');
        cy.visit('/');
    });

    it('Should load a document with an annotation', () => {
        const fileId = Cypress.env('FILE_ID_DOC');

        // Show the preview
        cy.showPreview(token, fileId);
        // Wait for .bp to load viewer
        cy.getByTestId('bp').should('have.class', 'bp-loaded');
        // Asserts that an annotation point icon has rendered
        cy.getByTestId('annotation-marker');
        // Assert document content is present
        cy.contains('The Content Platform for Your Apps');
    });
});
