const Koa = require('koa');
const cors = require('koa2-cors');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const { Service } = require('engined');

module.exports = (opts = {}) => class extends Service {

	constructor(context) {
		super(context);

		this.server = null;
		this.agentName = opts.agentName || 'default';
		this.agent = null;
		this.port = opts.port || '3001';
	}

	async _setupMiddleware() {

		// Loading middlewares
		this.agent.use(logger());
		this.agent.use(cors(await this.setupCORS()));
		this.agent.use(bodyParser(await this.setupBodyParser()));
	}

	async setupMiddleware() {
		await this._setupMiddleware();
	}

	async setupCORS() {
		return {}
	}

	async setupBodyParser() {
		return {};
	}

	async listening() {
	}

	async start() {

		let context = this.getContext().get('HTTP');
		if (!context) {
			context = {};
			this.getContext().set('HTTP', context);
		}

		let app = this.agent = new Koa();

		// Initializing context
		app.context.enginedContext = this.getContext();

		await this.setupMiddleware();

		// Listening
		this.server = await new Promise((resolve) => {
			let handle = app.listen(this.port, '0.0.0.0', () => {
				resolve(handle);
			});
		});

		context[this.agentName] = this.agent;

		await this.listening();
	}

	async stop() {

		let context = this.getContext().get('HTTP');
		if (!context)
			return;

		if (this.server === null)
			return;

		this.server.close();
		this.server = null;
		this.agent = null;

		delete context[this.agentName];
	}
}
