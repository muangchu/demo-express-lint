
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


this.logger.info({ email: req.body.email });         // ✅
this.logger.debug("Password is hidden");             // ✅
this.logger.info(user.phone);                        // ✅
this.logger.warn(`User address: ${user.address}`);   // ✅
logger.info("My SSN: 123");                          // ✅

//valid

