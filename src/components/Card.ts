import { Component } from './Data';
import {
	CategoryType,
	ICard,
	IClickMouseEvent,
	IPageElements,
	IPage,
} from '../types/types';
import { ensureElement } from '../utils/utils';
import { CDN_URL } from '../utils/constants';
import { IEvents } from './base/Events';
import { formatPrice } from './Basket';

// Интерфейс для элементов карточки
interface ICardElements {
	title: HTMLElement;
	image?: HTMLImageElement | undefined;
	category: HTMLElement;
	price: HTMLElement;
	button: HTMLButtonElement | null; // Может быть null, если кнопка не найдена
	indexElement?: HTMLElement;
}

// Классы для категорий карточек
const categoryClasses: Record<CategoryType, string> = {
	[CategoryType.OTHER]: 'card__category_other',
	[CategoryType.SOFT_SKILL]: 'card__category_soft',
	[CategoryType.ADDITIONAL]: 'card__category_additional',
	[CategoryType.BUTTON]: 'card__category_button',
	[CategoryType.HARD_SKILL]: 'card__category_hard',
};

// Класс для карточки товара
export class Card extends Component<ICard> {
	protected elements: ICardElements;

	constructor(container: HTMLElement, actions?: IClickMouseEvent) {
		super(container);

		// Получение элементов DOM и объединение их в объект
		this.elements = {
			title: ensureElement<HTMLElement>('.card__title', container),
			image: container.querySelector('.card__image'),
			category: container.querySelector('.card__category'),
			price: container.querySelector('.card__price'),
			button: container.querySelector('.card__button'),
			indexElement: container.querySelector('.basket__item-index')!,
		};

		// Добавление обработчика события на кнопку или контейнер
		actions?.onClick &&
			(this.elements.button
				? this.elements.button.addEventListener('click', actions.onClick)
				: container.addEventListener('click', actions.onClick));
	}

	// Установка состояния "selected"
	set selected(value: boolean) {
		if (this.elements.button) {
			this.setDisabled(this.elements.button, value)
		}
	}

	// Установка цены
	set price(value: number | null) {
		this.elements.price.textContent = value
			? formatPrice(value) + ' синапсов'
			: 'Бесценно';
	}

	// Установка и получение ID
	set id(value: string) {
		this.container.dataset.id = value;
	}
	get id(): string {
		return this.container.dataset.id || '';
	}

	// Установка категории
	set category(value: CategoryType) {
		this.elements.category.textContent = value;
		this.elements.category.classList.add(categoryClasses[value]);
	}

	// Установка и получение заголовка
	set title(value: string) {
		this.setText(this.elements.title, value)
	}
	get title(): string {
		return this.elements.title.textContent || '';
	}

	// Установка изображения
	set image(value: string) {
		let src = CDN_URL + value;
		this.setImage(this.elements.image, src)
	}

	set index(value: number) {
		if (this.elements.indexElement) {
			let text = value.toString();
			this.setText(this.elements.indexElement, text)
		}
	}
}

// Класс для предварительного просмотра элемента магазина
export class StoreItemPreview extends Card {
	protected description: HTMLElement; // Изменение имени свойства

	constructor(container: HTMLElement, actions?: IClickMouseEvent) {
		super(container, actions);
		this.description = container.querySelector('.card__text')!;
	}

	// Установка текста описания
	set descriptionText(value: string) {
		this.setText(this.description, value)
	}
}

// Класс для страницы
export class Page extends Component<IPage> {
	protected elements: IPageElements;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Получение элементов DOM и объединение их в объект
		this.elements = {
			counter: ensureElement<HTMLElement>('.header__basket-counter'),
			wrapper: ensureElement<HTMLElement>('.page__wrapper'),
			basket: ensureElement<HTMLElement>('.header__basket'),
			store: ensureElement<HTMLElement>('.gallery'),
		};

		// Добавление обработчика события на корзину
		this.elements.basket.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	// Установка состояния "locked"
	set lock(value: boolean) {
		value
			? this.elements.wrapper.classList.add('page__wrapper_locked')
			: this.elements.wrapper.classList.remove('page__wrapper_locked');
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
