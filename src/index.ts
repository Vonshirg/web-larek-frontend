import './scss/styles.scss';
import { Api, ApiListResponse } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { IOrderForm, IProduct } from './types/types';
import { API_URL } from './utils/constants';
import { Basket,  } from './components/Basket';
import { Order} from './components/Order';
import { Form } from './components/Form';
import { Page } from './components/Page';
import { Card, StoreItemPreview } from './components/Card';
import { AppState } from './components/Data';
import { ensureElement, cloneTemplate } from './utils/utils';
import {  Success } from './components/Success';
import {  Modal } from './components/Modal';



const api = new Api(API_URL);
const events = new EventEmitter();
const appData = new AppState({}, events);
const page = new Page(document.body, events);
const modal = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	events
);

const templates = [
	'#card-catalog',
	'#card-preview',
	'#basket',
	'#card-basket',
	'#order',
	'#contacts',
	'#success',
];
const elements: HTMLTemplateElement[] = templates.map((selector) =>
	ensureElement<HTMLTemplateElement>(selector)
);
const [
	storeProductTemplate,
	cardPreviewTemplate,
	basketTemplate,
	cardBasketTemplate,
	orderTemplate,
	contactsTemplate,
	successTemplate,
] = elements;

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const form = new Form(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
	onClick: () => modal.close(),
});

api
	.get('/product')
	.then((res: { items: IProduct[] }) => appData.setProducts(res.items))
	.catch((err) => console.error(err));

events.on('items:changed', updateStoreItems);
events.on('card:select', handleCardSelect);
events.on('card:toBasket', handleCardToBasket);
events.on('basket:delete', handleBasketDelete);
events.on('basket:order', handleBasketOrder);
events.on('orderFormErrors:change', handleOrderFormErrors);
events.on('contactsFormErrors:change', handleContactsFormErrors);
events.on('orderInput:change', handleOrderInputChange);
events.on('order:submit', handleOrderSubmit);
events.on('basket:open', openBasket);
events.on('contacts:submit', handleContactsSubmit);
events.on('modal:close', closeModal);
events.on('order:success', handleOrderSuccess);

function updateStoreItems() {
	page.storeItem = appData.products.map((item) => {
		const product = new Card(cloneTemplate(storeProductTemplate), {
			onClick: () => handleCardSelect(item),
		});
		return product.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
}


function handleCardSelect(item: IProduct) {
	page.lock = true;
	const product = new StoreItemPreview(cloneTemplate(cardPreviewTemplate), {
		onClick: () => events.emit('card:toBasket', item),
	});
	if (!item.price) {
		modal.render({
			content: product.render({ ...item, selected: true }),
		});
	} else {
		modal.render({
			content: product.render({ ...item, selected: item.selected }),
		});
	}
}


function handleCardToBasket(item: IProduct) {
	const isProductInCart = appData.cart.find((product) => product.id === item.id); // Проверяем наличие товара в корзине
	if (!isProductInCart) {
		appData.addProductToCart(item);
		page.count = appData.getCartItemCount();
	}
	modal.close();
}

function handleBasketDelete(item: IProduct) {
  // Удаление товара из корзины
  appData.removeProductFromCart(item.id);
  
  
  // Обновление цены корзины
  basket.price = appData.calculateTotalCartPrice();
  
  // Обновление количества товаров в корзине
  page.count = appData.getCartItemCount();
  
  // Открытие корзины
  openBasket();
  
  // Обновление индексов товаров в корзине
  const basketItems = appData.cart.map((cartItem, index) => {
    const storeItem = new Card(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('basket:delete', cartItem),
    });
    const renderedItem = storeItem.render({ title: cartItem.title, price: cartItem.price, index: index + 1 });
    storeItem.updateIndex(index + 1); // Обновление индекса товара
    return renderedItem;
  });

  basket.list = basketItems;

  // Отключение кнопки, если корзина пуста
  if (!appData.cart.length) {
    basket.disableButton();
  }
}



function handleBasketOrder() {
	modal.render({
		content: order.render({ address: '', valid: false, errors: [] }),
	});
}

function handleOrderFormErrors(errors: Partial<IOrderForm>) {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address }).filter(Boolean).join('; ');
}

function handleContactsFormErrors(errors: Partial<IOrderForm>) {
	const { email, phone } = errors;
	form.valid = !email && !phone;
	form.errors = Object.values({ phone, email }).filter(Boolean).join('; ');
}

function handleOrderInputChange(data: {
	field: keyof IOrderForm;
	value: string;
}) {
	appData.updateOrderField(data.field, data.value);
}

function handleOrderSubmit() {
	modal.render({
		content: form.render({ valid: false, errors: [] }),
	});
}

function openBasket() {
  page.lock = true;
  const basketItems = appData.cart.map((item, index) => {
    const storeItem = new Card(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('basket:delete', item),
    });
    const renderedItem = storeItem.render({ title: item.title, price: item.price, index: index + 1 });
    storeItem.updateIndex(index + 1); // Обновление индекса товара
    return renderedItem;
  });
  
  // Рендеринг корзины с обновленным списком товаров и общей ценой
  modal.render({
    content: basket.render({ list: basketItems, price: appData.calculateTotalCartPrice() }),
  });

  // Обновление списка товаров в корзине
  basket.list = basketItems;
}


function handleContactsSubmit() {
	const preparedOrder = appData.prepareOrderForServer(); // Подготавливаем заказ для отправки
	api
		.post('/order', preparedOrder)
		.then((res) => {
			events.emit('order:success', res);
			appData.clearCart();
			appData.resetOrder();
			order.disableButtons();
			page.count = 0;
			
		})
		.catch((err) => console.log(err));
}

function closeModal() {
	page.lock = false;
	appData.resetOrder();
}

function handleOrderSuccess(res: ApiListResponse<string>) {
	modal.render({
		content: success.render({ description: res.total }),
	});
}
