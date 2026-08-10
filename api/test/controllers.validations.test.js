const be01 = require('../controllers/validations/be01_validations');
const be02 = require('../controllers/validations/be02_validations');
const be03 = require('../controllers/validations/be03_validations');

describe('be-form validations', () => {
  describe('validateBE01Array', () => {
    it('should accept a valid sites array', async () => {
      const data = {
        sites: [
          {
            siteName: 'Plant A',
            siteId: 'A1',
            location: 'Karachi',
            fitnessInputs: [{ site_id: 1 }],
          },
        ],
      };
      const result = await be01.validateBE01Array(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data.sites);
    });

    it('should reject missing sites', async () => {
      const result = await be01.validateBE01Array({});
      expect(result.success).toBe(false);
      expect(result.errors).toBeTruthy();
    });

    it('should reject an invalid site name', async () => {
      const result = await be01.validateBE01Array({
        sites: [
          {
            siteName: '',
            siteId: 'A1',
            location: 'Karachi',
            fitnessInputs: [{ site_id: 1 }],
          },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('should reject when siteId is not a string', async () => {
      const result = await be01.validateBE01Array({
        sites: [{ siteName: 'P', siteId: 123, location: 'K', fitnessInputs: [{}] }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateBE02Array', () => {
    it('should accept a valid sites array', async () => {
      const data = {
        sites: [{ siteName: 'Plant A', siteId: 'A1', location: 'Karachi' }],
      };
      const result = await be02.validateBE02Array(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data.sites);
    });

    it('should reject when a site has no location', async () => {
      const result = await be02.validateBE02Array({
        sites: [{ siteName: 'Plant A', siteId: 'A1', location: '' }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateBE03Array', () => {
    it('should accept a valid sites array', async () => {
      const data = { sites: [{ relevance: 1 }] };
      const result = await be03.validateBE03Array(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data.sites);
    });

    it('should reject when sites is missing', async () => {
      const result = await be03.validateBE03Array({});
      expect(result.success).toBe(false);
    });
  });
});