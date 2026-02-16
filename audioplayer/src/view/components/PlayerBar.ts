import { el } from "redom";
import type { AppState } from "../../app/store";
import { setState } from "../../app/store";
import { resolveTrackSrc } from "../../model/resolveTrackSrc";
import { store } from "../../app/store";

export class PlayerBar {
  public el: HTMLElement;

  private audio = new Audio();
  private titleEl = el("div.player__title", "Ничего не играет");
  private timeEl = el("div.player__time", "0:00 / 0:00");
  private range = el("input.player__range", { type: "range", min: 0, max: 100, value: 0 }) as HTMLInputElement;

  private playBtn = el("button.player__btn", "▶") as HTMLButtonElement;
  private prevBtn = el("button.player__btn", "⏮") as HTMLButtonElement;
  private nextBtn = el("button.player__btn", "⏭") as HTMLButtonElement;
  private backBtn = el("button.player__btn", "-10") as HTMLButtonElement;
  private forwardBtn = el("button.player__btn", "+10") as HTMLButtonElement;

  private lastTrackId: string | null = null;

  constructor() {
    this.el = el(
      "section.player",
      el("div.player__row",
        this.prevBtn,
        this.backBtn,
        this.playBtn,
        this.forwardBtn,
        this.nextBtn,
        el("div.player__meta", this.titleEl, this.timeEl),
      ),
      this.range
    );

    this.playBtn.onclick = () => this.togglePlay();
    this.prevBtn.onclick = () => this.playPrev();
    this.nextBtn.onclick = () => this.playNext();
    this.backBtn.onclick = () => this.seekBy(-10);
    this.forwardBtn.onclick = () => this.seekBy(10);

    this.range.addEventListener("input", () => {
      if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
      const pct = Number(this.range.value) / 100;
      this.audio.currentTime = pct * this.audio.duration;
    });

    this.audio.addEventListener("timeupdate", () => {
      setState({ currentTime: this.audio.currentTime });
      this.updateTimeUI();
    });

    this.audio.addEventListener("durationchange", () => {
      setState({ duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0 });
      this.updateTimeUI();
    });

    this.audio.addEventListener("play", () => setState({ isPlaying: true }));
    this.audio.addEventListener("pause", () => setState({ isPlaying: false }));

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.seekBy(-10);
      if (e.key === "ArrowRight") this.seekBy(10);
      if (e.key === " ") {
        e.preventDefault();
        this.togglePlay();
      }
    });
  }

  update(state: AppState): void {
    const trackId = state.currentTrackId;

    if (!trackId) {
      this.titleEl.textContent = "Ничего не играет";
      this.playBtn.textContent = "▶";
      this.range.value = "0";
      this.timeEl.textContent = "0:00 / 0:00";
      return;
    }

    if (trackId !== this.lastTrackId) {
      const track = state.tracks.find((t) => t.id === trackId);
      if (track) {
        this.titleEl.textContent = `${track.artist} — ${track.title}`;
        const src = resolveTrackSrc(track);
        if (src) {
          this.audio.src = src;
          this.audio.load();
          void this.audio.play().catch(() => {
          });
        } else {
          this.titleEl.textContent = "Нет ссылки на аудио (проверь API tracks)";
        }
      }
      this.lastTrackId = trackId;
    }

    this.playBtn.textContent = state.isPlaying ? "⏸" : "▶";
    this.updateTimeUI();
  }

  private togglePlay(): void {
    if (!store.currentTrackId) return;

    if (this.audio.paused) void this.audio.play();
    else this.audio.pause();
  }

  private seekBy(deltaSec: number): void {
    if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
    const next = Math.min(this.audio.duration, Math.max(0, this.audio.currentTime + deltaSec));
    this.audio.currentTime = next;
  }

  private playPrev(): void {
    const idx = store.tracks.findIndex((t) => t.id === store.currentTrackId);
    if (idx <= 0) return;
    setState({ currentTrackId: store.tracks[idx - 1].id });
  }

  private playNext(): void {
    const idx = store.tracks.findIndex((t) => t.id === store.currentTrackId);
    if (idx === -1 || idx >= store.tracks.length - 1) return;
    setState({ currentTrackId: store.tracks[idx + 1].id });
  }

  private updateTimeUI(): void {
    const dur = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
    const cur = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;

    this.timeEl.textContent = `${fmt(cur)} / ${fmt(dur)}`;
    if (dur > 0) {
      this.range.value = String(Math.round((cur / dur) * 100));
    } else {
      this.range.value = "0";
    }
  }
}

function fmt(sec: number): string {
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
