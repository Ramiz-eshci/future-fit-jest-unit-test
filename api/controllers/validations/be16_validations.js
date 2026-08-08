const { Validator } = require('node-input-validator');

const validateBE16Array = async (data) => {
  const rules = {
      'products': 'required|array',
       'products.*.product_id': 'required',
    // 'products.*.productType': 'required|string',
    'products.*.revenueCost': 'required|string', 
    // 'products.*.userGroup': 'required|string', 
    // 'products.*.userGroupId': 'required|string',
    // 'products.*.relevance': 'required'
   
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

module.exports = { validateBE16Array };  
