/// <reference types="cypress" />

describe('Unit toggle', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/favorites', { fixture: 'favorites.json' }).as(
      'getFavorites',
    );

    // Two separate mocks, one per unit. Cypress picks the route that
    // matches the query parameters of the request.
    cy.intercept(
      { method: 'GET', url: '**/weather*', query: { unit: 'celsius' } },
      { fixture: 'weather.json' },
    ).as('getWeatherCelsius');

    cy.intercept(
      { method: 'GET', url: '**/weather*', query: { unit: 'fahrenheit' } },
      { fixture: 'weatherfahrenheit.json' },
    ).as('getWeatherFahrenheit');

    cy.visit('/');
    cy.wait(['@getFavorites', '@getWeatherCelsius']);
  });

  it('shows degrees Celsius by default', () => {
    cy.getByTestId('unit-celsius').should('have.attr', 'aria-pressed', 'true');
    cy.getByTestId('unit-fahrenheit').should(
      'have.attr',
      'aria-pressed',
      'false',
    );
    cy.getByTestId('temperature').should('have.text', '19°C');
    cy.getByTestId('highlight-feels-like').should('contain.text', '17°C');
  });

  it('switches to Fahrenheit', () => {
    cy.getByTestId('unit-fahrenheit').click();

    cy.wait('@getWeatherFahrenheit')
      .its('request.url')
      .should('include', 'unit=fahrenheit');

    cy.getByTestId('temperature').should('have.text', '66°F');
    cy.getByTestId('condition').should('have.text', 'Clear sky');
    cy.getByTestId('highlight-feels-like').should('contain.text', '63°F');
  });

  it('switches back to Celsius', () => {
    cy.getByTestId('unit-fahrenheit').click();
    cy.wait('@getWeatherFahrenheit');

    cy.getByTestId('unit-celsius').click();
    cy.wait('@getWeatherCelsius');

    cy.getByTestId('temperature').should('have.text', '19°C');
  });
});
