import { Component } from './Components';
import {
	IClickMouseEvent,
} from '../types/types';
import { formatPrice } from './Basket';

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