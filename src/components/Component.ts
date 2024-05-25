// Класс Component
export abstract class Component<T> {
	protected constructor(protected readonly container: HTMLElement) {}

	setDisabled(elem: HTMLElement, state: boolean): void {
		elem.toggleAttribute('disabled', state);
	}

	protected setText(elem: HTMLElement, value: string): void {
		elem.textContent = value;
	}

	toggleClass(elem: HTMLElement, className: string, force?: boolean): void {
		elem.classList.toggle(className, force);
	}

	render(data?: Partial<T>): HTMLElement {
		if (data) {
			Object.assign(this, data);
		}
		return this.container;
	}

	protected setImage(elem: HTMLImageElement, src: string, alt?: string): void {
		elem.src = src;
		if (alt) {
			elem.alt = alt;
		}
	}
}