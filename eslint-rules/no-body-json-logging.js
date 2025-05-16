export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow logging JSON.stringify(req.body)',
    },
    messages: {
      noJsonLogging: 'Avoid logging req.body via JSON.stringify (may expose sensitive data).',
    },
  },

  create(context) {
    function isLoggerCall(node) {
      const callee = node.callee;
      if (callee.type !== 'MemberExpression') return false;

      const method = callee.property?.name;
      if (!['debug', 'info', 'warn', 'error', 'log'].includes(method)) return false;

      if (callee.object.type === 'Identifier') {
        return ['log', 'logger', 'console'].includes(callee.object.name);
      }

      if (
        callee.object.type === 'MemberExpression' &&
        callee.object.object.type === 'ThisExpression' &&
        ['logger', 'log'].includes(callee.object.property.name)
      ) {
        return true;
      }

      return false;
    }

    function isJsonStringifyOnReqBody(node) {
      return (
        node?.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'JSON' &&
        node.callee.property.name === 'stringify' &&
        node.arguments.length === 1 &&
        node.arguments[0].type === 'MemberExpression' &&
        node.arguments[0].object.name === 'req' &&
        node.arguments[0].property.name === 'body'
      );
    }

    return {
      CallExpression(node) {
        if (!isLoggerCall(node)) return;

        for (const arg of node.arguments) {
          if (isJsonStringifyOnReqBody(arg)) {
            context.report({ node: arg, messageId: 'noJsonLogging' });
            continue;
          }

          if (arg.type === 'BinaryExpression') {
            if (isJsonStringifyOnReqBody(arg.left) || isJsonStringifyOnReqBody(arg.right)) {
              context.report({ node: arg, messageId: 'noJsonLogging' });
              continue;
            }
          }

          if (arg.type === 'TemplateLiteral') {
            for (const expr of arg.expressions) {
              if (isJsonStringifyOnReqBody(expr)) {
                context.report({ node: expr, messageId: 'noJsonLogging' });
                break;
              }
            }
          }
        }
      },
    };
  },
};
