import { Component } from './Component';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/Events';
import { IPageElements, IPage } from '../types/types';

export class Page extends Component<IPage> {
	protected elements: IPageElements;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Получение элементов DOM и объединение их в объект
		this.elements = {
			counter: ensureElement<HTMLElement>('.header__basket-counter', container),
			wrapper: ensureElement<HTMLElement>('.page__wrapper', container),
			basket: ensureElement<HTMLElement>('.header__basket', container),
			store: ensureElement<HTMLElement>('.gallery', container),
		};

		// Добавление обработчика события на корзину
		this.elements.basket.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	// Установка состояния "locked"
	set lock(value: boolean) {
		this.toggleClass(this.elements.wrapper, 'page__wrapper_locked', value);
	}

	// Установка счетчика
	set count(value: number) {
		this.setText(this.elements.counter, String(value));
	}

	// Установка элементов магазина
	set storeItem(items: HTMLElement[]) {
		// Очистка текущих элементов
		this.elements.store.innerHTML = '';

		// Добавление новых элементов
		items.forEach(item => {
			this.elements.store.appendChild(item);
		});
	}
}
