import { IEvents } from './base/Events';
import { Component } from './Data';
import { ensureElement } from '../utils/utils';
import {
	FormState,
	IOrder,
	IOrderFormElements,
	IClickMouseEvent,
} from '../types/types';

function formatPrice(price: number): string {
	const priceStr = price.toString();
	return priceStr.length < 5
		? priceStr
		: priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export class Form<T> extends Component<FormState> {
	private submitButton: HTMLButtonElement;
	private errorDisplay: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		// Инициализация кнопки отправки и элемента для отображения ошибок
		this.submitButton = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this.errorDisplay = ensureElement<HTMLElement>(
			'.form__errors',
			this.container
		);

		// Добавление обработчиков событий ввода и отправки формы
		this.container.addEventListener('input', this.handleInputChange);
		this.container.addEventListener('submit', this.handleFormSubmit);
	}

	set valid(isValid: boolean) {
		this.submitButton.disabled = !isValid;
	}

	set errors(errorMessages: string) {
		this.setText(this.errorDisplay, errorMessages);
	}

	private handleInputChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const field = target.name as keyof T;
		const value = target.value;
		this.onInputChange(field, value);
	};

	private handleFormSubmit = (event: Event) => {
		event.preventDefault();
		this.events.emit(`${this.container.name}:submit`);
	};

	render(state: Partial<T> & FormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		// Обход каждого ключа-значения в inputs
		Object.entries(inputs).forEach(([key, value]) => {
			const typedKey = key as keyof T;
			(this as any)[typedKey] = value;
		});
		return this.container;
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit('orderInput:change', { field, value });
	}
}

export class Order extends Form<IOrder> {
	protected elements: IOrderFormElements;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		// Получение и объединение элементов формы в объект
		this.elements = {
			card: container.elements.namedItem('card') as HTMLButtonElement,
			cash: container.elements.namedItem('cash') as HTMLButtonElement,
		};

		// Добавление обработчиков событий
		if (this.elements.cash) {
			this.elements.cash.addEventListener('click', () => {
				this.elements.card.classList.remove('button_alt-active');
				this.onInputChange('payment', 'cash');
				this.elements.cash.classList.add('button_alt-active');
			});
		}
		if (this.elements.card) {
			this.elements.card.addEventListener('click', () => {
				this.elements.card.classList.add('button_alt-active');
				this.elements.cash.classList.remove('button_alt-active');
				this.onInputChange('payment', 'card');
			});
		}
	}

	// Метод для отключения активности кнопок
	disableButtons() {
		this.elements.cash.classList.remove('button_alt-active');
		this.elements.card.classList.remove('button_alt-active');
	}
}

export class Contacts extends Form<IOrder> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}
}

export class Success extends Component<{ description: number }> {
	protected closeButton: HTMLButtonElement; // Переименована переменная
	protected descriptionElement: HTMLElement; // Переименована переменная

	constructor(container: HTMLElement, actions?: IClickMouseEvent) {
		super(container);

		this.closeButton = container.querySelector('.order-success__close')!;
		this.descriptionElement = container.querySelector(
			'.order-success__description'
		)!;

		if (actions?.onClick && this.closeButton) {
			this.closeButton.addEventListener('click', actions.onClick);
		}
	}
	set description(value: number) {
		this.descriptionElement.textContent = `Списано ${formatPrice(
			value
		)} синапсов`;
	}
}
