export enum CategoryType {
  OTHER = 'другое',
  SOFT_SKILL = 'софт-скил',
  ADDITIONAL = 'дополнительное',
  BUTTON = 'кнопка',
  HARD_SKILL = 'хард-скил'
}

export interface ICard {
	id: string;
	title: string;
	category: string;
	description: string;
	image: string;
	price: number | null;
	selected: boolean;
  index?: number;
}

export interface IPage {
  counter: number;
  store: HTMLElement[];
  locked: boolean;
}

export interface IOrder {
  items?: string[];
  payment?: string;
  total?: number | null;
  address?: string;
  email?: string;
  phone?: string;
}

export interface IPage {
  counter: number;
  store: HTMLElement[];
  locked: boolean;
}


export interface IPageElements {
  counter: HTMLElement;
  wrapper: HTMLElement;
  basket: HTMLElement;
  store: HTMLElement;
}

export interface IPageElements {
  counter: HTMLElement;
  wrapper: HTMLElement;
  basket: HTMLElement;
  store: HTMLElement;
}

export interface IOrderFormElements {
  card: HTMLButtonElement;
  cash: HTMLButtonElement;
}

export type FormErrors = Partial<IOrderForm>;;

export interface IAppState {
  basket: IProduct[];
  store: IProduct[];
  order: IOrder;
  formErrors: FormErrors;
  setOrderField(field: keyof IOrderForm, value: string): void;
  validateContacts(): boolean;
  validateOrder(): boolean;
  refreshOrder(): boolean;
  setStore(items: IProduct[]): void;
  resetSelected(): void;
}


export type FormState = {
  valid: boolean;
  errors: string[];
};

export interface IOrderForm {
  payment: string;
  address: string;
  email: string;
  phone: string;
}

export interface IComponentElements {
  listElement?: HTMLElement; 
  indexElement?: HTMLElement; 
  titleElement?: HTMLElement; 
  priceElement: HTMLElement; 
  buttonElement: HTMLButtonElement;
}

export interface IBasket {
  list: HTMLElement[];
  price: number;
}

export interface IClickMouseEvent {
  onClick: (event: MouseEvent) => void;
}

export interface IProductBasket extends IProduct {
  id: string;
  index: number;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: CategoryType;
  price: number | null;
  selected: boolean;
}




