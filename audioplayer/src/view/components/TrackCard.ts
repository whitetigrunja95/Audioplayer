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
      el(
        "button.track-card__main",
        {
          type: "button",
          onclick: () => onPlay(track.id),
        },
        el("div.track-card__title", track.title),
        el(
          "div.track-card__meta",
          `${track.artist}${track.album ? " • " + track.album : ""}`
        ),
        isCurrent ? el("div.track-card__badge", "Сейчас играет") : ""
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
