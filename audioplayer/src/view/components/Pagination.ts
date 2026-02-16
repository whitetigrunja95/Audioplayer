import { el } from "redom";

export class Pagination {
  public el: HTMLElement;

  private onPageChange: (page: number) => void;
  private current = 1;
  private total = 1;

  constructor(onPageChange: (page: number) => void) {
    this.onPageChange = onPageChange;

    this.el = el("div.pagination",
      el("button.pagination__btn", { onclick: () => this.go(this.current - 1) }, "‹"),
      el("div.pagination__info", ""),
      el("button.pagination__btn", { onclick: () => this.go(this.current + 1) }, "›"),
    );

    this.update(1, 1);
  }

  update(current: number, total: number): void {
    this.current = current;
    this.total = Math.max(1, total);

    const info = this.el.querySelector(".pagination__info");
    if (info) info.textContent = `${this.current} / ${this.total}`;

    const [prevBtn, , nextBtn] = Array.from(this.el.children) as HTMLButtonElement[];
    prevBtn.disabled = this.current <= 1;
    nextBtn.disabled = this.current >= this.total;
  }

  private go(page: number): void {
    const next = Math.min(this.total, Math.max(1, page));
    if (next === this.current) return;
    this.onPageChange(next);
  }
}
