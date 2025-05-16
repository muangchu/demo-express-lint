const LOGGER_NAMES = ['logger', 'log', 'console'];
const LOGGER_METHODS = ['log', 'info', 'debug', 'warn', 'error'];
const RESPONSE_IDENTIFIERS = ['res', 'response'];
const RESPONSE_PROPERTY_NAMES = ['response'];

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

function containsResponseReference(node) {
  if (!node) return false;

  // Identifier like: res, response
  if (node.type === 'Identifier') {
    return RESPONSE_IDENTIFIERS.includes(node.name);
  }

  // MemberExpression like: ctx.response, res.body
  if (node.type === 'MemberExpression') {
    if (
      node.property &&
      node.property.type === 'Identifier' &&
      RESPONSE_PROPERTY_NAMES.includes(node.property.name)
    ) {
      return true;
    }
    return (
      containsResponseReference(node.object) || containsResponseReference(node.property)
    );
  }

  // ObjectExpression: logger.info({ result: res })
  if (node.type === 'ObjectExpression') {
    return node.properties.some((prop) => containsResponseReference(prop.value));
  }

  // TemplateLiteral: `Response: ${res}`
  if (node.type === 'TemplateLiteral') {
    return node.expressions.some(containsResponseReference);
  }

  // CallExpression: JSON.stringify(res)
  if (node.type === 'CallExpression') {
    return node.arguments.some(containsResponseReference);
  }

  // ArrayExpression, etc.
  if (node.type === 'ArrayExpression') {
    return node.elements.some(containsResponseReference);
  }

  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging of HTTP response objects and their values',
    },
    messages: {
      noResponseLogging: 'Avoid logging HTTP response object "{{ name }}".',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggingCall(node.callee)) return;

        for (const arg of node.arguments) {
          if (containsResponseReference(arg)) {
            context.report({
              node: arg,
              messageId: 'noResponseLogging',
              data: {
                name: context.getSourceCode().getText(arg),
              },
            });
          }
        }
      },
    };
  },
};
