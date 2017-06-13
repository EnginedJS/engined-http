# engined-http

HTTP agent service for engined, which is based on `koa 2`.

[![NPM](https://nodei.co/npm/engined-http.png)](https://nodei.co/npm/engined-http/)

## Installation

Install via NPM:

```shell
npm install engined-http
```

## Usage

Start HTTP agent service in engined, see example below:

```javascript
const { Manager } = require('engined');
const HTTPService = require('engined-http');

const MyHTTPService = HTTPService({
	port: 8080, // optional: default to 3001 if not set
	agentName: 'MyHTTP' // optional: default to 'default' if not set
});

const main = async () => {

	// Create manager
	let serviceManager = new Manager({ verbose: true });

	// Adding agent to manager
	serviceManager.add('MyHTTPService', MyHTTPService);

	// Start all services
	await serviceManager.startAll();
};

main();
```

## Setup Router

For HTTP routing, there is a way to inherit `RouterService` class to create a router service to manage routes by using `koa-router`.

```javascript
const Router = require('koa-router');
const { RouterService } = require('engined-http');

// Create service prototype and specify agent
const Service = RouterService({
	agentName: 'MyHTTP' // optional: default to 'default' if not set
});

class MyRouterService extends Service {

	async setupRoutes() {
		let router = Router();

		router.get('/', async (ctx) => {
			ctx.body = 'Hello!';
		});

		return router;
	}
}
```

Note: remember to add this service to engined service manager and start it.

## Setup Middlewares

By default, HTTP service will apply `koa-logger`, `koa2-cors` and `koa-bodyparser` middlewares. If you would like to apply any perfered middlewares, just override `setupMiddleware` method of service.

```javascript
class MyHTTPService extends HTTPService{{ port: 8080 }} {

	async setupMiddleware() {
		// Apply original `koa-logger`, `koa2-cors` and `koa-bodyparser` if you still need it
		await this._setupMiddleware();

		// Add your middleware
		this.agent.use(async (ctx) => {
			// Do something
		});
	}
}
```

## Setup CORS (Cross-Origin Resource Sharing)

By override `setupCORS` method of service, to make settings as parameter for `koa2-cors` to support CORS.

```javascript
class MyHTTPService extends HTTPService{{ port: 8080 }} {

	async setupCORS() {
		return { origin: '*' };
	}
}
```

## Setup Body Parser

The body parser is common middleware to parse HTTP body, we can have settings supported by `koa-bodyparser`.

```javascript
class MyHTTPService extends HTTPService{{ port: 8080 }} {

	async setupBodyParser() {
		return {
			jsonLimit: '50mb',
			textLimit: '50mb'
		};
	}
}
```

## License
Licensed under the MIT License
 
## Authors
Copyright(c) 2017 Fred Chien（錢逢祥） <<cfsghost@gmail.com>>
