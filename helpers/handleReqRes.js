/*
 * Title: Handle Request Response
 * Description: Handle Resquest and response
 * Author: Sumit Saha ( Learn with Sumit )
 * Date: 11/15/2020
 *
 */

// dependencies
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');

// modue scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    // request handling
    // get the url and parse it
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = Object.fromEntries(parsedUrl.searchParams);
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestProperties.body = handler.parseBody(realData);

        chosenHandler(requestProperties, (statusCode, payload) => {
            const code = typeof statusCode === 'number' ? statusCode : 500;
            const body = typeof payload === 'object' && payload !== null ? payload : {};
            const payloadString = JSON.stringify(body);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(code);
            res.end(payloadString);
        });
    });
};

handler.parseBody = (rawBody) => {
    if (!rawBody) {
        return {};
    }

    try {
        const parsedBody = JSON.parse(rawBody);
        if (typeof parsedBody === 'object' && parsedBody !== null) {
            return parsedBody;
        }
        return {};
    } catch {
        return {};
    }
};

module.exports = handler;
