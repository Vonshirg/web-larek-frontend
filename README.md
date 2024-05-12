https://github.com/Vonshirg/web-larek-frontend.git

# Проектная работа "Веб-ларек"


## Запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Описание

Онлайн магазин необходимых для веб разработчика мелочей.

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами


### Архитектура и подходы

Проект реализован в соответствии с архитектурой MVP (Model-View-Presenter). MVP разделяет приложение на три основные части: модель (Model), представление (View) и презентер (Presenter). Модель отвечает за данные, представление — за их отображение, а презентер управляет взаимодействием между моделью и представлением.
В качестве основного подхода к взаимодействию в приложении используется событийно-ориентированный подход. Для этого используется класс EventEmitter, который обеспечивает механизм для управления событиями в приложении.
*/

### Типы данных

```TypeScript
Часть 1: Model
/*
    Описание всех возможных категорий товаров
*/
type CategoryType =
  | 'другое'
  | 'софт-скил'
  | 'дополнительное'
  | 'кнопка'
  | 'хард-скил';

/*
    Описание ошибок валидации форм
*/
type FormErrors = Partial<Record<keyof IOrderForm, string>>;

/*
  Интерфейс для карточки товара в магазине
*/
interface IProduct {
  id: string; // Уникальный ID
  description: string; // Описание товара
  image: string; // Ссылка на картинку
  title: string; // Название
  category: CategoryType; // Категория товара
  price: number | null; // Цена товара, может быть null
  selected: boolean; // Был данный товар добавлен в корзину или нет
}

/*
  Интерфейс для заказа товара
*/
export interface IOrder {
  items: string[]; // Массив ID купленных товаров
  payment: string; // Способ оплаты
  total: number; // Сумма заказа
  address: string; // Адрес доставки
  email: string; // Электронная почта
  phone: string; // Телефон
}

Часть 2: View
/*
  Интерфейс для карточки товара
*/
interface ICard {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number | null;
  selected: boolean;
}

/*
  Интерфейс для страницы
*/
interface IPage {
  counter: number; // Счётчик товаров в корзине
  store: HTMLElement[]; // Массив карточек с товарвми
  locked: boolean; // Переключатель для блокировки
  // Отключает прокрутку страницы
}

/*
  Интерфейс для корзины товаров
*/
export interface IBasket {
  list: HTMLElement[]; // Массив элементов li с товаром
  price: number; // Общая цена товаров
}

/*
  Интерфейс для окошка заказа товара
*/
export interface IOrderView {
  address: string; // Адрес
  payment: string; // Способ оплаты
}

/*
  Интерфейс для окошка контактов
*/
export interface IContactView {
  phone: string; // Телефон
  email: string; // Электронная почта
}

Часть 3: Presenter
/*
  Интерфейс для внутреннего состояния приложения
*/
interface IAppState {
  basket: Product[]; // Корзина с товарами
  store: Product[]; // Массив карточек товара
  order: IOrder; // Информация о заказе при покупке товара
  formErrors: FormErrors; // Ошибки при заполнении форм
  addToBasket(value: Product): void; // Добавление товара в корзину
  deleteFromBasket(id: string): void; // Удаление товара из корзины
  clearBasket(): void; // Полная очистка корзины
  getBasketAmount(): number; // Получение количества товаров в корзине
  getTotalBasketPrice(): number; // Получение суммы цены всех товаров в корзине
  setItems(): void; // Добавление ID товаров в корзине в поле items для order
  setOrderField(field: keyof IOrderForm, value: string): void; // Заполнение полей заказа
  validateContacts(): boolean; // Валидация формы контактов
  validateOrder(): boolean; // Валидация формы заказа
  refreshOrder(): boolean; // Очистка заказа после покупки
  setStore(items: IProduct[]): void; // Превращение данных с сервера в тип данных приложения
  resetSelected(): void; // Обновление поля selected после покупки
}

```

### Классы представления
```TypeScript

Часть 1: Model

/**
 * Базовый компонент
 */
abstract class Component<T> {
  constructor(protected readonly container: HTMLElement);

  toggleClass(element: HTMLElement, className: string, force?: boolean): void;

  protected setText(element: HTMLElement, value: string): void;

  setDisabled(element: HTMLElement, state: boolean): void;

  protected setHidden(element: HTMLElement): void;

  protected setVisible(element: HTMLElement): void;

  protected setImage(el: HTMLImageElement, src: string, alt?: string): void;

  render(data?: Partial<T>): HTMLElement;
}

/*
  * Класс для главной страницы
  * */
class Page extends Component<IPage> {
  protected _counter: HTMLElement;
  protected _store: HTMLElement;
  protected _wrapper: HTMLElement;
  protected _basket: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents);

  set counter(value: number);

  set store(items: HTMLElement[]);

  set locked(value: boolean);
}

/*
    Класс для карточки товара
*/
class Card extends Component<ICard> {
  protected _title: HTMLElement;
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions);

  set id(value: string);
  get id(): string;

  set title(value: string);
  get title(): string;

  set image(value: string);

  set selected(value: boolean);

  set price(value: number | null);

  set category(value: CategoryType);
}

/*
  * Класс для корзины товаров
  * */
export class Basket extends Component<IBasket> {
  protected _list: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(protected blockName: string, container: HTMLElement, protected events: IEvents);

  set price(price: number);

  set list(items: HTMLElement[]);

  disableButton(): void;

  refreshIndices(): void;
}

Часть 2: View

/*
  * Класс для окошка заказа товара
  * */
export class Order extends Form<IOrder> {
  protected _card: HTMLButtonElement;
  protected _cash: HTMLButtonElement;

  constructor(protected blockName: string, container: HTMLFormElement, protected events: IEvents);

  disableButtons(): void;
}

/*
  * Класс для окошка контактов
  * */
export class Contacts extends Form<IContacts> {
  constructor(container: HTMLFormElement, events: IEvents);
}

/**
 * Класс для работы с Api
 */
class Api {
  readonly baseUrl: string;
  protected options: RequestInit;

  constructor(baseUrl: string, options: RequestInit = {});

  protected async handleResponse(response: Response): Promise<Partial<object>>;

  async get(uri: string);

  async post(uri: string, data: object);
}

/**
 * Обработчик событий
 */
class EventEmitter implements IEvents {
  _events: Map<EventName, Set<Subscriber>>;

  constructor() {}

  on<T extends object>(eventName: EventName, callback: (event: T) => void) {}

  off(eventName: EventName, callback: Subscriber) {}

  emit<T extends object>(eventName: string, data?: T) {}
}

Часть 3: Presenter
Компоненты Presenter - реализуются в index.ts