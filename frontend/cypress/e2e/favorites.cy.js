/// <reference types="cypress" />

describe('Favorites', () => {
  it('toont de opgeslagen steden', () => {
    cy.visitDashboard();

    cy.getByTestId('favorite').should('have.length', 2);
    cy.getByTestId('favorite').first().should('contain.text', 'Ghent');
    cy.getByTestId('favorite').last().should('contain.text', 'Paris');
    cy.getByTestId('favorites-empty').should('not.exist');
  });

  it('toont een lege staat als er geen favorieten zijn', () => {
    cy.visitDashboard({ favoritesFixture: 'favoritesEmpty.json' });

    cy.getByTestId('favorite').should('not.exist');
    cy.getByTestId('favorites-empty').should(
      'contain.text',
      'No favorites yet',
    );
  });

  it('voegt de huidige stad toe aan de favorieten', () => {
    // Stateful mock: de GET geeft telkens de actuele (nagebootste) lijst terug,
    // de POST vult die lijst aan. Zo blijft de test reproduceerbaar.
    let favorites = [];

    cy.intercept('GET', '**/favorites', (req) =>
      req.reply({ statusCode: 200, body: { items: favorites } }),
    ).as('getFavorites');

    cy.intercept('POST', '**/favorites', (req) => {
      expect(req.body).to.deep.include({
        cityName: 'Ghent',
        country: 'Belgium',
      });

      favorites = [
        {
          id: 1,
          cityName: 'Ghent',
          country: 'Belgium',
          latitude: 51.05,
          longitude: 3.71667,
        },
      ];

      req.reply({ statusCode: 201, body: favorites[0] });
    }).as('addFavorite');

    cy.intercept('GET', '**/weather*', { fixture: 'weather.json' }).as(
      'getWeather',
    );

    cy.visit('/');
    cy.wait(['@getFavorites', '@getWeather']);

    cy.getByTestId('favorite').should('not.exist');

    cy.getByTestId('favorite-button')
      .should('have.attr', 'aria-label', 'Add to favorites')
      .click();

    cy.wait('@addFavorite');

    cy.getByTestId('favorite').should('have.length', 1);
    cy.getByTestId('favorite').first().should('contain.text', 'Ghent');
    cy.getByTestId('favorite-button').should(
      'have.attr',
      'aria-label',
      'Remove from favorites',
    );
  });

  it('verwijdert de huidige stad via de ster', () => {
    let favorites = [
      {
        id: 1,
        cityName: 'Ghent',
        country: 'Belgium',
        latitude: 51.05,
        longitude: 3.71667,
      },
    ];

    cy.intercept('GET', '**/favorites', (req) =>
      req.reply({ statusCode: 200, body: { items: favorites } }),
    ).as('getFavorites');

    cy.intercept('DELETE', '**/favorites/1', (req) => {
      favorites = [];
      req.reply({ statusCode: 204, body: '' });
    }).as('deleteFavorite');

    cy.intercept('GET', '**/weather*', { fixture: 'weather.json' }).as(
      'getWeather',
    );

    cy.visit('/');
    cy.wait(['@getFavorites', '@getWeather']);

    cy.getByTestId('favorite-button')
      .should('have.attr', 'aria-label', 'Remove from favorites')
      .click();

    cy.wait('@deleteFavorite');

    cy.getByTestId('favorite').should('not.exist');
    cy.getByTestId('favorites-empty').should('be.visible');
  });

  it('verwijdert een favoriet via de prullenbakknop', () => {
    let favorites = [
      {
        id: 2,
        cityName: 'Paris',
        country: 'France',
        latitude: 48.85341,
        longitude: 2.3488,
      },
    ];

    cy.intercept('GET', '**/favorites', (req) =>
      req.reply({ statusCode: 200, body: { items: favorites } }),
    ).as('getFavorites');

    cy.intercept('DELETE', '**/favorites/2', (req) => {
      favorites = [];
      req.reply({ statusCode: 204, body: '' });
    }).as('deleteFavorite');

    cy.intercept('GET', '**/weather*', { fixture: 'weather.json' }).as(
      'getWeather',
    );

    cy.visit('/');
    cy.wait(['@getFavorites', '@getWeather']);

    cy.getByTestId('favorite')
      .first()
      .findByTestId('favorite-delete')
      .click();

    cy.wait('@deleteFavorite');

    cy.getByTestId('favorite').should('not.exist');
  });

  it('laadt het weer van een favoriet bij het aanklikken', () => {
    cy.visitDashboard();

    cy.getByTestId('favorite').last().findByTestId('favorite-select').click();

    cy.getByTestId('city-name').should('have.text', 'Paris');
    cy.getByTestId('city-country').should('have.text', 'France');
  });
});
