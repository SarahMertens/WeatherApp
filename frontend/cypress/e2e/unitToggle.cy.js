/// <reference types="cypress" />

describe('Unit toggle', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/favorites', { fixture: 'favorites.json' }).as(
      'getFavorites',
    );

    // Twee aparte mocks: één per eenheid. Cypress kiest de route
    // die het best matcht met de query parameters van het request.
    cy.intercept(
      { method: 'GET', url: '**/weather*', query: { unit: 'celsius' } },
      { fixture: 'weather.json' },
    ).as('getWeatherCelsius');

    cy.intercept(
      { method: 'GET', url: '**/weather*', query: { unit: 'fahrenheit' } },
      { fixture: 'Weatherfahrenheit.json' },
    ).as('getWeatherFahrenheit');

    cy.visit('/');
    cy.wait(['@getFavorites', '@getWeatherCelsius']);
  });

  it('toont standaard graden Celsius', () => {
    cy.getByTestId('temperature').should('have.text', '19°C');
    cy.getByTestId('highlight-feels-like').should('contain.text', '17°C');
  });

  it('schakelt over naar Fahrenheit', () => {
    cy.getByTestId('unit-fahrenheit').click();

    cy.wait('@getWeatherFahrenheit')
      .its('request.url')
      .should('include', 'unit=fahrenheit');

    cy.getByTestId('temperature').should('have.text', '66°F');
    cy.getByTestId('condition').should('have.text', 'Clear sky');
    cy.getByTestId('highlight-feels-like').should('contain.text', '63°F');
  });

  it('schakelt terug naar Celsius', () => {
    cy.getByTestId('unit-fahrenheit').click();
    cy.wait('@getWeatherFahrenheit');

    cy.getByTestId('unit-celsius').click();
    cy.wait('@getWeatherCelsius');

    cy.getByTestId('temperature').should('have.text', '19°C');
  });
});
