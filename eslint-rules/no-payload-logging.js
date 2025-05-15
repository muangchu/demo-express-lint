// eslint-rules/no-payload-logging.js
module.exports = {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow logging full payloads like req.body or res.body',
      },
      fixable: null,
      messages: {
        noPayloadLog: 'Avoid logging full payloads like "{{ name }}" as it may expose sensitive data.',
      },
      schema: [
        {
          type: 'object',
          properties: {
            logObjects: {
              type: 'array',
              items: { type: 'string' },
              default: ['console', 'logger', 'logService'],
            },
            sensitiveProps: {
              type: 'array',
              items: { type: 'string' },
              default: ['body', 'headers', 'rawHeaders', 'query', 'params'],
            },
          },
          additionalProperties: false,
        },
      ],
    },
  
    create(context) {
      const options = context.options[0] || {};
      const logObjects = options.logObjects || ['console', 'logger', 'logService'];
      const sensitiveProps = options.sensitiveProps || ['body', 'headers', 'rawHeaders', 'query', 'params'];
  
      function isSensitiveMember(member) {
        return member.type === 'MemberExpression' &&
          member.property &&
          sensitiveProps.includes(member.property.name);
      }
  
      return {
        CallExpression(node) {
          const callee = node.callee;
  
          const isLogCall =
            callee.type === 'MemberExpression' &&
            logObjects.includes(callee.object.name) &&
            ['log', 'info', 'warn', 'error', 'debug', 'trace'].includes(callee.property.name);
  
          if (!isLogCall) return;
  
          for (const arg of node.arguments) {
            if (arg.type === 'MemberExpression' && isSensitiveMember(arg)) {
              context.report({
                node: arg,
                messageId: 'noPayloadLog',
                data: { name: `${arg.object.name}.${arg.property.name}` },
              });
            }
          }
        },
      };
    },
  };
  