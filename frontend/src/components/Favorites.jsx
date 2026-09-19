import { Heart, MapPin, Trash2 } from 'lucide-react';

export default function Favorites({
  favorites,
  onSelect,
  onDelete,
}) {
  return (
    <aside
      data-testid="favorites"
      className="min-h-full rounded-[27px] border border-white/10 bg-gradient-to-br from-white/[0.095] to-white/[0.035] p-6 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400">
            SAVED PLACES
          </span>

          <h2 className="mt-1 font-['Manrope'] text-[22px] font-bold">
            Favorites
          </h2>
        </div>

        <Heart size={22} className="text-indigo-300" />
      </div>

      {favorites.length === 0 ? (
        <div
          data-testid="favorites-empty"
          className="flex min-h-[250px] flex-col items-center justify-center text-center text-slate-500">
          <Heart size={32} strokeWidth={1.3} />

          <p className="mt-3 mb-1 font-semibold text-slate-300">
            No favorites yet
          </p>

          <span className="text-sm">
            Save a city using the star.
          </span>
        </div>
      ) : (
        <div className="mt-7 flex flex-col gap-2">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              data-testid="favorite"
              className="group flex items-center gap-1 rounded-[14px] bg-white/[0.045] transition hover:bg-white/[0.07]"
            >
              <button
                data-testid="favorite-select"
                onClick={() =>
                  onSelect({
                    name: favorite.cityName,
                    country: favorite.country,
                    latitude: favorite.latitude,
                    longitude: favorite.longitude,
                  })
                }
                className="flex min-w-0 flex-1 items-center gap-3 p-3.5 text-left text-slate-100 transition hover:text-indigo-300"
              >
                <MapPin
                  size={17}
                  className="shrink-0"
                />

                <span className="flex min-w-0 flex-col">
                  <strong className="truncate font-medium">
                    {favorite.cityName}
                  </strong>

                  <small className="mt-0.5 truncate text-slate-500">
                    {favorite.country}
                  </small>
                </span>
              </button>

              <button
                data-testid="favorite-delete"
                onClick={() => onDelete(favorite.id)}
                aria-label={`Remove ${favorite.cityName}`}
                className="mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-slate-500 transition hover:bg-red-400/10 hover:text-red-300"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}