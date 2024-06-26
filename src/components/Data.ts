import { BaseModel } from './base/Events';
import {
	IAppState,
	IOrder,
	IOrderForm,
	IProduct,
	FormErrors,
} from '../types/types';

const emptyOrder: IOrder = {
	payment: '',
	address: '',
	email: '',
	phone: '',
};

export class AppState extends BaseModel<IAppState> {
	products: IProduct[] = [];
	cart: IProduct[] = [];
	currentOrder: Omit<IOrder, 'items' | 'total'> = emptyOrder;
	validationErrors: FormErrors = {};

	removeProductFromCart(productId: string): void {
		this.cart = this.cart.filter((product) => product.id !== productId);
	}

	calculateTotalCartPrice(): number {
		return this.cart.reduce(
			(total, product) => total + (product.price || 0),
			0
		);
	}

	addProductToCart(product: IProduct): void {
		this.cart.push(product);
	}

	updateOrderField(field: keyof IOrderForm, value: string): void {
		this.currentOrder[field] = value;
		if (this.validateOrderForm()) {
			this.events.emit('order:ready', this.prepareOrderForServer());
		}
	}

	clearCart(): void {
		this.cart = [];
	}

	getCartItemCount(): number {
		return this.cart.length;
	}

	validateOrderForm(): boolean {
		const errors: FormErrors = {};

		// Проверка адреса и способа оплаты через паттерны
		const addressPattern = /^.{1,}$/; // Пример простого паттерна, требующего непустую строку
		const paymentPattern = /^(cash|card)$/; // Пример паттерна, принимающего только "cash" или "card"

		if (!addressPattern.test(this.currentOrder.address)) {
			errors.address = 'Укажите корректный адрес';
		}
		if (!paymentPattern.test(this.currentOrder.payment)) {
			errors.payment = 'Укажите корректный способ оплаты';
		}

		// Проверка email и телефона через паттерны
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Простой паттерн для валидации email
		/* обновленный паттерн для номера телефона - поддерживает форматы 
 		+7 (999) 999-99-99, 8 (999) 999-99-99, 9999999999, +1 (999) 999-9999999-999-9999*/   
		const phonePattern = /^\+?\d{0,3}\s?\(?\d{0,3}\)?\s?\d{0,3}-?\d{0,2}-?\d{0,2}$/; 
		

		if (!emailPattern.test(this.currentOrder.email)) {
			errors.email = 'Укажите корректный email';
		}
		if (!phonePattern.test(this.currentOrder.phone)) {
			errors.phone = 'Укажите номер телефона в международном формате например (+7 (999) 999-99-99) или введите только цифры';
		}

		// Сохранение ошибок и отправка событий
		this.validationErrors = errors;
		this.events.emit('orderFormErrors:change', this.validationErrors);
		this.events.emit('contactsFormErrors:change', this.validationErrors);

		// Возвращение результата валидации
		return Object.keys(errors).length === 0;
	}

	setProducts(items: IProduct[]): void {
		this.products = items.map((product) => ({ ...product, selected: false }));
		this.emitChanges('items:changed', { products: this.products });
	}

	prepareOrderForServer(): IOrder {
		return {
			...this.currentOrder,
			total: this.calculateTotalCartPrice(),
			items: this.cart.map((product) => product.id),
		};
	}

	resetOrder(): void {
		this.currentOrder = { ...emptyOrder };
	}
}


