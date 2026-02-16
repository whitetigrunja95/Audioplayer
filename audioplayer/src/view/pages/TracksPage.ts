import { el, mount } from "redom";
import { getTracks } from "../../api/tracks";
import { getFavorites, addFavorite, removeFavorite } from "../../api/favorites";
import { store, setState, toggleFavoriteLocal } from "../../app/store";
import type { Track } from "../../model/types";
import { TrackCard } from "../components/TrackCard";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 8;

export class TracksPage {
  public el: HTMLElement;

  private list = el("div.tracks__list");
  private pagination = new Pagination((p) => this.setPage(p));
  private page = 1;

  constructor() {
    this.el = el("section.tracks", el("h1.tracks__title", "Треки"), this.list, this.pagination.el);
    void this.load();
  }

  destroy(): void {
    // пока ничего
  }

  private async load(): Promise<void> {
    try {
      // ✅ если треки уже есть — не делаем повторные запросы
      if (store.tracks.length > 0) {
        // но избранное всё равно можно подтянуть 1 раз, если пусто
        if (store.favorites.size === 0) {
          const fav = await getFavorites();
          setState({ favorites: new Set(fav.map((t: Track) => t.id)) });
        }
        this.render();
        return;
      }

      const tracks = await getTracks();
      setState({ tracks });

      const fav = await getFavorites();
      setState({ favorites: new Set(fav.map((t: Track) => t.id)) });

      this.render();
    } catch (e) {
      this.list.innerHTML = "";
      mount(
        this.list,
        el(
          "div.tracks__error",
          "Не удалось загрузить треки. Проверь, что backend запущен на http://localhost:8000"
        )
      );
    }
  }

  private setPage(page: number): void {
    this.page = page;
    this.render();
  }

  private render(): void {
    this.list.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(store.tracks.length / PAGE_SIZE));
    const page = Math.min(totalPages, Math.max(1, this.page));
    this.page = page;

    this.pagination.update(page, totalPages);

    const start = (page - 1) * PAGE_SIZE;
    const slice = store.tracks.slice(start, start + PAGE_SIZE);

    if (slice.length === 0) {
      mount(this.list, el("div.tracks__empty", "Треков пока нет."));
      return;
    }

    slice.forEach((track: Track) => {
      const card = new TrackCard({
        track,
        isFavorite: store.favorites.has(track.id),
        isCurrent: store.currentTrackId === track.id,
        onPlay: (trackId: string) => {
          setState({ currentTrackId: trackId });
        },
        onToggleFavorite: async (trackId: string, makeFav: boolean) => {
          // оптимистично
          toggleFavoriteLocal(trackId, makeFav);
          try {
            if (makeFav) await addFavorite(trackId);
            else await removeFavorite(trackId);
          } catch {
            // откат
            toggleFavoriteLocal(trackId, !makeFav);
          }
          // перерисуем карточки текущей страницы
          this.render();
        },
      });

      mount(this.list, card.el);
    });
  }
}
