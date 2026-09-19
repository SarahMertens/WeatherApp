# WeatherApp

Full-stack weather application developed for the DEV@WORK FullStack
Intern test.

The application allows users to search for a city, view the current
weather, switch between Celsius and Fahrenheit, and manage favorite
cities. Weather data is retrieved from the Open-Meteo API. Favorite
cities are stored in MySQL.

## Features

-   Search for cities
-   Display current weather for the selected city
-   Temperature in Celsius or Fahrenheit
-   Feels-like temperature
-   Humidity
-   Wind speed
-   Weather condition and corresponding icon
-   Add and remove favorite cities
-   Prevent duplicate favorites based on latitude + longitude
-   Responsive dashboard
-   REST API with Swagger documentation
-   End-to-end backend tests

# Backend

## Technologies

-   NestJS
-   TypeScript
-   Drizzle ORM
-   MySQL 8
-   Docker / Docker Compose
-   Swagger
-   Jest
-   Supertest
-   Testcontainers

## Requirements

-   Node.js
-   pnpm
-   Docker Desktop

## Installation

``` bash
cd backend
pnpm install
```

## Environment variables

Create `backend/.env`:

``` env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=mysql://devusr:devpwd@localhost:3307/weather
```

## Database

Start MySQL:

``` bash
docker compose up -d
```

Run migrations:

``` bash
pnpm db:migrate
```

## Start the backend

``` bash
pnpm start:dev
```

Backend:

``` text
http://localhost:3000/api
```

Health check:

``` text
http://localhost:3000/api/health
```

Swagger:

``` text
http://localhost:3000/docs
```

## API endpoints

### City search

``` http
GET /api/cities/search?q=Ghent
```

### Current weather

``` http
GET /api/weather?latitude=51.0543&longitude=3.7174&unit=celsius
```

Supported units:

``` text
celsius
fahrenheit
```

### Favorites

``` http
GET /api/favorites
GET /api/favorites/:id
POST /api/favorites
DELETE /api/favorites/:id
```

Example POST body:

``` json
{
  "cityName": "Ghent",
  "country": "Belgium",
  "latitude": 51.0543,
  "longitude": 3.7174
}
```

## Favorite uniqueness

Favorite cities are unique based on the combination of:

``` text
latitude + longitude
```

The same location cannot be added twice. No separate city ID is required
for this uniqueness check.

## Backend tests

The e2e tests use Jest, Supertest and MySQL Testcontainers.

The tests use isolated temporary databases and do not use the normal
development database.

Run all e2e tests:

``` bash
pnpm test:e2e
```

Other commands:

``` bash
pnpm test
pnpm test:cov
pnpm lint
pnpm build
```

# Frontend

## Technologies

-   React
-   Vite
-   JavaScript
-   Tailwind CSS
-   Axios
-   Lucide React

## Installation

``` bash
cd frontend
pnpm install
```

## Environment variables

Create `frontend/.env`:

``` env
VITE_API_URL=http://localhost:3000/api
```

## Start the frontend

``` bash
pnpm dev
```

Frontend:

``` text
http://localhost:5173
```

# Running the complete application

Start MySQL:

``` bash
cd backend
docker compose up -d
```

Start the backend:

``` bash
cd backend
pnpm start:dev
```

Start the frontend in a second terminal:

``` bash
cd frontend
pnpm dev
```

Open:

``` text
http://localhost:5173
```

# External API

The application uses Open-Meteo for city geocoding and current weather
data.

The backend communicates with Open-Meteo. The frontend communicates with
the application's own backend API.

Weather data is not stored in MySQL. It is retrieved from Open-Meteo
when weather information is requested.

MySQL is used for favorite cities.

# Architecture

``` text
React / Vite frontend
        |
        | REST / HTTP
        v
NestJS backend
        |
        +------------------+
        |                  |
        v                  v
MySQL database       Open-Meteo API
        |
        v
Favorite cities
```

# Assignment

This application was developed for the DEV@WORK FullStack Intern test.

The assignment requires an application that displays current weather,
allows a user to select a city, supports a Fahrenheit option, and allows
favorite cities to be managed. It also requires a frontend and backend
while leaving the technology choice open.

This implementation uses React/Vite for the frontend and
NestJS/TypeScript for the backend, with MySQL for persistent favorite
cities.
