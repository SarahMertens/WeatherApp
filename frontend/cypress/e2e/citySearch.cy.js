/// <reference types="cypress" />

describe('City search', () => {
  beforeEach(() => {
    cy.visitDashboard();
  });

  it('zoekt niet bij minder dan 2 tekens', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'Cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('G');

    cy.getByTestId('city-search-results').should('not.exist');
    // Er mag geen enkele API call vertrokken zijn
    cy.get('@searchCities.all').should('have.length', 0);
  });

  it('toont de zoekresultaten', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'Cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('Ghent');

    // De zoekopdracht is gedebounced (300 ms), cy.wait geeft ons zekerheid
    cy.wait('@searchCities')
      .its('request.url')
      .should('include', 'q=Ghent');

    cy.getByTestId('city-option').should('have.length', 2);
    cy.getByTestId('city-option').first().should('contain.text', 'Belgium');
    cy.getByTestId('city-option').last().should('contain.text', 'United States');
  });

  it('laadt het weer van de geselecteerde stad', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'Cities.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('Ghent');
    cy.wait('@searchCities');

    cy.getByTestId('city-option').last().click();

    cy.getByTestId('city-country').should('have.text', 'United States');
    // Na een selectie wordt het zoekveld leeggemaakt en de lijst gesloten
    cy.getByTestId('city-search-input').should('have.value', '');
    cy.getByTestId('city-search-results').should('not.exist');
  });

  it('toont geen resultaten voor een onbestaande stad', () => {
    cy.intercept('GET', '**/cities/search*', {
      fixture: 'citiesEmpty.json',
    }).as('searchCities');

    cy.getByTestId('city-search-input').type('xyz');
    cy.wait('@searchCities');

    cy.getByTestId('city-option').should('not.exist');
    cy.getByTestId('city-search-results').should('not.exist');
  });

  it('toont een foutboodschap bij een fout in de back-end', () => {
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
