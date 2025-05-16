// no-body-json-logging
// ❌ Violations
this.logger.debug(JSON.stringify(req.body));
logger.info(JSON.stringify(req.body));
log.warn(JSON.stringify(req.body));
log.debug(JSON.stringify(req.body));
log.debug('Request: ' + JSON.stringify(req.body));

this.logger.info(req.body);
logger.warn(req.body);

// ✅ Safe
this.logger.info("User request received");
this.logger.info({ email: req.body.email }); // filtered
