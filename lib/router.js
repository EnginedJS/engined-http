const { Service } = require('engined');

module.exports = (opts = {}) => class extends Service {

	constructor(context) {
		super(context);

		this.agentName = opts.agentName || 'default';
	}

	async setupRoutes() {
		return null;
	}

	async start() {

		let router = await this.setupRoutes();
		if (router === null)
			return;

		let httpAgent = this.getContext().get('HTTP')[this.agentName];

		httpAgent
			.use(router.routes())
			.use(router.allowedMethods({
				throw: true
			}))
	}

	async stop() {
	}
};
