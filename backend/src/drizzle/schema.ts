import {
  int,
  mysqlTable,
  varchar,
  double,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

export const favorites = mysqlTable(
  'favorites',
  {
    id: int('id', { unsigned: true })
      .primaryKey()
      .autoincrement(),

    cityName: varchar('city_name', {
      length: 100,
    }).notNull(),

    country: varchar('country', {
      length: 100,
    }).notNull(),

    latitude: double('latitude')
      .notNull(),

    longitude: double('longitude')
      .notNull(),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  },

  (table) => [
    uniqueIndex('idx_favorite_location_unique').on(
      table.latitude,
      table.longitude,
    ),
  ],
);