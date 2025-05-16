logger.info(req);
logger.info({ input: req });
this.logger.debug(`Request: ${req.body}`);
logger.info('POST /user - data:', JSON.stringify(req.body));

logger.info(request);
logger.info({ input: request });
this.logger.info(`Request: ${request.body}`);
logger.info('POST /user - data:', JSON.stringify(request));

logger.info(ctx.request);
logger.info({ input: ctx.request });
logger.debug(`Request: ${ctx.request}`);
this.logger.info('POST /user - data:', JSON.stringify(ctx.request));
