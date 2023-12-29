// shared/utilities.ts
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Alignment, Content, ContentImage, Margins, PageSize, StyleReference } from "pdfmake/interfaces";
pdfMake.vfs = pdfFonts.pdfMake.vfs;


export class Utilities {
    static formatDateToMMDDYYYY(gDate: Date): string {
        const givenDate = new Date(gDate);
        const formattedDateTime = `${givenDate.toLocaleDateString()}`;
        return formattedDateTime;
    }

    static formatDateForInput(date: Date): string {
      // Helper function to format a date as 'YYYY-MM-DD'
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2); // Month is zero-based
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
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

      static generateUrinalysisPdf(result: any): void {

      let pdfContent = [
        {
          table: {
              widths: [37, '*', 25, 80],
              body: [
                  [
                    {text: 'Name', alignment: 'center', fontSize: 10},
                    {text: result.patient.name, alignment: 'left'},
                    {text: 'Date', alignment: 'center', fontSize: 10},
                    {text: this.formatDateToMMDDYYYY(result.dateDone), alignment: 'center'},
                  ]
              ],
          },
        },
        {
          table: {
              widths: [37, '*', 35, 40, 25, 80],
              body: [
                  [
                    {text: 'Address', alignment: 'center',border: [true, false, true, true], fontSize: 10},
                    {text: result.patient.address, alignment: 'left',border: [true, false, true, true]},
                    {text: 'Gender', alignment: 'center',border: [true, false, true, true], fontSize: 10},
                    {text: result.patient.gender, alignment: 'center',border: [true, false, true, true]},
                    {text: 'Age', alignment: 'center',border: [true, false, true, true], fontSize: 10},
                    {text: result.patient.age, alignment: 'center',border: [true, false, true, true]},
                  ]
              ],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [
                  [
                    {
                      text: result.test.type,
                      alignment: 'center',
                      border: [false, false, false, false],
                      fontSize: 20,
                      bold: true
                    }
                  ]
              ],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
      ];


      if(result.test.type === 'Urinalysis' || result.test.type === 'Fecalysis' || result.test.type === 'Serology') {
        pdfContent.push({
          table: {
              widths: ['30%', '70%'],
              body: [
                  [{text: 'Test', alignment: 'center'}, {text:'Result', alignment: 'center'}],
                  ...result.test.parameters.map((parameter: any) => [{text: parameter.name, alignment: 'left'}, {text: parameter.value, alignment: 'center'}]),
              ],
          },
        });
      }else {
        pdfContent.push({
          table: {
              widths: ['18%', '57%', '25%'],
              body: [
                  [{text: 'Test', alignment: 'center'}, {text:'Result', alignment: 'center'}, {text:'Normal', alignment: 'center'}],
                  ...result.test.parameters.map((parameter: any) => [{text: parameter.name, alignment: 'left'}, {text: parameter.value, alignment: 'center'}, {text: parameter.normal, alignment: 'center'}]),
              ],
          },
        });
      }


      pdfContent = pdfContent.concat([
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*'],
              body: [''],
          },
        },
        {
          table: {
              widths: ['*', '*', '*'],
              body: [
                  [
                    { text: result.requestingPhysician.name, alignment: 'center', fontSize: 10 },
                    { text: result.medtech.name, alignment: 'center', fontSize: 10 },
                    { text: result.pathologist.name, alignment: 'center', fontSize: 10 },
                  ],
                  [
                    { text: 'License No: '+result.requestingPhysician.license, alignment: 'center', fontSize: 10 },
                    { text: 'License No: '+result.medtech.license, alignment: 'center', fontSize: 10 },
                    { text: 'License No: '+result.pathologist.license, alignment: 'center', fontSize: 10 }
                  ],
                  [
                      { text: 'Requesting Physician', alignment: 'center', fontSize: 10 },
                      { text: 'Medical Technologist', alignment: 'center', fontSize: 10 },
                      { text: 'Pathologist', alignment: 'center', fontSize: 10 },
                  ],
              ],
          },
        }
      ]);





        let docDefinition = {
          pageSize: 'letter' as PageSize,
          pageMargins: [72, 112, 72, 48] as Margins,
          header: {
            stack: [
              {
                text: '\nSAN ROQUE MULTISPECIALTY CLINIC\nAND DIAGNOSTIC CENTER',
                alignment: 'center' as Alignment,
                fontSize: 20,
                bold: true
              },
              {
                text: 'LDMC BLDG., ILUSTRE AVENUE, LEMERY, BATANGAS\nTEL. NO: 043-341-6534',
                alignment: 'center' as Alignment,
                fontSize: 8,
                bold: true
              }
            ]

          },
          content: pdfContent as Content
        };

        pdfMake.createPdf(docDefinition).open();
      }


}
