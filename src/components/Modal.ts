import { Component } from './Component';
import { IEvents } from './base/Events';
import { ensureElement } from '../utils/utils';
import { IModalData } from '../types/types'; // Подключаем интерфейс

export class Modal extends Component<IModalData> {
	private closeButton: HTMLButtonElement;
	private content: HTMLElement;
	private events: IEvents;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this.events = events;

		this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
		this.content = ensureElement<HTMLElement>('.modal__content', container);

		this.closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('mousedown', this.close.bind(this));
		this.content.addEventListener('mousedown', (event) => event.stopPropagation());
	}

	setContent(value: HTMLElement): void {
		this.content.replaceChildren(value);
	}

	clearContent(): void {
		this.content.innerHTML = ''; // Очистка содержимого
	}

	open(): void {
		this.toggleClass(this.container, 'modal_active', true);
		this.events.emit('modal:open');
	}

	close(): void {
		this.toggleClass(this.container, 'modal_active', false);
		this.clearContent(); // Используем метод для очистки содержимого
		this.events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		this.setContent(data.content);
		this.open();
		return this.container;
	}
}
