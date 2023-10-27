// shared/utilities.ts


export class Utilities {
    static formatDateToMMDDYYYY(gDate: Date): string {
        const givenDate = new Date(gDate);
        const formattedDateTime = `${givenDate.toLocaleDateString()}`;
        return formattedDateTime;
    }
}