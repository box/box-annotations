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
        cy.get('.ba-HighlightTarget-rect').click();

        // Assert that annotation target is active
        cy.get('.ba-HighlightTarget').should('have.class', 'is-active');

        // Select text to trigger promotion flow
        cy.selectText({ block: 2 });
        cy.getByTestId('ba-PopupHighlight-button').click();
        // Assert highlight creation mode is active
        cy.getByTestId('bp-AnnotationsControls-highlightBtn').should('have.class', 'is-active');
        // Create highlight annotation
        cy.submitReply();

        // Assert that one more highlight annotation is present on the document and is active
        cy.get('.ba-HighlightTarget')
            .should('have.length', 2)
            .should('have.class', 'is-active');

        // Assert highlight creation mode is not active
        cy.getByTestId('bp-AnnotationsControls-highlightBtn').should('not.have.class', 'is-active');
    });

    it('should restrict highlight annotation to single page', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC'));

        // Wait for the empty highlight layer to be present
        cy.getByTestId('ba-Layer--highlight');

        // Alias the last text block of the first textLayer
        cy.get('[data-page-number="1"')
            .find('.textLayer')
            .children()
            .last()
            .as('pageOneEndTextEl');

        // Select texts across pages
        cy.get('[data-page-number="2"')
            .find('.textLayer')
            .children()
            .first()
            .then($pageTwoStartTextEl => {
                cy.get('@pageOneEndTextEl')
                    .trigger('mousedown')
                    .then($pageOneEndTextEl => {
                        const pageOneEndTextEl = $pageOneEndTextEl[0];
                        const pageTwoStartTextEl = $pageTwoStartTextEl[0];
                        const document = pageOneEndTextEl.ownerDocument;
                        const range = document.createRange();
                        const selection = document.getSelection();
                        range.setStartBefore(pageOneEndTextEl);
                        range.setEndAfter(pageTwoStartTextEl);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    })
                    .trigger('mouseup');
            });

        // Assert error popup shows
        cy.getByTestId('ba-PopupHighlightError').contains('Comments restricted to single page');
    });
});
