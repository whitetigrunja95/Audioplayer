import { el } from "redom";
import type { Track } from "../../model/types";

type TrackCardProps = {
  track: Track;
  isFavorite: boolean;
  isCurrent: boolean;
  onPlay: (trackId: string) => void;
  onToggleFavorite: (trackId: string, makeFav: boolean) => void;
};

export class TrackCard {
  public el: HTMLElement;

  constructor(props: TrackCardProps) {
    const { track, isFavorite, isCurrent, onPlay, onToggleFavorite } = props;

    this.el = el(
      "article.track-card",
      { className: `track-card${isCurrent ? " track-card--current" : ""}` },

      el(
        "button.track-card__play",
        { type: "button", onclick: () => onPlay(track.id) },
        isCurrent ? "⏸" : "▶"
      ),

      el(
        "div.track-card__cols",
        el("div.track-card__col track-card__col--title", track.title),
        el("div.track-card__col track-card__col--album", track.album ?? "—")
      ),

      el(
        "button.track-card__fav",
        {
          type: "button",
          onclick: () => onToggleFavorite(track.id, !isFavorite),
          "aria-label": isFavorite ? "Убрать из избранного" : "Добавить в избранное",
          title: isFavorite ? "Убрать из избранного" : "Добавить в избранное",
        },
        isFavorite ? "♥" : "♡"
      )
    );
  }
}
