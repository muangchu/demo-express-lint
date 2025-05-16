// eslint/rules/no-body-json-logging.js

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging of req.body directly or via JSON.stringify',
    },
    messages: {
      noLoggingReqBody: 'Avoid logging `req.body` directly or via JSON.stringify – may expose sensitive data.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        // Match: any logger method like debug, info, warn, error
        if (
          node.callee.type === 'MemberExpression' &&
          ['debug', 'info', 'log', 'warn', 'error'].includes(node.callee.property.name)
        ) {
          const args = node.arguments || [];

          for (const arg of args) {
            // Match: this.logger.info(req.body) (direct logging)
            if (
              arg.type === 'MemberExpression' &&
              arg.object.name === 'req' &&
              arg.property.name === 'body'
            ) {
              context.report({
                node: arg,
                messageId: 'noLoggingReqBody',
              });
            }

            // Match: this.logger.info(JSON.stringify(req.body)) (stringified logging)
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
        }
      },
    };
  },
};
