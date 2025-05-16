logger.debug(["payload", payload]);
this.logger.info(["response", res]);
console.warn(["data", req.body]);

logger.debug(`Payload keys: ${Object.keys(payload)}`);
logger.info(`Response status: ${res.status}`);