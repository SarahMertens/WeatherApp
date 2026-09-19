/// <reference types="cypress" />

describe('Weather dashboard', () => {
  it('toont het weer van de standaardstad', () => {
    cy.visitDashboard(); // mockt /favorites en /weather via fixtures

    cy.getByTestId('app-title').should('contain.text', 'Weatherly');

    cy.getByTestId('city-name').should('have.text', 'Ghent');
    cy.getByTestId('city-country').should('have.text', 'Belgium');

    cy.getByTestId('temperature').should('have.text', '19°C');
    cy.getByTestId('condition').should('have.text', 'Partly cloudy');
    cy.getByTestId('feels-like').should('contain.text', '17°C');
  });

  it('toont de highlights van vandaag', () => {
    cy.visitDashboard();

    cy.getByTestId('highlights').should('be.visible');

    cy.getByTestId('highlight-feels-like').should('contain.text', '17°C');
    cy.getByTestId('highlight-humidity').should('contain.text', '72%');
    cy.getByTestId('highlight-wind-speed').should('contain.text', '13.4 km/h');
    cy.getByTestId('highlight-condition').should(
      'contain.text',
      'Partly cloudy',
    );
  });

  it('toont een loader bij een trage response', () => {
    cy.intercept('GET', '**/favorites', { fixture: 'favorites.json' });

    // delay zorgt ervoor dat het antwoord pas na 1 seconde terugkomt,
    // zo kunnen we de loading indicator zien verschijnen en verdwijnen.
    cy.intercept('GET', '**/weather*', {
      fixture: 'weather.json',
      delay: 1000,
    }).as('getWeather');

    cy.visit('/');

    cy.getByTestId('loader').should('be.visible');

    cy.wait('@getWeather');

    cy.getByTestId('loader').should('not.exist');
    cy.getByTestId('current-weather').should('be.visible');
  });

  it('toont een foutboodschap als de back-end faalt', () => {
    cy.intercept('GET', '**/favorites', { fixture: 'favorites.json' });
    cy.intercept('GET', '**/weather*', { statusCode: 500, body: {} }).as(
      'getWeather',
    );

    cy.visit('/');
    cy.wait('@getWeather');

    cy.getByTestId('error').should(
      'contain.text',
      'Unable to load the weather right now.',
    );
    cy.getByTestId('current-weather').should('not.exist');
  });
});
