// eslint-rules/no-pii-logging.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging of potential PII or credentials',
    },
    schema: [
      {
        type: 'object',
        properties: {
          logObjects: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
    messages: {
      piiLogging: 'Avoid logging potential PII or credentials: "{{ identifier }}"',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const piiFields = ['email', 'password', 'ssn', 'dob', 'phone', 'address', 'name', 'user'];
    const logObjects = options.logObjects || ['console', 'logger', 'logService'];

    function checkPII(node, reportNode) {
      if (!node) return;

      if (node.type === 'MemberExpression') {
        const prop = node.property;
        const name = prop.name || prop.value;
        if (piiFields.includes(name)) {
          context.report({
            node: reportNode || prop,
            messageId: 'piiLogging',
            data: { identifier: name },
            fix: fixer => fixer.replaceText(reportNode || node, "'[REDACTED]'"),
          });
        }
        checkPII(node.object, reportNode);
      }

      if (node.type === 'Literal' && typeof node.value === 'string') {
        for (const field of piiFields) {
          if (node.value.includes(field)) {
            context.report({
              node: reportNode || node,
              messageId: 'piiLogging',
              data: { identifier: field },
              fix: fixer => fixer.replaceText(reportNode || node, "'[REDACTED]'"),
            });
          }
        }
      }
    }

    return {
      CallExpression(node) {
        const callee = node.callee;

        const isLoggingCall =
          callee.type === 'MemberExpression' &&
          logObjects.includes(callee.object.name || '') &&
          ['log', 'info', 'warn', 'error', 'debug', 'trace'].includes(callee.property.name);

        if (!isLoggingCall) return;

        for (const arg of node.arguments) {
          if (arg.type === 'MemberExpression') {
            checkPII(arg, arg);
          }

          if (arg.type === 'CallExpression') {
            const callee = arg.callee;
            if (
              callee.type === 'MemberExpression' &&
              callee.object.name === 'JSON' &&
              callee.property.name === 'stringify'
            ) {
              checkPII(arg.arguments[0], arg);
            }
          }

          if (arg.type === 'TemplateLiteral') {
            for (const expr of arg.expressions) {
              checkPII(expr, expr);
            }
          }

          if (arg.type === 'Literal') {
            checkPII(arg, arg);
          }
        }
      },
    };
  },
}
