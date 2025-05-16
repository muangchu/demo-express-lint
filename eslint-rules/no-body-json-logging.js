export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging of req.body via JSON.stringify',
    },
    messages: {
      noLoggingReqBody: 'Avoid logging `req.body` using JSON.stringify – may expose sensitive data.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const isLoggerCall =
          node.callee.type === 'MemberExpression' &&
          ['debug', 'info', 'log', 'warn'].includes(node.callee.property.name);

        if (!isLoggerCall) return;

        const args = node.arguments || [];

        for (const arg of args) {
          // Match: JSON.stringify(req.body)
          if (
            arg.type === 'CallExpression' &&
            arg.callee.type === 'MemberExpression' &&
            arg.callee.object.name === 'JSON' &&
            arg.callee.property.name === 'stringify' &&
            arg.arguments.length > 0 &&
            arg.arguments[0].type === 'MemberExpression' &&
            arg.arguments[0].object.name === 'req' &&
            arg.arguments[0].property.name === 'body'
          ) {
            context.report({
              node: arg,
              messageId: 'noLoggingReqBody',
            });
          }
        }
      },
    };
  },
};
