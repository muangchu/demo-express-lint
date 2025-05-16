const LOGGER_NAMES = ['logger', 'log', 'console'];
const LOGGER_METHODS = ['log', 'info', 'debug', 'warn', 'error'];

function isLoggingCall(callee) {
  if (
    callee.type === 'MemberExpression' &&
    LOGGER_METHODS.includes(callee.property.name)
  ) {
    // this.logger.info
    if (
      callee.object.type === 'MemberExpression' &&
      callee.object.object.type === 'ThisExpression' &&
      LOGGER_NAMES.includes(callee.object.property.name)
    ) {
      return true;
    }

    // logger.info / log.debug / console.log
    if (
      callee.object.type === 'Identifier' &&
      LOGGER_NAMES.includes(callee.object.name)
    ) {
      return true;
    }
  }
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging raw objects directly',
    },
    messages: {
      noObjectLogging: 'Avoid logging raw objects directly. Use explicit property logging instead.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggingCall(node.callee)) return;

        for (const arg of node.arguments) {
          // Detect direct object literals or identifiers
          if (
            arg.type === 'ObjectExpression' || // logger.info({ key: value })
            arg.type === 'Identifier' ||       // logger.info(someObject)
            arg.type === 'MemberExpression'    // logger.info(req.body)
          ) {
            context.report({
              node: arg,
              messageId: 'noObjectLogging',
            });
          }
        }
      },
    };
  },
};
