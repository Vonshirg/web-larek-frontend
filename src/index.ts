import './scss/styles.scss';
import { Api, ApiListResponse } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { IOrderForm, IProduct } from './types/types';
import { API_URL } from './utils/constants';
import { Basket, CartItem } from './components/Basket';
import { Order, Contacts, Success } from './components/Order';
import { IEvents } from './components/base/Events';
import { Page } from './components/Card';
import { StoreItem, StoreItemPreview } from './components/Card';
import { AppState } from './components/Data';
import { ensureElement, cloneTemplate } from './utils/utils';

// Функция для создания модального окна
function createModal(container: HTMLElement, events: IEvents) {
  const closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
  const content = ensureElement<HTMLElement>('.modal__content', container);

  closeButton.addEventListener('click', close);
  container.addEventListener('click', close);
  content.addEventListener('click', (event) => event.stopPropagation());

  function setContent(value: HTMLElement) {
    content.replaceChildren(value);
  }

  function open() {
    container.classList.add('modal_active');
    events.emit('modal:open');
  }

  function close() {
    container.classList.remove('modal_active');
    setContent(null);
    events.emit('modal:close');
  }

  function render(data: { content: HTMLElement }): HTMLElement {
    setContent(data.content);
    open();
    return container;
  }

  return {
    open,
    close,
    render,
  };
}

const api = new Api(API_URL);
const events = new EventEmitter();
const appData = new AppState({}, events);
const page = new Page(document.body, events);
const modal = createModal(ensureElement<HTMLElement>('#modal-container'), events);

const templates = ['#card-catalog', '#card-preview', '#basket', '#card-basket', '#order', '#contacts', '#success'];
const elements: HTMLTemplateElement[] = templates.map(selector => ensureElement<HTMLTemplateElement>(selector));
const [storeProductTemplate, cardPreviewTemplate, basketTemplate, cardBasketTemplate, orderTemplate, contactsTemplate, successTemplate] = elements;

const basket = new Basket( cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events)
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => modal.close()
});

api.get('/product')
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
  page.store = appData.products.map((item) => {
    const product = new StoreItem(cloneTemplate(storeProductTemplate), {
      onClick: () => events.emit('card:select', item),
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
  modal.render({
    content: product.render({ ...item, selected: item.selected }),
  });
}

function handleCardToBasket(item: IProduct) {
  item.selected = true;
  appData.addProductToCart(item);
  page.count = appData.getCartItemCount();
  modal.close();
}

function handleBasketDelete(item: IProduct) {
  appData.removeProductFromCart(item.id);
  item.selected = false;
  basket.price = appData.calculateTotalCartPrice();
  page.count = appData.getCartItemCount();
  basket.refreshIndices();
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
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ phone, email }).filter(Boolean).join('; ');
}

function handleOrderInputChange(data: { field: keyof IOrderForm, value: string }) {
  appData.updateOrderField(data.field, data.value);
}

function handleOrderSubmit() {
  appData.currentOrder.total = appData.calculateTotalCartPrice();
  appData.updateOrderItems();
  modal.render({
    content: contacts.render({ valid: false, errors: [] }),
  });
}

function openBasket() {
  page.lock = true;
  const basketItems = appData.cart.map((item, index) => {
    const storeItem = new CartItem(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('basket:delete', item)
    });
    return storeItem.render({ title: item.title, price: item.price, index: index + 1 });
  });
  modal.render({
    content: basket.render({ list: basketItems, price: appData.calculateTotalCartPrice() }),
  });
}

function handleContactsSubmit() {
  api.post('/order', appData.currentOrder)
    .then((res) => {
      events.emit('order:success', res);
      appData.clearCart();
      appData.resetOrder();
      order.disableButtons();
      page.count = 0;
      appData.deselectAllProducts();
    })
    .catch((err) => console.log(err))
}

function closeModal() {
  page.lock = false;
  appData.resetOrder();
}

function handleOrderSuccess(res: ApiListResponse<string>) {
  modal.render({
    content: success.render({ description: res.total })
  })
}

