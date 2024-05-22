import { BaseModel } from './base/Eventss';
import { IAppState, IOrder, IOrderForm, IProduct, FormErrors } from '../types/types';

const emptyOrder: IOrder = {
  items: [],
  payment: '',
  total: null,
  address: '',
  email: '',
  phone: '',
};

export class AppState extends BaseModel<IAppState> {
  products: IProduct[] = [];
  cart: IProduct[] = [];
  currentOrder: IOrder = emptyOrder;
  
 validationErrors: FormErrors = {};

  removeProductFromCart(productId: string): void {
    const newCart = [];
    for (const product of this.cart) {
      if (product.id !== productId) {
        newCart.push(product);
      }
    }
    this.cart = newCart;
  }

  updateOrderItems(): void {
    const itemIds: string[] = [];
    for (const product of this.cart) {
      itemIds.push(product.id);
    }
    this.currentOrder.items = itemIds;
  }

  calculateTotalCartPrice(): number {
    let total = 0;
    for (const product of this.cart) {
      total += product.price || 0;
    }
    return total;
  }

  deselectAllProducts(): void {
    this.products.forEach(product => product.selected = false);
  }
  addProductToCart(product: IProduct): void {
    this.cart.push(product);
  }
  updateOrderField(field: keyof IOrderForm, value: string): void {
    this.currentOrder[field] = value;
    if (this.validateOrderForm()) {
      this.events.emit('order:ready', this.currentOrder);
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
    const phonePattern = /^\+?[1-9]\d{1,14}$/; // Пример паттерна для международного номера телефона

    if (!emailPattern.test(this.currentOrder.email)) {
      errors.email = 'Укажите корректный email';
    }
    if (!phonePattern.test(this.currentOrder.phone)) {
      errors.phone = 'Укажите корректный номер телефона';
    }

    // Сохранение ошибок и отправка событий
    this.validationErrors = errors;
    this.events.emit('orderFormErrors:change', this.validationErrors);
    this.events.emit('contactsFormErrors:change', this.validationErrors);

    // Возвращение результата валидации
    return Object.keys(errors).length === 0;
}

  setProducts(items: IProduct[]): void {
    this.products = [];
    for (const product of items) {
      this.products.push({ ...product, selected: false });
    }
    this.emitChanges('items:changed', { products: this.products });
  }


  resetOrder() {
    this.currentOrder = { ...emptyOrder };
  }
}

export abstract class Component<T> {
  protected constructor(protected readonly container: HTMLElement) { }

  /**
   * Устанавливает состояние "disabled" для элемента.
   * @param elem - HTML элемент.
   * @param state - Если true, элемент будет отключен.
   */
  setDisabled(elem: HTMLElement, state: boolean): void {
    elem.toggleAttribute('disabled', state);
  }

  /**
   * Устанавливает текстовое содержимое элемента.
   * @param elem - HTML элемент.
   * @param value - Текстовое значение.
   */
  protected setText(elem: HTMLElement, value: string): void {
    elem.textContent = value;
  }

  /**
   * Переключает класс на элементе.
   * @param elem - HTML элемент.
   * @param className - Имя класса.
   * @param force - Принудительное добавление/удаление класса.
   */
  toggleClass(elem: HTMLElement, className: string, force?: boolean): void {
    elem.classList.toggle(className, force);
  }

   /**
   * Скрывает элемент.
   * @param elem - HTML элемент.
   */
   protected setHidden(elem: HTMLElement): void {
    elem.style.display = 'none';
  }

   /**
   * Рендерит компонент с новыми данными.
   * @param data - Частичное состояние компонента.
   * @returns - HTML контейнер компонента.
   */
   render(data?: Partial<T>): HTMLElement {
    if (data) {
      Object.assign(this, data);
    }
    return this.container;
  }

  /**
   * Отображает элемент.
   * @param elem - HTML элемент.
   */
  protected setVisible(elem: HTMLElement): void {
    elem.style.display = '';
  }

  /**
   * Устанавливает изображение для элемента <img>.
   * @param elem - HTML элемент <img>.
   * @param src - URL изображения.
   * @param alt - Текст замещающего изображения.
   */
  protected setImage(elem: HTMLImageElement, src: string, alt?: string): void {
    elem.src = src;
    if (alt) {
      elem.alt = alt;
    }
  }
}


