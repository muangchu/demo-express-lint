const LOGGER_NAMES = ['logger', 'log', 'console'];
const LOGGER_METHODS = ['log', 'info', 'debug', 'warn', 'error'];
const SENSITIVE_OBJECTS = ['appMeta','meta', 'payload', 'header', 'token'];

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
      description: 'Disallow logging of sensitive objects like meta, payload, header, token',
    },
    messages: {
      sensitiveLog: 'Avoid logging sensitive object "{{ name }}".',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggingCall(node.callee)) return;

        for (const arg of node.arguments) {
          // Direct identifier
          if (arg.type === 'Identifier' && SENSITIVE_OBJECTS.includes(arg.name)) {
            context.report({
              node: arg,
              messageId: 'sensitiveLog',
              data: { name: arg.name },
            });
          }

          // Object wrapper like { payload }
          if (arg.type === 'ObjectExpression') {
            for (const prop of arg.properties) {
              const keyName =
                prop.key.type === 'Identifier' ? prop.key.name :
                prop.key.type === 'Literal' ? prop.key.value :
                null;

              if (typeof keyName === 'string' && SENSITIVE_OBJECTS.includes(keyName)) {
                context.report({
                  node: prop.key,
                  messageId: 'sensitiveLog',
                  data: { name: keyName },
                });
              }
            }
          }
        }
      },
    };
  },
};
