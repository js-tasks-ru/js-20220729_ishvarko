import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  defaultProductData = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    price: 100,
    discount: 0,
  };
  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    const categoriesPromise = this.getCategories();
    const productPromise = this.productId
      ? this.getProductData(this.productId)
      : Promise.resolve(this.defaultProductData);
    const [categories, productData] = await Promise.all([
      categoriesPromise,
      productPromise,
    ]);
    this.productData = productData;
    console.log(this.productData);
    this.insertCategories(categories);
    this.insertProductData();
  }
  insertProductData() {
    this.subElements.productForm.title.value = this.productData.title;
    this.subElements.productForm.description.value =
      this.productData.description;
    this.subElements.productForm.price.value = this.productData.price;
    this.subElements.productForm.discount.value = this.productData.discount;
    this.subElements.productForm.quantity.value = this.productData.quantity;
    this.subElements.productForm.status.value = this.productData.status;
    const imageList = this.subElements.imageListContainer.firstElementChild;

    if (
      Array.isArray(this.productData.images) &&
      this.productData.images.length
    ) {
      console.log(this.productData.images);
      const html = this.productData.images
        .map((image) => {
          return /*html*/ `
                <li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value="${image.url}">
              <input type="hidden" name="source" value="${image.source}">
              <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
            <span>${image.source}</span>
          </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button></li>`;
        })
        .join("");
      imageList.innerHTML = html;
    }
  }
  insertCategories(categories) {
    console.log(this.subElements.productForm);
    categories.forEach((cat) => {
      cat.subcategories.forEach((subCat) => {
        const selected =
          this.productData.subcategory === subCat.id ? true : false;
        const option = new Option(
          `${cat.title} > ${subCat.title}`,
          subCat.id,
          false,
          selected
        );
        this.subElements.productForm.subcategory.append(option);
      });
    });
  }

  async getCategories() {
    const queryUrl = "/api/rest/categories";
    const url = new URL(queryUrl, BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }
  async getProductData(productId) {
    const queryUrl = "/api/rest/products";
    const url = new URL(queryUrl, BACKEND_URL);
    url.searchParams.set("id", productId);
    const res = await fetch(url);
    const data = await res.json();
    return data[0];
  }
  get template() {
    return /*html*/ `
        <div class="product-form">
          <form data-element="productForm" class="form-grid">
            <div class="form-group form-group__half_left">
              <fieldset>
                <label class="form-label">Название товара</label>
                <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
              </fieldset>
            </div>
            <div class="form-group form-group__wide">
              <label class="form-label">Описание</label>
              <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
            </div>
            <div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              <div data-element="imageListContainer"><ul class="sortable-list">
                </ul></div >
                <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            </div>
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              <select class="form-control" name="subcategory">
              </select>
            </div>
            <div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                <label class="form-label">Цена ($)</label>
                <input required="" type="number" name="price" class="form-control" placeholder="100">
              </fieldset>
              <fieldset>
                <label class="form-label">Скидка ($)</label>
                <input required="" type="number" name="discount" class="form-control" placeholder="0">
              </fieldset>
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Количество</label>
              <input required="" type="number" class="form-control" name="quantity" placeholder="1">
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Статус</label>
              <select class="form-control" name="status">
                <option value="1">Активен</option>
                <option value="0">Неактивен</option>
              </select>
            </div>
            <div class="form-buttons">
              <button type="submit" name="save" class="button-primary-outline">
                Сохранить товар
              </button>
            </div>
          </form>
      </div>`;
  }
  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }
}