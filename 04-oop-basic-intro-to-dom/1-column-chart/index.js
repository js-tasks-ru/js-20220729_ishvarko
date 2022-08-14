export default class ColumnChart {
	element;
	chartHeight = 50;
	constructor({
		data = [],
		label = '',
		link = '',
		value = 0
	} = {}) {
		this.data = data;
		this.label = label;
		this.link = link;
		this.value = value;

		this.render();
	}
	chartHtml(data) {
		if (data.length) {
			return `<img src="./charts-skeleton.svg" />`;
		}
		const maxValue = Math.max(...data);
		const scale = this.chartHeight / maxValue;
		return data.map(el => {
			const points = Math.floor((el * scale));
			return `<div style="--value: ${points}"></div>`;
		}).join('');
	}
	render() {
		this.element = document.createElement('div');
		this.element.innerHTML = `
		<div class="column-chart dashboard__chart_${this.label}">
			<div class="column-chart__title">
				Total ${this.label}
				${this.link ? '<a class="column-chart__link" href="' + this.link + '">View all</a>' : ''}
			</div>
			<div class="column-chart__container">
				<div class="column-chart__header">${this.value}</div>
				<div class="column-chart__chart">${this.chartHtml(this.data)}</div>
			</div>
		</div>
	`;
	}
	update(data) {
		const newChart = this.chartHtml(data);
		const chartEl = this.element.getElementsByClassName('column-chart__chart');
		chartEl.innerHTML = newChart;
	}
	remove() {
		this.element.remove();
	}
	destroy() {
		this.remove();
	}
}
