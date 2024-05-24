import { IBasket, IComponentElements } from '../types/types';
import { IEvents } from './base/Events';
import { Component } from './Components';


export class Basket extends Component<IBasket> {
  private elements: IComponentElements;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.elements = {
      listElement: container.querySelector('.basket__list')!,
      priceElement: container.querySelector('.basket__price')!,
      buttonElement: container.querySelector('.basket__button')!,
    };

    if (this.elements.buttonElement) {
      this.elements.buttonElement.addEventListener('click', () =>
        this.events.emit('basket:order')
      );
    }
  }

  set list(items: HTMLElement[]) {
    if (this.elements.listElement) {
      this.elements.listElement.replaceChildren(...items);
      this.elements.buttonElement.disabled = items.length === 0;
    }
  }

  set price(price: number) {
    this.elements.priceElement.textContent = formatPrice(price) + ' синапсов';
  }

  disableButton() {
    this.setDisabled(this.elements.buttonElement, true);
  }

  // Обновление индексов товаров в корзине
  refreshIndices(cards: HTMLElement[]) {
    cards.forEach((item, index) => {
      const indexElement = item.querySelector('.basket__item-index');
      if (indexElement) {
        indexElement.textContent = (index + 1).toString();
      }
    });
  }
}

export function formatPrice(price: number): string {
  const priceStr = price.toString();
  return priceStr.length < 5
    ? priceStr
    : priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

