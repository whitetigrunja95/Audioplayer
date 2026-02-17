import { el } from "redom";
import type { Track } from "../../model/types";

type Props = {
  track: Track;
  isFavorite: boolean;
  isCurrent: boolean;
  onPlay: (trackId: string) => void;
  onToggleFavorite: (trackId: string, makeFav: boolean) => void | Promise<void>;
};

export class TrackCard {
  public el: HTMLElement;

  private playBtn: HTMLButtonElement;
  private favBtn: HTMLButtonElement;

  constructor(private props: Props) {
    const { track, isFavorite } = props;

    this.playBtn = el(
      "button.track-card__play",
      { type: "button", onclick: () => props.onPlay(track.id) },
      "▶"
    ) as HTMLButtonElement;

    this.favBtn = el(
      "button.track-card__fav",
      {
        type: "button",
        onclick: () => props.onToggleFavorite(track.id, !isFavorite),
        title: isFavorite ? "Убрать из избранного" : "В избранное",
      },
      isFavorite ? "♥" : "♡"
    ) as HTMLButtonElement;

    const title = el("div.track-card__title", track.title);
    const artist = el("div.track-card__artist", track.artist);

    const album = el(
      "div.track-card__album",
      track.album ? track.album : "—"
    );

    const topRow = el("div.track-card__top", title, album);

    const main = el("div.track-card__main", topRow, artist);

    const actions = el("div.track-card__actions", this.playBtn, this.favBtn);

    this.el = el(
      `div.track-card${props.isCurrent ? ".track-card--current" : ""}`,
      main,
      actions
    );

    this.update(props);
  }

  update(next: Props): void {
    this.props = next;
    this.el.classList.toggle("track-card--current", next.isCurrent);
    this.favBtn.textContent = next.isFavorite ? "♥" : "♡";
    this.favBtn.title = next.isFavorite ? "Убрать из избранного" : "В избранное";
    this.playBtn.textContent = next.isCurrent ? "❚❚" : "▶";
  }
}
