const { Validator } = require('node-input-validator');

const validateBE03Array = async (data) => {
  const rules = {
     'sites': 'required|array',
   
    // 'sites.0.relevance': 'required|integer',        
    // 'sites.0.resourceType': 'required|integer' 
    // 'sites.*.comments': 'string'
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

module.exports = { validateBE03Array };
