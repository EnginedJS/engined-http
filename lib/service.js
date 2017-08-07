const Koa = require('koa');
const cors = require('koa2-cors');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const { Service } = require('engined');

module.exports = (opts = {}) => class extends Service {

	constructor(context) {
		super(context);

		this.server = null;
		this.agentName = opts.agentName || 'default';
		this.agent = null;
		this.port = opts.port || '3001';
		this.middlewares = [];
	}

	async _middlewares(ctx, next) {

		let middlewares = this.middlewares.slice(0);

		let middleware = middlewares.shift();
		while(middleware) {

			let nextRequired = await new Promise(async (resolve) => {
				await middleware(ctx, async () => {
					resolve(true);
				});

				resolve(false);
			})

			if (!nextRequired)
				return;

			middleware = middlewares.shift();
		}

		await next();
	}

	async _setupMiddleware() {

		// Loading middlewares
		this.agent.use(logger());
		this.agent.use(cors(await this.setupCORS()));
		this.agent.use(koaBody(await this.setupBodyParser()));
		this.agent.use(this._middlewares.bind(this));
	}

	async setupMiddleware() {
		await this._setupMiddleware();
	}

	async setupCORS() {
		return {};
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

		this.agent.getServer = () => {
			return this.server;
		};

		this.agent.addMiddleware = (middleware) => {
			this.middlewares.push(middleware);
		};

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
