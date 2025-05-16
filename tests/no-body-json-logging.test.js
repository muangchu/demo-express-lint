// no-body-json-logging
// ❌ Violations
this.logger.debug(JSON.stringify(req.body));
logger.info(JSON.stringify(req.body));
log.warn(JSON.stringify(req.body));
log.debug(JSON.stringify(req.body));
log.debug('Request: ' + JSON.stringify(req.body));

log.debug(JSON.stringify(req.body));                                 // direct
log.debug('Request: ' + JSON.stringify(req.body));                   // binary expression
log.debug(`Request body: ${JSON.stringify(req.body)}`);              // template literal
this.logger.info('POST /user', JSON.stringify(req.body));           // direct on this.logger


this.logger.info(req.body);
logger.warn(req.body);

// ✅ Safe
this.logger.info("User request received");
this.logger.info({ email: req.body.email }); // filtered
