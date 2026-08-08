const { Validator } = require('node-input-validator');

const validateBE01Array = async (data) => {
  const rules = {
    'sites': 'required|array',
    'sites.*.siteName': 'required|string',
    'sites.*.siteId': 'required|string',
    'sites.*.location': 'required|string',
    'sites.*.fitnessInputs.*site_id': 'required|integer',
    // 'sites.*.relevance': 'required', 
    // 'sites.*.renewableEnergyUsed': 'required|integer|min:0',
    // 'sites.*.totalEnergyUsed': 'required|integer|min:0',
    // 'sites.*.siteFitness': 'required|string',
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

module.exports = { validateBE01Array };
