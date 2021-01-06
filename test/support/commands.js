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

function getMouseMoveCommands(targetSelector, { height, width, x, y }) {
    cy.getByTestId(targetSelector)
        .first()
        .trigger('mousedown', {
            buttons: 1,
            clientX: x,
            clientY: y,
        })
        .trigger('mousemove', {
            buttons: 1,
            clientX: x + width,
            clientY: y + height,
        })
        .trigger('mouseup');
}

// Annotations-specific commands
Cypress.Commands.add('drawRegion', ({ height = 100, width = 100, x = 200, y = 200 } = {}) =>
    getMouseMoveCommands('ba-RegionCreator', { width, height, x, y }),
);
Cypress.Commands.add('drawStroke', ({ height = 100, width = 100, x = 400, y = 400 } = {}) =>
    getMouseMoveCommands('ba-DrawingCreator', { width, height, x, y }),
);

Cypress.Commands.add('selectText', ({ page = 1, block = 1 } = {}) => {
    cy.get('.textLayer')
        .eq(Math.max(0, page - 1))
        .children()
        .eq(Math.max(0, block - 1))
        .trigger('mousedown')
        .then($el => {
            const el = $el[0];
            const document = el.ownerDocument;
            const range = document.createRange();
            const selection = document.getSelection();
            range.selectNodeContents(el);
            selection.removeAllRanges();
            selection.addRange(range);
        })
        .trigger('mouseup');
});

Cypress.Commands.add('submitReply', (message = 'Automated test annotations') => {
    // Type a message in the reply form and save the new annotation
    cy.getByTestId('ba-ReplyField-editor').type(message);
    cy.getByTestId('ba-Popup-submit').click();
});
