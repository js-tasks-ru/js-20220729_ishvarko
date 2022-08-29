import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
	element;
	subElements = {};


	constructor(headerConfig = [], {
		data = [],
		isSortLocally = false,
		sorted = {
			id: headerConfig.find(item => item.sortable).id,
			order: 'asc',
			url: 'api/rest/products'
		}
	} = {}) {
		this.data = data;
		this.headerConfig = headerConfig;
		this.sorted = sorted;
		this.isSortLocally = isSortLocally;
		this.itemsLoaded = 0;
		this.itemPerPage = 30;
		this.render();
	}
	async loadData({ id = this.sorted.id,
		order = this.sorted.order,
		start = this.itemsLoaded,
		end = this.itemsLoaded + this.itemPerPage }
		= {}) {
		const fetchUrl = `${BACKEND_URL}/${this.sorted.url}?_sort=${id}&_order=${order}&_start=${start}&_end=${end}`;
		let res = await fetch(fetchUrl);
		const data = await res.json();
		this.itemsLoaded = end;
		return data;
	}
	appendData(data) {
		this.subElements.body.innerHTML += this.getTableRows(data);
	}

	onSortClick = async event => {
		const column = event.target.closest('[data-sortable="true"]');
		const toggleOrder = order => {
			const orders = {
				asc: 'desc',
				desc: 'asc'
			};

			return orders[order];
		};
		let sortedData;
		if (column) {
			const { id, order } = column.dataset;
			const newOrder = toggleOrder(order);
			if (this.isSortLocally) {
				sortedData = this.sortOnClient(id, newOrder);
			}
			else {
				sortedData = await this.sortOnServer(id, newOrder);
			}
			const arrow = column.querySelector('.sortable-table__sort-arrow');

			column.dataset.order = newOrder;

			if (!arrow) {
				column.append(this.subElements.arrow);
			}

			this.subElements.body.innerHTML = this.getTableRows(sortedData);
		}
	};

	getTableHeader() {
		return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
	}

	getHeaderRow({ id, title, sortable }) {
		const order = this.sorted.id === id ? this.sorted.order : 'asc';

		return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
	}

	getHeaderSortingArrow(id) {
		const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

		return isOrderExist
			? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
			: '';
	}

	getTableBody(data) {
		return `
      <div data-element="body" class="sortable-table__body">
        
      </div>`;
	}

	getTableRows(data) {
		return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item)}
      </div>`
		).join('');
	}

	getTableRow(item) {
		const cells = this.headerConfig.map(({ id, template }) => {
			return {
				id,
				template
			};
		});

		return cells.map(({ id, template }) => {
			return template
				? template(item[id])
				: `<div class="sortable-table__cell">${item[id]}</div>`;
		}).join('');
	}

	getTable(data) {
		return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>`;
	}

	async render() {

		const wrapper = document.createElement('div');
		wrapper.innerHTML = this.getTable();
		const element = wrapper.firstElementChild;
		this.element = element;
		this.subElements = this.getSubElements(element);
		this.initEventListeners();
		let data;
		if (!this.isSortLocally) {
			data = await this.loadData();
		}
		else {
			data = this.data;
		}
		this.appendData(data);
	}

	initEventListeners() {
		this.subElements.header.addEventListener('pointerdown', this.onSortClick);
	}
	async sortOnServer(id, order) {
		const data = await this.loadData({ id: id, order: order, start: 0, end: this.itemsLoaded });
		return data;
	}
	sortOnClient(id, order) {
		const arr = [...this.data];
		const column = this.headerConfig.find(item => item.id === id);
		const { sortType, customSorting } = column;
		const direction = order === 'asc' ? 1 : -1;

		return arr.sort((a, b) => {
			switch (sortType) {
				case 'number':
					return direction * (a[id] - b[id]);
				case 'string':
					return direction * a[id].localeCompare(b[id], 'ru');
				case 'custom':
					return direction * customSorting(a, b);
				default:
					return direction * (a[id] - b[id]);
			}
		});
	}

	getSubElements(element) {
		const result = {};
		const elements = element.querySelectorAll('[data-element]');
		for (const subElement of elements) {
			const name = subElement.dataset.element;
			result[name] = subElement;
		}
		return result;
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.subElements = {};
	}
}