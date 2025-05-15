module.exports = {
    meta: {
      type: "problem",
      docs: {
        description: "disallow logging of PII data",
        category: "Possible Security Vulnerability",
        recommended: true
      },
      messages: {
        avoidLoggingPII: "Avoid logging potential PII field '{{ field }}'."
      },
      schema: []
    },
    create(context) {
      const piiFields = ['email', 'ssn', 'password', 'dob', 'phone', 'address', 'creditCard'];
  
      return {
        CallExpression(node) {
          const isConsoleLog = node.callee.type === "MemberExpression" &&
                               node.callee.object.name === "console" &&
                               ['log', 'info', 'warn', 'error'].includes(node.callee.property.name);
          
          if (!isConsoleLog) return; 
          
          for (const arg of node.arguments) {
            if (arg.type === 'MemberExpression') {
              const prop = arg.property;
              const name = prop.name || (prop.value ?? '');

              if (piiFields.includes(name)) {
                context.report({
                  node: prop,
                  messageId: 'avoidLoggingPII',
                  data: { field: name },
                });
              }

            }
          }

        }
      };
    }
  };
  