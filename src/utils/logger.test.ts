import { COLOR_FORMAT, Logger } from './logger';

describe('logger', () => {
  process.env.LOG_LEVEL = 'debug';
  const consoleSpy = jest.spyOn(console, 'log');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should print text in blue color when calling info()', () => {
    Logger.info('test');
    expect(consoleSpy).toHaveBeenCalledWith(COLOR_FORMAT.TextBlue, 'test');
  });

  it('should print text in green color when calling success()', () => {
    Logger.success('test');
    expect(consoleSpy).toHaveBeenCalledWith(COLOR_FORMAT.TextGreen, 'test');
  });

  it('should print text in yellow color when calling warn()', () => {
    Logger.warn('test');
    expect(consoleSpy).toHaveBeenCalledWith(COLOR_FORMAT.TextYellow, 'test');
  });

  it('should not print if shouldPrint() returns false', () => {
    Logger.shouldPrint = jest.fn().mockReturnValue(false);
    Logger.print(COLOR_FORMAT.TextBlue, 'test');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should print if shouldPrint() returns true', () => {
    Logger.shouldPrint = jest.fn().mockReturnValue(true);
    Logger.print(COLOR_FORMAT.TextBlue, 'test');
    expect(consoleSpy).toHaveBeenCalledWith(COLOR_FORMAT.TextBlue, 'test');
  });
  it('should print text as string if it is a string', () => {
    Logger.shouldPrint = jest.fn().mockReturnValue(true);
    Logger.print(COLOR_FORMAT.TextBlue, 'test');
    expect(consoleSpy).toHaveBeenCalledWith(COLOR_FORMAT.TextBlue, 'test');
  });

  it('should print error message and stack trace when calling exception()', () => {
    const error = new Error('Test Error');
    error.stack = 'Test Stack Trace';
    Logger.exception(error);
    expect(consoleSpy).toHaveBeenCalledWith(COLOR_FORMAT.TextRed, `Error message: ${error.message}`);
    expect(consoleSpy).toHaveBeenCalledWith(COLOR_FORMAT.TextRed, error.stack);
  });
});
