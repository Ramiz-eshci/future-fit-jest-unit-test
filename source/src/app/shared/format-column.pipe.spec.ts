import { FormatColumnPipe } from './format-column.pipe';

describe('FormatColumnPipe', () => {
  let pipe: FormatColumnPipe;

  beforeEach(() => {
    pipe = new FormatColumnPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should replace underscores with spaces', () => {
    expect(pipe.transform('first_name')).toBe('First Name');
  });

  it('should capitalise the first letter of each word', () => {
    expect(pipe.transform('break_even_goals')).toBe('Break Even Goals');
  });

  it('should handle a single word with no underscores', () => {
    expect(pipe.transform('name')).toBe('Name');
  });

  it('should handle an already-clean title-style input', () => {
    expect(pipe.transform('Site Fitness')).toBe('Site Fitness');
  });

  it('should handle mixed casing in the source', () => {
    expect(pipe.transform('risk_owner')).toBe('Risk Owner');
  });

  it('should handle an empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should handle consecutive underscores', () => {
    expect(pipe.transform('a__b')).toBe('A  B');
  });

  it('should handle digits without crashing', () => {
    expect(pipe.transform('be01_form')).toBe('Be01 Form');
  });
});