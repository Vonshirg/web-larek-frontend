import { IEvents } from './base/Events';
import { Form } from './Form';
import {
	IOrder,
	IOrderFormElements
} from '../types/types';

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
	}
}
