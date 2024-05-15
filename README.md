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

### Описание моделей данных
```TypeScript

/**
 * Абстрактный класс, представляющий базовую модель, отличаемую от простых объектов с данными.
 */
abstract class Model<T> {
  // Принимает данные для хранения и экземпляр эмиттера событий.
  constructor(data: Partial<T>, protected events: IEvents) {}

  // Метод для вызова события.
  emitChanges(event: string, payload?: object) {}
}

/*
 * Класс, представляющий состояние приложения.
 * */
export class AppState extends Model<IAppState> {
  // Корзина с товарами.
  basket: Product[] = [];

  // Массив, содержащий все товары.
  store: Product[];

  // Объект заказа клиента.
  order: IOrder = {
    items: [],
    payment: '',
    total: null,
    address: '',
    email: '',
    phone: '',
  };

  // Объект с ошибками формы.
  formErrors: FormErrors = {};

  // Метод для добавления товара в корзину.
  addToBasket(value: Product): void;

  // Метод для удаления товара из корзины.
  deleteFromBasket(id: string): void;

  // Метод для полной очистки корзины.
  clearBasket(): void;

  // Метод для получения количества товаров в корзине.
  getBasketAmount(): number;

  // Метод для получения общей стоимости товаров в корзине.
  getTotalBasketPrice(): number;

  // Метод для добавления ID товаров из корзины в поле items для заказа.
  setItems(): void;

  // Метод для заполнения полей email, phone, address, payment в заказе.
  setOrderField(field: keyof IOrderForm, value: string): void;

  // Валидация формы для блока "контакты".
  validateContacts(): boolean;

  // Валидация формы для блока "заказ".
  validateOrder(): boolean;

  // Очистить заказ после покупки товаров.
  refreshOrder(): boolean;

  // Метод для преобразования данных, полученных с сервера, в типы данных приложения.
  setStore(items: IProduct[]): void;

  // Метод для обновления поля selected во всех товарах после покупки.
  resetSelected(): void;
}

```

### Классы представления
```TypeScript

/**
 * Абстрактный компонент, представляющий базовый элемент.
 */
abstract class Component<T> {
  // Конструктор, принимающий родительский элемент.
  protected constructor(protected readonly container: HTMLElement) {}

  // Метод для переключения класса.
  toggleClass(element: HTMLElement, className: string, force?: boolean): void;

  // Метод для установки текстового содержимого.
  protected setText(element: HTMLElement, value: string): void;

  // Метод для изменения статуса блокировки.
  setDisabled(element: HTMLElement, state: boolean): void;

  // Метод для скрытия элемента.
  protected setHidden(element: HTMLElement): void;

  // Метод для отображения элемента.
  protected setVisible(element: HTMLElement): void;

  // Метод для установки изображения с альтернативным текстом.
  protected setImage(el: HTMLImageElement, src: string, alt?: string): void;

  // Метод для возврата корневого DOM-элемента.
  render(data?: Partial<T>): HTMLElement;
}

/*
 * Класс, представляющий главную страницу.
 * */
class Page extends Component<IPage> {
  // Ссылки на внутренние элементы.
  protected _counter: HTMLElement;
  protected _store: HTMLElement;
  protected _wrapper: HTMLElement;
  protected _basket: HTMLElement;

  // Конструктор, принимающий родительский элемент и экземпляр событий.
  constructor(container: HTMLElement, protected events: IEvents);

  // Сеттер для счетчика товаров в корзине.
  set counter(value: number);

  // Сеттер для карточек товаров на странице.
  set store(items: HTMLElement[]);

  // Сеттер для блока прокрутки.
  set locked(value: boolean);
}

/*
 * Класс, представляющий карточку товара.
*/
class Card extends Component<ICard> {
  // Ссылки на внутренние элементы карточки.
  protected _title: HTMLElement;
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  // Конструктор, принимающий имя блока, родительский элемент и колбэк функции.
  constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions);

  // Сеттер и геттер для уникального ID.
  set id(value: string);
  get id(): string;

  // Сеттер и геттер для названия.
  set title(value: string);
  get title(): string;

  // Сеттер для изображения.
  set image(value: string);

  // Сеттер для определения выбран товар или нет.
  set selected(value: boolean);

  // Сеттер для цены.
  set price(value: number | null);

  // Сеттер для категории.
  set category(value: CategoryType);
}

/*
 * Класс, представляющий корзину товаров.
 * */
export class Basket extends Component<IBasket> {
  // Ссылки на внутренние элементы.
  protected _list: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  // Конструктор, принимающий имя блока, родительский элемент и экземпляр событий.
  constructor(protected blockName: string, container: HTMLElement, protected events: IEvents);

  // Сеттер для общей цены.
  set price(price: number);

  // Сеттер для списка товаров.
  set list(items: HTMLElement[]);

  // Метод для отключения кнопки "Оформить".
  disableButton(): void;

  // Метод для обновления индексов таблички при удалении товара из корзины.
  refreshIndices(): void;
}

/*
 * Класс, представляющий форму заказа товар*/

Компоненты Presenter - реализуются в index.ts