const LOGGER_NAMES = ['logger', 'log', 'console'];
const LOGGER_METHODS = ['log', 'info', 'debug', 'warn', 'error'];

function isLoggingCall(callee) {
  if (
    callee.type === 'MemberExpression' &&
    LOGGER_METHODS.includes(callee.property.name)
  ) {
    // this.logger.debug
    if (
      callee.object.type === 'MemberExpression' &&
      callee.object.object.type === 'ThisExpression' &&
      LOGGER_NAMES.includes(callee.object.property.name)
    ) {
      return true;
    }

    // logger.debug, log.info, console.warn
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
      description: 'Disallow logging with array patterns like [label, object]',
    },
    messages: {
      noArrayLogging: 'Avoid logging arrays like [label, object] — it may expose raw objects.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggingCall(node.callee)) return;

        for (const arg of node.arguments) {
          if (
            arg.type === 'ArrayExpression' &&
            arg.elements.length === 2 &&
            arg.elements[0].type === 'Literal' &&
            typeof arg.elements[0].value === 'string'
          ) {
            context.report({
              node: arg,
              messageId: 'noArrayLogging',
            });
          }
        }
      },
    };
  },
};
