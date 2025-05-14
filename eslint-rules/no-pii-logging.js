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
                               node.callee.property.name === "log";
  
          if (isConsoleLog) {
            node.arguments.forEach(arg => {
              if (arg.type === "MemberExpression") {
                const field = arg.property.name || (arg.property.value ?? "");
                if (piiFields.includes(field)) {
                  context.report({
                    node,
                    messageId: "avoidLoggingPII",
                    data: { field }
                  });
                }
              }
            });
          }
        }
      };
    }
  };
  