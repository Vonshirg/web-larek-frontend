import { IEvents } from './base/Events';
import { Component } from './Component';
import { ensureElement } from '../utils/utils';
import {
	FormState
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