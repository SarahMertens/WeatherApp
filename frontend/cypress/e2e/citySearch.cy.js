/// <reference types="cypress" />

describe('City search', () => {
  beforeEach(() => {
    cy.visitDashboard();
  });

  it('does not search for fewer than 2 characters', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('G');

    cy.getByTestId('city-search-results').should('not.exist');
    // Not a single API call may have been made.
    cy.get('@searchCities.all').should('have.length', 0);
  });

  it('shows the search results', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('Ghent');

    // The search is debounced (300 ms); cy.wait makes the test deterministic.
    cy.wait('@searchCities').its('request.url').should('include', 'q=Ghent');

    cy.getByTestId('city-option').should('have.length', 2);
    cy.getByTestId('city-option').first().should('contain.text', 'Belgium');
    cy.getByTestId('city-option')
      .last()
      .should('contain.text', 'United States');
  });

  it('sends one request for a quickly typed word, not one per keystroke', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('Ghent', { delay: 20 });
    cy.wait('@searchCities');

    cy.getByTestId('city-option').should('have.length', 2);
    cy.get('@searchCities.all').should('have.length', 1);
  });

  it('loads the weather of the selected city', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('Ghent');
    cy.wait('@searchCities');

    cy.getByTestId('city-option').last().click();

    cy.getByTestId('city-country').should('have.text', 'United States');
    // After a selection the input is cleared and the list is closed.
    cy.getByTestId('city-search-input').should('have.value', '');
    cy.getByTestId('city-search-results').should('not.exist');
  });

  it('closes the results with the Escape key', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('Ghent');
    cy.wait('@searchCities');
    cy.getByTestId('city-option').should('have.length', 2);

    cy.getByTestId('city-search-input').type('{esc}');

    cy.getByTestId('city-search-results').should('not.exist');
    cy.getByTestId('city-search-input').should('have.value', '');
  });

  it('tells the user when no city matches', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'citiesEmpty.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('xyz');
    cy.wait('@searchCities');

    cy.getByTestId('city-option').should('not.exist');
    cy.getByTestId('city-search-empty').should(
      'contain.text',
      'No cities found.',
    );
  });

  it('shows an error message when the backend fails', () => {
    cy.intercept('GET', '**/cities/search*', {
      statusCode: 500,
      body: {},
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('Ghent');
    cy.wait('@searchCities');

    cy.getByTestId('city-search-error').should(
      'contain.text',
      'Unable to search cities.',
    );
    cy.getByTestId('city-option').should('not.exist');
  });
});
