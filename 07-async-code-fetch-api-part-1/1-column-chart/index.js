import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
	element;
	subElements = {};
	chartHeight = 50;

	constructor({
		url = '/for/test',
		range = {},
		link = '',
		label = '',
		formatHeading = function (data) { return data },
	} = {}) {
		this.url = url;
		this.range = range;
		this.link = link;
		this.label = label;
		this.formatHeading = formatHeading;

		this.render();
	}
	async loadData() {
		if (!this.url) {
			return;
		}

		const fetchUrl = `${BACKEND_URL}/${this.url}?from=${this.range.from}&to=${this.range.to}`;
		let res = await fetch(fetchUrl);
		this.data = await res.json();
	}
	getBody() {
		if (!this.data) {
			return '';
		}
		const values = Object.values(this.data);
		const maxValue = Math.max(...values);
		const scale = this.chartHeight / maxValue;


		return values
			.map(item => {
				const percent = (item / maxValue * 100).toFixed(0);

				return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
			})
			.join('');
	}

	getLink() {
		return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
	}
	get template() {
		return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
           <div data-element="header" class="column-chart__header">
             ${this.label}
           </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getBody(this.data)}
          </div>
        </div>
      </div>
    `;
	}

	async render() {
		const element = document.createElement('div');

		element.innerHTML = this.template;

		this.element = element.firstElementChild;
		this.subElements = this.getSubElements(this.element);
		await this.loadData();
		this.refreshChart();
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
	refreshChart() {
		const content = this.getBody();
		if (content) {
			this.subElements.body.innerHTML = content;
			this.element.classList.remove('column-chart_loading');
		}
	}
	clearBody() {
		this.subElements.body.innerHTML = '';
		this.element.classList.add('column-chart_loading');
	}

	async update(from, to) {
		this.range = { from, to };
		this.clearBody();
		await this.loadData();
		this.refreshChart();
		return this.data;
	}

	remove() {
		if (this.element) {
			this.element.remove();
		}
	}

	destroy() {
		this.remove();
		this.element = null;
		this.subElements = {};
	}
}
