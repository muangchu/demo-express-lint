logger.info(user);                    // Identifier
console.log(req.body);               // MemberExpression
this.logger.debug({ result: data }); // ObjectExpression
log.warn(ctx.response);              // MemberExpression

logger.debug(["payload",payload]);

//Valid
logger.info(`User ID: ${user.id}`);  // Log specific fields
console.log('Body keys:', Object.keys(req.body)); // Safe inspection