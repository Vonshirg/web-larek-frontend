import { IBasket, IComponentElements } from '../types/types';
import { IEvents } from './base/Events';
import { Component } from './Component';
import { formatPrice } from '../utils/utils';


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
}



