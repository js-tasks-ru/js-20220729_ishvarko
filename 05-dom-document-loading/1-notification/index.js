export default class NotificationMessage {
	static currentNotification;
	timerId;
	constructor(text, {
		duration = 2000,
		type = 'success'
	} = {}) {
		this.text = text;
		this.type = type;
		this.duration = duration;

		this.render();
	}
	get template() {

		return `
		 <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
			<div class="timer"></div>
			<div class="inner-wrapper">
				<div class="notification-header">${this.type}</div>
				<div class="notification-body">
					${this.text}
				</div>
			</div>
		</div>
		`;
	}
	render() {
		const element = document.createElement('div');
		element.innerHTML = this.template;
		this.element = element.firstElementChild;
	}
	show(parent = document.body) {
		if (NotificationMessage.currentNotification) {
			NotificationMessage.currentNotification.remove();
		}


		parent.append(this.element);
		this.timerId = setTimeout(() => { this.destroy() }, this.duration);
		NotificationMessage.currentNotification = this;
	}
	remove() {
		if (this.element)
			this.element.remove();
		clearTimeout(this.timerId);

	}
	destroy() {
		this.remove();
		this.element = null;
		NotificationMessage.currentNotification = null;
	}
}
