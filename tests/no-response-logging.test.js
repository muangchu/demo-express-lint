//Invalid
logger.info(res);
logger.info({ result: res });
this.logger.info(`Response: ${res}`);
logger.info('POST /user - result:', JSON.stringify(res)); 

logger.info(response);
logger.info({ result: response });
this.logger.info(`Response: ${response}`);
logger.info('POST /user - response:', JSON.stringify(response)); 

logger.info(ctx.response);
logger.info({ result: ctx.response });
logger.debug(`Response: ${ctx.response}`);
this.logger.info('POST /user - response:', JSON.stringify(ctx.response)); 

this.logger.error(['error get uicd',JSON.stringify(response)]);
this.logger.info([`call business rule ${ruleNumber}`,response.data]);

//Valid
this.logger.info([`call business rule ${ruleNumber}`,response.data.brand]);
