/// <reference types="Cypress" />
describe('Discoverability', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should be able to draw a region without entering the mode', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC_SANITY'));

        // Wait for the region layer to be present
        cy.getByTestId('ba-Layer--region');

        // Add a region annotation on the document
        cy.drawRegion();
        cy.getByTestId('ba-Popup-cancel').click();

        // Assert that annotation target is not active
        cy.get('.ba-RegionAnnotation').should('not.have.class', 'is-active');

        // Select annotation target
        cy.get('.ba-RegionAnnotation').click();

        // Assert that annotation target is active
        cy.get('.ba-RegionAnnotation').should('have.class', 'is-active');
    });

    it('should be able to promote a highlight without entering the mode', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_DOC_SANITY'));

        // Wait for the region layer to be present
        cy.getByTestId('ba-Layer--highlight');

        // Add a highlight annotation on the document
        cy.selectText();
        cy.getByTestId('ba-PopupHighlight-button').click();
        cy.getByTestId('ba-Popup-cancel').click();

        // Assert that annotation target is not active
        cy.get('.ba-HighlightTarget').should('not.have.class', 'is-active');

        // Select annotation target
        cy.get('.ba-HighlightTarget-rect')
            .first()
            .click();

        // Assert that annotation target is active
        cy.get('.ba-HighlightTarget').should('have.class', 'is-active');
    });

    it('should leave region mode if zooming in on an image', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE_SANITY'));

        // Wait for annotations to load
        cy.get('.bp-image').should('have.class', 'ba-annotations-loaded');

        // Check that after zooming in, the region annotation button is no longer active
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('have.class', 'bp-is-active');
        cy.getByTestId('bp-ZoomControls-in').click();
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('not.have.class', 'bp-is-active');
    });

    it('should remain in region mode after initial zoom occurs on an image', () => {
        // Show the preview
        cy.showPreview(Cypress.env('FILE_ID_IMAGE_SANITY'));

        // Wait for annotations to load
        cy.get('.bp-image').should('have.class', 'ba-annotations-loaded');

        // Check that after zooming in, the region annotation button is no longer active
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('have.class', 'bp-is-active');
        cy.getByTestId('bp-ZoomControls-in').click();
        cy.getByTestId('bp-AnnotationsControls-regionBtn')
            .should('not.have.class', 'bp-is-active')
            .click()
            .should('have.class', 'bp-is-active');

        cy.getByTestId('bp-ZoomControls-out').click();
        cy.getByTestId('bp-AnnotationsControls-regionBtn').should('have.class', 'bp-is-active');
    });
});
