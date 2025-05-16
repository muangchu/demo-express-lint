const SENSITIVE_KEYS = ['email', 'password', 'ssn', 'social', 'phone', 'address', 'dob', 'creditCard'];

function isSensitiveKey(name) {
  return name && SENSITIVE_KEYS.includes(name.toLowerCase());
}

// Recursive check for logger-like object (supports this.logger, logger, log, console)
function isLoggerObject(expr) {
  if (!expr) return false;

  if (expr.type === 'Identifier') {
    return ['logger', 'log', 'console'].includes(expr.name);
  }

  if (
    expr.type === 'MemberExpression' &&
    expr.object.type === 'ThisExpression' &&
    ['logger', 'log'].includes(expr.property.name)
  ) {
    return true;
  }

  return false;
}

function isLogger(node) {
  return (
    node &&
    node.type === 'MemberExpression' &&
    isLoggerObject(node.object) &&
    ['info', 'debug', 'log', 'warn', 'error'].includes(node.property.name)
  );
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging of PII (Personally Identifiable Information)',
    },
    messages: {
      piiDetected: 'Avoid logging sensitive data such as "{{ key }}".',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLogger(node.callee)) return;

        for (const arg of node.arguments) {
          // Object with sensitive keys: { email: req.body.email }
          if (arg.type === 'ObjectExpression') {
            for (const prop of arg.properties) {
              if (
                prop.key &&
                ((prop.key.type === 'Identifier' && isSensitiveKey(prop.key.name)) ||
                 (prop.key.type === 'Literal' && isSensitiveKey(String(prop.key.value)))
                )
              ) {
                context.report({
                  node: prop.key,
                  messageId: 'piiDetected',
                  data: { key: prop.key.name || prop.key.value },
                });
              }
            }
          }

          // Literal string: "User password: hidden"
          if (arg.type === 'Literal' && typeof arg.value === 'string') {
            for (const keyword of SENSITIVE_KEYS) {
              if (arg.value.toLowerCase().includes(keyword.toLowerCase())) {
                context.report({
                  node: arg,
                  messageId: 'piiDetected',
                  data: { key: keyword },
                });
                break;
              }
            }
          }

          // Member expression: req.body.email, user.phone
          if (
            arg.type === 'MemberExpression' &&
            arg.property.type === 'Identifier' &&
            isSensitiveKey(arg.property.name)
          ) {
            context.report({
              node: arg.property,
              messageId: 'piiDetected',
              data: { key: arg.property.name },
            });
          }

          // Template literal: `User phone: ${user.phone}`
          if (arg.type === 'TemplateLiteral') {
            for (const expr of arg.expressions) {
              if (
                expr.type === 'MemberExpression' &&
                expr.property.type === 'Identifier' &&
                isSensitiveKey(expr.property.name)
              ) {
                context.report({
                  node: expr.property,
                  messageId: 'piiDetected',
                  data: { key: expr.property.name },
                });
              }
            }

            for (const quasi of arg.quasis) {
              for (const keyword of SENSITIVE_KEYS) {
                if (quasi.value.raw.toLowerCase().includes(keyword.toLowerCase())) {
                  context.report({
                    node: quasi,
                    messageId: 'piiDetected',
                    data: { key: keyword },
                  });
                  break;
                }
              }
            }
          }
        }
      },
    };
  },
};
