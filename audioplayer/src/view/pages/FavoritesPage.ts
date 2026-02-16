import { el, mount } from "redom";
import { getFavorites, removeFavorite } from "../../api/favorites";
import { store, setState, toggleFavoriteLocal } from "../../app/store";
import type { Track } from "../../model/types";
import { TrackCard } from "../components/TrackCard";

export class FavoritesPage {
  public el: HTMLElement;

  private list = el("div.fav__list");

  constructor() {
    this.el = el("section.fav", el("h1.fav__title", "Избранное"), this.list);
    void this.load();
  }

  private async load(): Promise<void> {
    const fav = await getFavorites();

    setState({ favorites: new Set(fav.map((t) => t.id)) });

    this.render(fav);
  }

  private render(favTracks: Track[]): void {
    this.list.innerHTML = "";

    if (favTracks.length === 0) {
      mount(this.list, el("div.fav__empty", "Пока пусто. Добавь треки в избранное 🤍"));
      return;
    }

    favTracks.forEach((track: Track) => {
      const card = new TrackCard({
        track,
        isFavorite: true,
        isCurrent: store.currentTrackId === track.id,
        onPlay: (id: string) => setState({ currentTrackId: id }),
        onToggleFavorite: async (trackId: string, makeFav: boolean) => {
          toggleFavoriteLocal(trackId, makeFav);

          try {
            await removeFavorite(trackId);
            await this.load(); 
          } catch {
            toggleFavoriteLocal(trackId, !makeFav); 
          }
        },
      });

      mount(this.list, card.el);
    });
  }
}
