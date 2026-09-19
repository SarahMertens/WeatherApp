Cypress.Commands.add('getByTestId', (testId, options) => {
  return cy.get(`[data-testid="${testId}"]`, options);
});

Cypress.Commands.add(
  'visitDashboard',
  ({
    weatherFixture = 'weather.json',
    favoritesFixture = 'favorites.json',
  } = {}) => {
    cy.intercept('GET', '**/favorites', { fixture: favoritesFixture }).as(
      'getFavorites',
    );
    cy.intercept('GET', '**/weather*', { fixture: weatherFixture }).as(
      'getWeather',
    );

    cy.visit('/');
    cy.wait(['@getFavorites', '@getWeather']);
  },
);

Cypress.Commands.add(
  'findByTestId',
  { prevSubject: 'element' },
  (subject, testId, options) =>
    cy.wrap(subject).find(`[data-testid="${testId}"]`, options),
);
