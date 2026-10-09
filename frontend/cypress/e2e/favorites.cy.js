/// <reference types="cypress" />

describe('Favorites', () => {
  it('shows the saved cities', () => {
    cy.visitDashboard();

    cy.getByTestId('favorite').should('have.length', 2);
    cy.getByTestId('favorite').first().should('contain.text', 'Ghent');
    cy.getByTestId('favorite').last().should('contain.text', 'Paris');
    cy.getByTestId('favorites-empty').should('not.exist');
  });

  it('shows an empty state when there are no favorites', () => {
    cy.visitDashboard({ favoritesFixture: 'favoritesEmpty.json' });

    cy.getByTestId('favorite').should('not.exist');
    cy.getByTestId('favorites-empty').should(
      'contain.text',
      'No favorites yet',
    );
  });

  it('adds the current city to the favorites', () => {
    // Stateful mock: the GET always returns the current (simulated) list and
    // the POST adds to it. That keeps the test reproducible.
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

  it('removes the current city with the star', () => {
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

  it('removes a favorite with the bin button', () => {
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

  it('loads the weather of a favorite when it is clicked', () => {
    cy.visitDashboard();

    cy.getByTestId('favorite').last().findByTestId('favorite-select').click();

    cy.getByTestId('city-name').should('have.text', 'Paris');
    cy.getByTestId('city-country').should('have.text', 'France');
  });

  it('shows an error message when a favorite cannot be saved', () => {
    cy.visitDashboard({ favoritesFixture: 'favoritesEmpty.json' });

    cy.intercept('POST', '**/favorites', { statusCode: 500, body: {} }).as(
      'addFavorite',
    );

    cy.getByTestId('favorite-button').click();
    cy.wait('@addFavorite');

    cy.getByTestId('favorites-error').should(
      'contain.text',
      'Unable to update favorites.',
    );
    // The weather stays on screen: only the favorites action failed.
    cy.getByTestId('current-weather').should('be.visible');
  });

  it('shows an error message when the favorites cannot be loaded', () => {
    cy.intercept('GET', '**/favorites', { statusCode: 500, body: {} }).as(
      'getFavorites',
    );
    cy.intercept('GET', '**/weather*', { fixture: 'weather.json' }).as(
      'getWeather',
    );

    cy.visit('/');
    cy.wait(['@getFavorites', '@getWeather']);

    cy.getByTestId('favorites-error').should(
      'contain.text',
      'Unable to load your favorites.',
    );
    cy.getByTestId('current-weather').should('be.visible');
  });
});
