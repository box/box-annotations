// General commands
Cypress.Commands.add('getByTestId', testId => cy.get(`[data-testid="${testId}"]`));
Cypress.Commands.add('getByTitle', title => cy.get(`[title="${title}"]`));

// Preview-specific commands
Cypress.Commands.add('showPreview', (fileId, { token } = {}) => {
    cy.get('[data-testid="token"]').type(token || Cypress.env('ACCESS_TOKEN'));
    cy.get('[data-testid="token-set"]').click();
    cy.get('[data-testid="fileid"]').type(fileId);
    cy.get('[data-testid="fileid-set"]').click();
});
