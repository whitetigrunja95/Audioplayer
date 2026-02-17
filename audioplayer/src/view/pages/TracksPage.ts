import { el, mount } from "redom";
import { getTracks } from "../../api/tracks";
import { getFavorites, addFavorite, removeFavorite } from "../../api/favorites";
import { store, setState, toggleFavoriteLocal } from "../../app/store";
import type { Track } from "../../model/types";
import { TrackCard } from "../components/TrackCard";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 8;

type SortKey = "title" | "album";
type SortDir = "asc" | "desc";

export class TracksPage {
  public el: HTMLElement;

  private list = el("div.tracks__list");
  private pagination = new Pagination((p) => this.setPage(p));

  private page = 1;

  private query = "";

  private sortKey: SortKey = "title";
  private sortDir: SortDir = "asc";

  private searchInput = el("input.tracks__search", {
    placeholder: "Поиск по названию, альбому, артисту…",
    oninput: (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      this.query = value.trim().toLowerCase();
      this.page = 1;
      this.render();
    },
  }) as HTMLInputElement;

  private headerRow = el(
    "div.tracks__header",
    el(
      "button.tracks__sort",
      { onclick: () => this.toggleSort("title") },
      "Название"
    ),
    el(
      "button.tracks__sort",
      { onclick: () => this.toggleSort("album") },
      "Альбом"
    ),
    el("div.tracks__sort-hint", this.getSortHint())
  );

  constructor() {
    this.el = el(
      "section.tracks",
      el("h1.tracks__title", "Треки"),
      this.searchInput,
      this.headerRow,
      this.list,
      this.pagination.el
    );

    void this.load();
  }

  destroy(): void {
  }

  private getSortHint(): string {
    const keyLabel = this.sortKey === "title" ? "Название" : "Альбом";
    const dirLabel = this.sortDir === "asc" ? "↑" : "↓";
    return `Сортировка: ${keyLabel} ${dirLabel}`;
  }

  private updateSortHint(): void {
    const hint = this.headerRow.querySelector(".tracks__sort-hint");
    if (hint) hint.textContent = this.getSortHint();
  }

  private toggleSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
    } else {
      this.sortKey = key;
      this.sortDir = "asc";
    }
    this.updateSortHint();
    this.page = 1;
    this.render();
  }

  private async load(): Promise<void> {
    try {
      if (store.tracks.length === 0) {
        const tracks = await getTracks();
        setState({ tracks });
      }

      if (store.favorites.size === 0) {
        const fav = await getFavorites();
        setState({ favorites: new Set(fav.map((t: Track) => t.id)) });
      }

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

  private getProcessedTracks(): Track[] {
    const q = this.query;

    const filtered = q
      ? store.tracks.filter((t) => {
          const hay = `${t.title} ${t.album ?? ""} ${t.artist}`.toLowerCase();
          return hay.includes(q);
        })
      : store.tracks;

    const sorted = [...filtered].sort((a, b) => {
      const av =
        (this.sortKey === "title" ? a.title : a.album ?? "").toLowerCase();
      const bv =
        (this.sortKey === "title" ? b.title : b.album ?? "").toLowerCase();

      const cmp = av.localeCompare(bv, "ru");
      return this.sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }

  private render(): void {
    this.list.innerHTML = "";

    const processed = this.getProcessedTracks();

    const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    const page = Math.min(totalPages, Math.max(1, this.page));
    this.page = page;

    this.pagination.update(page, totalPages);

    const start = (page - 1) * PAGE_SIZE;
    const slice = processed.slice(start, start + PAGE_SIZE);

    if (slice.length === 0) {
      mount(
        this.list,
        el(
          "div.tracks__empty",
          this.query ? "Ничего не найдено по вашему запросу." : "Треков пока нет."
        )
      );
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
          toggleFavoriteLocal(trackId, makeFav);
          try {
            if (makeFav) await addFavorite(trackId);
            else await removeFavorite(trackId);
          } catch {
            toggleFavoriteLocal(trackId, !makeFav);
          }
          this.render();
        },
      });

      mount(this.list, card.el);
    });
  }
}
