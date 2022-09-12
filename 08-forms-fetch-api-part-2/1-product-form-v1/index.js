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
  onDelete = (e) => {
    if (e.target.dataset.deleteHandle !== undefined) {
      e.target.closest("li").remove();
    }
  };
  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  };
  imageUpload = (e) => {
    e.preventDefault();
    const uploadImage = this.subElements.productForm.uploadImage;
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.addEventListener("change", async () => {
      const [image] = imageInput.files;
      if (image) {
        const formData = new FormData();
        const { imageListContainer } = this.subElements;

        formData.append("image", image);
        uploadImage.classList.add("is-loading");
        uploadImage.disabled = true;
        const result = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          mode: "cors",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          //referrer: "",
        });

        if (result.success === true) {
          const li = this.renderImage(image.name, result.data.link);
          imageListContainer.append(li);
        }
      }
      imageInput.remove();
      uploadImage.classList.remove("is-loading");
      uploadImage.disabled = false;
    });
    imageInput.click();
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
    const [categoriesData, productData] = await Promise.all([
      categoriesPromise,
      productPromise,
    ]);
    this.productData = productData;
    this.insertCategories(categoriesData);
    this.insertProductData();
    this.initializeListeners();
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
    const queryUrl = `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`;
    const res = await fetch(queryUrl);
    const data = await res.json();
    return data;
  }
  async getProductData(productId) {
    const queryUrl = `${BACKEND_URL}/api/rest/products?id=${productId}`;
    const res = await fetch(queryUrl);
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
  renderImage(imageName, imageLink) {
    const newImageWrapper = document.createElement("div");
    newImageWrapper.innerHTML = `
       <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${imageLink}">
          <input type="hidden" name="source" value="${imageName}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${imageLink}">
        <span>${imageName}</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>
          `;
    const li = newImageWrapper.firstElementChild;
    return li;
  }
  async save() {
    const data = this.getFormData();
    const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    this.dispatchEvent(result.id);
  }
  getFormData() {
    const { imageListContainer, productForm } = this.subElements;
    const excludeFields = ["images"];
    const fieldsToNumber = ["price", "quantity", "discount", "status"];
    const fields = Object.keys(this.defaultProductData).filter(
      (item) => !excludeFields.includes(item)
    );
    const getValue = (field) =>
      productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);
      values[field] = fieldsToNumber.includes(field) ? parseInt(value) : value;
    }
    const imagesHTML = imageListContainer.querySelectorAll(
      ".sortable-table__cell-img"
    );
    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTML) {
      values.images.push({
        url: image.src,
        source: image.alt,
      });
    }
    return values;
  }
  initializeListeners() {
    this.element.addEventListener("click", this.onDelete);
    this.subElements.productForm.uploadImage.addEventListener(
      "click",
      this.imageUpload
    );
    this.subElements.productForm.save.addEventListener("click", this.onSubmit);
  }
  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent("product-updated", { id })
      : new CustomEvent("product-saved");
    this.element.dispatchEvent(event);
  }
  remove() {
    this.element.removeEventListener("click", this.onDelete);
    this.subElements.productForm.save.removeEventListener(
      "click",
      this.onSubmit
    );
    this.subElements.productForm.uploadImage.removeEventListener(
      "click",
      this.imageUpload
    );

    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}