// shared/utilities.ts


export class Utilities {
    static formatDateToMMDDYYYY(gDate: Date): string {
        const givenDate = new Date(gDate);
        const formattedDateTime = `${givenDate.toLocaleDateString()}`;
        return formattedDateTime;
    }

    static dlog(msg: any, logType: 'log' | 'warn' | 'error' | 'debug' = 'log'): void {
        switch (logType) {
          case 'log':
            console.log(msg);
            break;
          case 'warn':
            console.warn(msg);
            break;
          case 'error':
            console.error(msg);
            break;
          case 'debug':
            // Note: console.debug might not be available in all browsers
            console.debug(msg);
            break;
          default:
            console.log(msg);
        }
      }
}