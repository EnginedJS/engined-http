const { Service } = require('engined');
const Router = require('koa-router');

module.exports = (opts = {}) => {

	class RouterService extends Service {

		constructor(context) {
			super(context);

			this.agentName = opts.agentName || 'default';
		}

		async initialize() {
		}

		async uninitialize() {
		}

		async setupMiddlewares() {
			return [];
		}

		async setupRoutes() {
			return null;
		}

		createRouter(opts) {
			return new Router(opts);
		}

		routeType(type) {

			return async (ctx, next) => {
				ctx.state.routeType = type;

				if (type !== 'API') {
					return await next();
				}

				try {
					await next();
				} catch(e) {

					if (e.status !== undefined) {
						ctx.status = e.status;
						ctx.body = e;
					} else {
						ctx.status = 500;
						ctx.body = {
							code: 'ServerError',
							message: 'Internal server error'
						};

						console.error(e);
					}
				}
			};
		}

		async start() {
			await this.initialize();

			let router = await this.setupRoutes();
			if (router === null)
				return;

			let httpAgent = this.getContext().get('HTTP').getAgent(this.agentName);
			let middlewares = await this.setupMiddlewares();

			middlewares.forEach((m) => {
				httpAgent.addMiddleware(m);
			});

			httpAgent
				.use(router.routes())
				.use(router.allowedMethods({
					throw: true
				}))
		}

		async stop() {

			await this.uninitialize();
		}
	};

	return RouterService;
}
