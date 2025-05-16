//valid


//invalid
logger.info({ email: user.email });
logger.info(`User phone: ${user.phone}`)
this.logger.debug(req.body.phone);
logger.debug(req.body.phone);
log.debug(req.body.phone);

logger.info({ phone: user.phone });                    // object literal
this.logger.debug(req.body.phone);                    // member expression
logger.debug(req.body.phone);                         // member expression
log.debug(req.body.phone);                            // member expression
logger.info(`User phone: ${user.phone}`);             // template literal