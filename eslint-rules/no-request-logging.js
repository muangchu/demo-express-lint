const LOGGER_NAMES = ['logger', 'log', 'console'];
const LOGGER_METHODS = ['log', 'info', 'debug', 'warn', 'error'];
const REQUEST_IDENTIFIERS = ['req', 'request'];
const REQUEST_PROPERTY_NAMES = ['request', 'body', 'params', 'query', 'headers'];

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

function containsRequestReference(node) {
  if (!node) return false;

  // Identifier like: req, request
  if (node.type === 'Identifier') {
    return REQUEST_IDENTIFIERS.includes(node.name);
  }

  // MemberExpression like: req.body, ctx.request
  if (node.type === 'MemberExpression') {
    if (
      node.property &&
      node.property.type === 'Identifier' &&
      REQUEST_PROPERTY_NAMES.includes(node.property.name)
    ) {
      return true;
    }
    return (
      containsRequestReference(node.object) || containsRequestReference(node.property)
    );
  }

  // ObjectExpression: logger.info({ input: req })
  if (node.type === 'ObjectExpression') {
    return node.properties.some((prop) => containsRequestReference(prop.value));
  }

  // TemplateLiteral: `Request: ${req.body}`
  if (node.type === 'TemplateLiteral') {
    return node.expressions.some(containsRequestReference);
  }

  // CallExpression: JSON.stringify(req)
  if (node.type === 'CallExpression') {
    return node.arguments.some(containsRequestReference);
  }

  // ArrayExpression, etc.
  if (node.type === 'ArrayExpression') {
    return node.elements.some(containsRequestReference);
  }

  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging of HTTP request objects and their values',
    },
    messages: {
      noRequestLogging: 'Avoid logging HTTP request object "{{ name }}".',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggingCall(node.callee)) return;

        for (const arg of node.arguments) {
          if (containsRequestReference(arg)) {
            context.report({
              node: arg,
              messageId: 'noRequestLogging',
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
