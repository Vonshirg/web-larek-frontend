import { Component } from './Data';
import { CategoryType, ICard, IClickMouseEvent, IPageElements, IPage } from '../types/types';
import { ensureElement} from '../utils/utils';
import { CDN_URL } from '../utils/constants';
import { IEvents } from './base/Events';



// Интерфейс для элементов карточки
interface ICardElements {
  title: HTMLElement;
  image: HTMLImageElement;
  category: HTMLElement;
  price: HTMLElement;
  button: HTMLButtonElement | null; // Может быть null, если кнопка не найдена
}

// Классы для категорий карточек
const categoryClasses: Record<CategoryType, string> = {
  [CategoryType.OTHER]: 'card__category_other',
  [CategoryType.SOFT_SKILL]: 'card__category_soft',
  [CategoryType.ADDITIONAL]: 'card__category_additional',
  [CategoryType.BUTTON]: 'card__category_button',
  [CategoryType.HARD_SKILL]: 'card__category_hard',
};

function formatPrice(price: number): string {
	const priceStr = price.toString();
	return priceStr.length < 5
			? priceStr
			: priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Класс для карточки товара
export class Card extends Component<ICard> {
  protected elements: ICardElements;

  constructor(container: HTMLElement, actions?: IClickMouseEvent) {
    super(container);

    // Получение элементов DOM и объединение их в объект
    this.elements = {
      title: ensureElement<HTMLElement>('.card__title', container),
      image: ensureElement<HTMLImageElement>('.card__image', container),
      category: container.querySelector('.card__category')!,
      price: container.querySelector('.card__price')!,
      button: container.querySelector('.card__button'),
    };

    // Добавление обработчика события на кнопку или контейнер
    actions?.onClick &&(this.elements.button? this.elements.button.addEventListener('click', actions.onClick): container.addEventListener('click', actions.onClick));
  }

  // Установка цены
  set price(value: number | null) {
    this.elements.price.textContent = value
      ? formatPrice(value) + ' синапсов'
      : 'Бесценно';
    if (this.elements.button) {
      this.elements.button.disabled = !value;
    }
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
    this.elements.title.textContent = value;
  }
  get title(): string {
    return this.elements.title.textContent || '';
  }

  // Установка изображения
  set image(value: string) {
    this.elements.image.src = CDN_URL + value;
  }

  // Установка состояния "selected"
  set selected(value: boolean) {
    if (this.elements.button) {
      this.elements.button.disabled = value;
    }
  }
}

// Класс для элемента магазина
export class StoreItem extends Card {
  constructor(container: HTMLElement, actions?: IClickMouseEvent) {
    super(container, actions);
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
    this.description.textContent = value;
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
  set store(items: HTMLElement[]) {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      fragment.appendChild(item);
    }
    this.elements.store.innerHTML = '';
    this.elements.store.appendChild(fragment);
  }
}
