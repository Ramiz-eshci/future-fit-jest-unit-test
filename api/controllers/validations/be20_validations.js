const { Validator } = require('node-input-validator');

const validateBE20Array = async (data) => {
  const rules = {
    'employee': 'required|array',
    'employee.*.employeeGroup': 'required|string',
    'employee.*.employeeGroupId': 'required|string', 
      'employee.*.employeeNO': 'required|string',
    'employee.*.fitnessInputs.*.relevance': 'required'
   
  };

  const v = new Validator(data, rules);

  const matched = await v.check();
  if (!matched) {
    return {
      success: false,
      errors: v.errors
    };
  }

  return {
    success: true,
    data: data.sites 
  };
};

module.exports = { validateBE20Array };
