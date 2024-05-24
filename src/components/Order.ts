import { IEvents } from './base/Events';
import { Component } from './Components';
import { ensureElement } from '../utils/utils';
import {
	FormState,
	IOrder,
	IOrderFormElements,
} from '../types/types';

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
		this.setDisabled(this.submitButton, !isValid);
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
				this.toggleClass(this.elements.card, 'button_alt-active', false);
				this.onInputChange('payment', 'cash');
				this.toggleClass(this.elements.cash, 'button_alt-active', true);
			});
		}
		if (this.elements.card) {
			this.elements.card.addEventListener('click', () => {
				this.toggleClass(this.elements.card, 'button_alt-active', true);
				this.toggleClass(this.elements.cash, 'button_alt-active', false);
				this.onInputChange('payment', 'card');
			});
		}
	}

	// Метод для отключения активности кнопок
	disableButtons() {
		this.toggleClass(this.elements.cash, 'button_alt-active', false);
		this.toggleClass(this.elements.card, 'button_alt-active', false);
		console.log(this.elements.cash)
	}
}
