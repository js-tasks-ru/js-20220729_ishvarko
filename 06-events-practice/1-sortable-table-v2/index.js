export default class SortableTable {
	constructor(headerConfig, {
		data = [],
		sorted = {}
	} = {},
		isSortLocally = true) {

		this.headerConfig = headerConfig;
		this.data = data;
		this.sorted = sorted;
		this.isSortLocally = isSortLocally;
		this.render();

	}
	getHeader() {
		return `<div data-element="header" class="sortable-table__header sortable-table__row">
		${this.headerConfig.map(row => this.getHeaderRow(row)).join('')
			}
		</div> `;
	}
	getHeaderRow(row) {
		return `
	<div class="sortable-table__cell" data-id="${row.id}" data-sortable="${row.sortable}" data-order="">
        <span>${row.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
	`;
	}

	getBody() {
		return `<div data-element="body" class="sortable-table__body">
			${this.getBodyRows(this.data)}
		</div>`;
	}
	getBodyRows(data) {
		return data.map(row => {
			return `<a href="/products/${row.id}" class="sortable-table__row" >
				${this.getBodyRow(row)}
			</a>`
		})
	}

	getBodyRow(row) {
		return this.headerConfig.map(({ id, template }) => {
			return template ? template(row[id]) : `<div class="sortable-table__cell">${row[id]}</div>`
		}).join('');
	}
	get template() {
		return `
	<div data-element="productsContainer" class="products-list__container">
		<div class="sortable-table">
			${this.getHeader()}
			${this.getBody()}
			<div data-element="loading" class="loading-line sortable-table__loading-line"></div>

			<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
				<div>
					<p>No products satisfies your filter criteria</p>
					<button type="button" class="button-primary-outline">Reset all filters</button>
				</div>
			</div>
		</div>
		</div>

	`;
	}
	render() {
		const element = document.createElement('div');
		element.innerHTML = this.template;
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements(this.element);
		this.addListeners();
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
		if (this.element)
			this.element.remove();
	}
	destroy() {
		this.remove();
		this.element = null;
		this.removeListeners()
	}
	update() {
		this.element.innerHTML = this.template;
	}
	sort(fieldValue, orderValue) {
		if (this.isSortLocally) {
			this.sortOnClient(fieldValue, orderValue);
		} else {
			this.sortOnServer(fieldValue, orderValue);
		}
	}
	sortOnClient(fieldValue, orderValue) {
		const sortedData = this.sortData(fieldValue, orderValue);
		const allCols = this.element.querySelectorAll('.sortable-table__cell[data-id]');
		const currentCol = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

		allCols.forEach(col => {
			col.dataset.order = '';
		})
		currentCol.dataset.order = orderValue;
		this.subElements.body.innerHTML = this.getBodyRows(sortedData);
	}
	sortData(fieldValue, orderValue) {
		const arr = [...this.data];
		const directions = {
			asc: 1,
			desc: -1
		};
		const direction = directions[orderValue];
		const { sortType } = this.headerConfig.find(item => item.id === fieldValue);
		return arr.sort((obj1, obj2) => {
			if (sortType === 'string') {
				return direction * obj1[fieldValue].localeCompare(obj2[fieldValue], ['ru', 'en'], { caseFirst: 'upper' });
			} else {
				return direction * (obj1[fieldValue] - obj2[fieldValue]);
			}
		});
	}
	sortEvent = (event) => {
		let cell;
		if (event.target.tagName === 'SPAN') {
			cell = event.target.closest('.sortable-table__cell');
		}
		else {
			cell = event.target;
		}
		if (cell.dataset.sortable) {
			let order;
			switch (cell.dataset.order) {
				case 'asc':
					order = 'desc';
					break;
				case 'desc':
					order = 'asc'
					break;
				default:
					order = 'desc'
			}
			this.sort(cell.dataset.id, order);
		}
		else {
			return;
		}



	}
	addListeners() {
		const sortableCells = this.subElements.header.querySelectorAll('.sortable-table__cell[data-sortable="true"]');
		sortableCells.forEach(cell => {
			cell.addEventListener('pointerdown', this.sortEvent);
		})
	}
	removeListeners() {
		const sortableCells = this.subElements.header.querySelectorAll('.sortable-table__cell[data-sortable="true"]');
		sortableCells.forEach(cell => {
			cell.removeEventListener('pointerdown', this.sortEvent);
		})
	}

}
