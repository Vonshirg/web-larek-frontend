import {
	IBasket,
	IClickMouseEvent,
	IComponentElements,
	IProductBasket,
} from '../types/types';
import { IEvents } from './base/Eventss';
import { Component } from './Data';



// Класс для корзины
export class Basket extends Component<IBasket> {
	private elements: IComponentElements;
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Инициализация элементов DOM
		this.elements = {
			listElement: container.querySelector('.basket__list')!,
			priceElement: container.querySelector('.basket__price')!,
			buttonElement: container.querySelector('.basket__button')!,
		};

		// Добавление обработчика события на кнопку
		if (this.elements.buttonElement) {
			this.elements.buttonElement.addEventListener('click', () =>
				this.events.emit('basket:order')
			);
		}
	}

	// Установка списка элементов
	set list(items: HTMLElement[]) {
		if (this.elements.listElement) {
			this.elements.listElement.replaceChildren(...items);
			this.elements.buttonElement.disabled = items.length === 0;
		}
	}

	// Установка цены
	set price(price: number) {
		this.elements.priceElement.textContent = formatPrice(price) + ' синапсов';
	}

	// Отключение кнопки
	disableButton() {
		this.elements.buttonElement.disabled = true;
	}

	// Обновление индексов элементов списка
	refreshIndices() {
		if (this.elements.listElement) {
			Array.from(this.elements.listElement.children).forEach((item, index) => {
				const indexElement = item.querySelector('.basket__item-index');
				if (indexElement) {
					indexElement.textContent = (index + 1).toString();
				}
			});
		}
	}
}
function formatPrice(price: number): string {
	const priceStr = price.toString();
	return priceStr.length < 5
			? priceStr
			: priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Класс для элемента корзины
export class CartItem extends Component<IProductBasket> {
	private elements: IComponentElements;

	constructor(container: HTMLElement, actions?: IClickMouseEvent) {
		super(container);

		// Инициализация элементов DOM
		this.elements = {
			indexElement: container.querySelector('.basket__item-index')!,
			titleElement: container.querySelector('.card__title')!,
			priceElement: container.querySelector('.card__price')!,
			buttonElement: container.querySelector('.card__button')!,
		};

		// Добавление обработчика события на кнопку
		if (this.elements.buttonElement) {
			this.elements.buttonElement.addEventListener('click', (evt) => {
				this.container.remove();
				actions?.onClick(evt);
			});
		}
	}
// Установка индекса
	set index(value: number) {
		if (this.elements.indexElement) {
			this.elements.indexElement.textContent = value.toString();
		}
	}

	// Установка цены
	set price(value: number) {
		this.elements.priceElement.textContent = formatPrice(value) + ' синапсов';
	}

		// Установка заголовка
		set title(value: string) {
			if (this.elements.titleElement) {
				this.elements.titleElement.textContent = value;
			}
		}
	
}
