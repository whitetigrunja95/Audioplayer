import { el } from "redom";
import type { Track } from "../../model/types";

interface TrackCardProps {
  track: Track;
  isFavorite: boolean;
  isCurrent: boolean;
  onPlay: (trackId: string) => void;
  onToggleFavorite: (trackId: string, makeFav: boolean) => void;
}

export class TrackCard {
  public el: HTMLElement;

  private favBtn: HTMLButtonElement;
  private playBtn: HTMLButtonElement;

  constructor(props: TrackCardProps) {
    const { track } = props;

    this.playBtn = el(
      "button.track-card__play",
      { onclick: () => props.onPlay(track.id) },
      props.isCurrent ? "⏸" : "▶"
    ) as HTMLButtonElement;

    this.favBtn = el(
      "button.track-card__fav",
      { onclick: () => props.onToggleFavorite(track.id, !props.isFavorite) },
      props.isFavorite ? "❤️" : "🤍"
    ) as HTMLButtonElement;

    this.el = el(
      "article.track-card",
      { "data-id": track.id },
      el(
        "div.track-card__main",
        el("div.track-card__title", track.title),
        el("div.track-card__artist", track.artist)
      ),
      el("div.track-card__actions", this.playBtn, this.favBtn)
    );

    this.update(props);
  }

  update(props: TrackCardProps): void {
    this.favBtn.textContent = props.isFavorite ? "❤️" : "🤍";
    this.playBtn.textContent = props.isCurrent ? "⏸" : "▶";

    if (props.isCurrent) this.el.classList.add("track-card--current");
    else this.el.classList.remove("track-card--current");
  }
}
