/// <reference types="cypress" />

describe('Weather dashboard', () => {
  it('shows the weather of the default city', () => {
    cy.visitDashboard(); // mocks /favorites and /weather with fixtures

    cy.getByTestId('app-title').should('contain.text', 'Weatherly');

    cy.getByTestId('city-name').should('have.text', 'Ghent');
    cy.getByTestId('city-country').should('have.text', 'Belgium');

    cy.getByTestId('temperature').should('have.text', '19°C');
    cy.getByTestId('condition').should('have.text', 'Partly cloudy');
    cy.getByTestId('feels-like').should('contain.text', '17°C');
  });

  it("shows today's highlights", () => {
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

  it('shows a loader while a slow response is on its way', () => {
    cy.intercept('GET', '**/favorites', { fixture: 'favorites.json' });

    // The delay keeps the response away for a second, which gives us time
    // to see the loading indicator appear and disappear again.
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

  it('shows an error message when the backend fails', () => {
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

  it('keeps the favorites usable when the weather cannot be loaded', () => {
    cy.intercept('GET', '**/favorites', { fixture: 'favorites.json' });
    cy.intercept('GET', '**/weather*', { statusCode: 500, body: {} }).as(
      'getWeather',
    );

    cy.visit('/');
    cy.wait('@getWeather');

    cy.getByTestId('error').should('be.visible');
    cy.getByTestId('favorite').should('have.length', 2);
  });

  it('never shows the weather of the previous city after a failed request', () => {
    cy.visitDashboard();
    cy.getByTestId('temperature').should('have.text', '19°C');

    // From now on the weather endpoint fails.
    cy.intercept('GET', '**/weather*', { statusCode: 500, body: {} }).as(
      'getWeatherFailing',
    );

    cy.getByTestId('favorite').last().findByTestId('favorite-select').click();
    cy.wait('@getWeatherFailing');

    cy.getByTestId('error').should('contain.text', 'Paris');
    cy.getByTestId('current-weather').should('not.exist');
  });
});
