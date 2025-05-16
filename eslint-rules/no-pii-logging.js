// eslint/rules/no-pii-logging.js

const SENSITIVE_KEYS = ['email', 'password', 'ssn', 'social', 'phone', 'address', 'dob', 'creditCard'];

function isSensitiveKey(name) {
  return name && SENSITIVE_KEYS.includes(name.toLowerCase());
}

function isLogger(node) {
  return (
    node &&
    node.type === 'MemberExpression' &&
    (
      // this.logger.info
      (node.object.type === 'ThisExpression' && node.property.name === 'logger') ||
      // logger.info, log.debug, console.warn, etc.
      (['logger', 'log', 'console'].includes(node.object.name))
    ) &&
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
          // Case 1: { email: req.body.email }
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

          // Case 2: "User password: hidden"
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

          // Case 3: req.body.email, user.phone
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

          // Case 4: Template literals: `User phone: ${user.phone}`
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
