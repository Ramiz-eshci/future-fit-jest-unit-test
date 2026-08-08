const { Validator } = require('node-input-validator');
  
const validateBE02Array = async (data) => {
  const rules = {
    'sites': 'required|array',
    'sites.*.siteName': 'required|string',
     'sites.*.siteId': 'required|string',
    'sites.*.location': 'required|string',  
    // 'sites.*.site_id': 'required|integer',       
    // 'sites.*.relevance': 'required', 
  //  'sites.*.relevance1': 'required', 
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

module.exports = { validateBE02Array };