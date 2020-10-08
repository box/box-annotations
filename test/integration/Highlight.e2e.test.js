/// <reference types="Cypress" />
describe('Highlights', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should create a new highlight on a document', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC'));

        // Wait for the empty highlight layer to be present
        cy.getByTestId('ba-Layer--highlight');

        // Assert that no highlight annotations are present
        cy.get('.ba-HighlightTarget').should('not.exist');

        // Enter highlight creation mode
        cy.getByTestId('bp-AnnotationsControls-highlightBtn').click();

        // Add a highlight annotation on the document
        cy.selectText();
        cy.submitReply();

        // Assert that at least one highlight annotation is present on the document and is active
        cy.get('.ba-HighlightTarget').should('have.class', 'is-active');

        // Exit highlight creation mode
        cy.getByTestId('bp-AnnotationsControls-highlightBtn').click();

        // Assert that annotation target is not active
        cy.get('.ba-HighlightTarget').should('not.have.class', 'is-active');

        // Select annotation target
        cy.get('.ba-HighlightTarget').click();

        // Assert that annotation target is active
        cy.get('.ba-HighlightTarget').should('have.class', 'is-active');
    });
});
