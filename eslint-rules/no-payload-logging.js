const LOGGER_NAMES = ['logger', 'log', 'console'];
const LOGGER_METHODS = ['log', 'info', 'debug', 'warn', 'error'];
const PAYLOAD_PROPERTIES = ['body', 'params', 'query', 'headers'];

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

function containsPayloadReference(node) {
  if (!node) return false;

  // Direct member access: req.body, ctx.request.body
  if (node.type === 'MemberExpression') {
    if (
      node.property &&
      node.property.type === 'Identifier' &&
      PAYLOAD_PROPERTIES.includes(node.property.name)
    ) {
      return true;
    }
    return containsPayloadReference(node.object);
  }

  // Identifier (rare case): logger.info(body)
  if (node.type === 'Identifier') {
    return PAYLOAD_PROPERTIES.includes(node.name);
  }

  // ObjectExpression: logger.info({ data: req.body })
  if (node.type === 'ObjectExpression') {
    return node.properties.some((prop) => containsPayloadReference(prop.value));
  }

  // TemplateLiteral: `Payload: ${req.body}`
  if (node.type === 'TemplateLiteral') {
    return node.expressions.some(containsPayloadReference);
  }

  // CallExpression: JSON.stringify(req.body)
  if (node.type === 'CallExpression') {
    return node.arguments.some(containsPayloadReference);
  }

  // ArrayExpression: [req.body, other]
  if (node.type === 'ArrayExpression') {
    return node.elements.some(containsPayloadReference);
  }

  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging of request/response payloads',
    },
    messages: {
      noPayloadLogging: 'Avoid logging request or response payload "{{ payload }}".',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggingCall(node.callee)) return;

        for (const arg of node.arguments) {
          if (containsPayloadReference(arg)) {
            context.report({
              node: arg,
              messageId: 'noPayloadLogging',
              data: {
                payload: context.getSourceCode().getText(arg),
              },
            });
          }
        }
      },
    };
  },
};
