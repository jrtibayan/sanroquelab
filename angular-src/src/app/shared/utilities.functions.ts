// shared/utilities.ts
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Alignment, Content, Margins, PageSize, TDocumentDefinitions } from "pdfmake/interfaces";


export class Utilities {


    public static getBase64ImageFromURL(url) {
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.setAttribute("crossOrigin", "anonymous");

            img.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var dataURL = canvas.toDataURL("image/png");

                resolve(dataURL);
            };

            img.onerror = error => {
                reject(error);
            };

            img.src = url;
        });
    }

    static formatDateToLongDate(gDate: Date): string {
        const givenDate = new Date(gDate);
        const formattedDate = givenDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        return formattedDate; // Sample Output: March 11, 1985
    }


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


    public static async generateUrinalysisPdf(result: any): Promise<void> {
        function shorterAge(inputString: string): string {
            // Split the input string into words
            const words = inputString.split(' ');

            // Check if any of the words are '0yo', '0mo', or '0d' and remove them
            const invalidWords = ['0yr', '0yo', '0mo', '0d'];
            const filteredWords = words.filter(word => !invalidWords.includes(word.toLowerCase()));

            // If there are still 3 words, remove the 3rd word
            if (filteredWords.length === 3) {
                filteredWords.pop();
            }

            // Return the modified string
            return filteredWords.join(' ');
        }

        try {
            // Dynamically import only when needed
            const pdfMake = (await import('pdfmake/build/pdfmake')).default;
            const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;

            // Set vfs
            pdfMake.vfs = pdfFonts.pdfMake.vfs;

            // Use the local image file
            const logoDataUrl = await this.getBase64ImageFromURL('assets/images/LDMC-logo.png');
            const signPathologistUrl = await this.getBase64ImageFromURL('assets/images/sign-pathologist.png');

            // Check if the image is loaded successfully
            if (logoDataUrl) {
                console.log('Logo loaded successfully');
            } else {
                console.error('Error loading logo data.');
            }

            let pdfContent = [
                {
                    table: {
                        widths: [37, '*', 25, 80],
                        body: [[
                            {text: 'Name', alignment: 'center', fontSize: 10},
                            {text: result.patient.name, alignment: 'left'},
                            {text: 'Date', alignment: 'center', fontSize: 10},
                            {text: this.formatDateToMMDDYYYY(result.dateDone), alignment: 'center'},
                        ]],
                    },
                },{
                    table: {
                        widths: [37, '*', 35, 40, 25, 80],
                        body: [[
                            {text: 'Address', alignment: 'center',border: [true, false, true, true], fontSize: 10},
                            {text: result.patient.address, alignment: 'left',border: [true, false, true, true]},
                            {text: 'Gender', alignment: 'center',border: [true, false, true, true], fontSize: 10},
                            {text: result.patient.gender, alignment: 'center',border: [true, false, true, true]},
                            {text: 'Age', alignment: 'center',border: [true, false, true, true], fontSize: 10},
                            {text: shorterAge(result.patient.age), alignment: 'center',border: [true, false, true, true]},
                        ]],
                    },
                },{
                    table: {
                        widths: ['*'],
                        body: [''],
                    },
                },{
                    table: {
                        widths: ['*'],
                        body: [''],
                    },
                },{
                    table: {
                        widths: ['*'],
                        body: [''],
                    },
                },{
                    table: {
                        widths: ['*'],
                        body: [[
                            {
                                text: result.test.type,
                                alignment: 'center',
                                border: [false, false, false, false],
                                fontSize: 20,
                                bold: true
                            }
                        ]],
                    },
                },{
                    table: {
                        widths: ['*'],
                        body: [''],
                    },
                },{
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
                            [
                                {text: 'Test', alignment: 'center'},
                                {text:'Result', alignment: 'center'}
                            ],
                            ...result.test.parameters.map((parameter: any) => [
                                {text: parameter.name, alignment: 'left'},
                                {text: parameter.value, alignment: 'center'}
                            ]),
                        ],
                    },
                });
            }else {
                pdfContent.push({
                    table: {
                        widths: ['18%', '57%', '25%'],
                        body: [
                            [
                                {text: 'Test', alignment: 'center'},
                                {text:'Result', alignment: 'center'},
                                {text:'Normal', alignment: 'center'}
                            ],
                            ...result.test.parameters.map((parameter: any) => [
                                {text: parameter.name, alignment: 'left'},
                                {text: parameter.value, alignment: 'center'},
                                {text: parameter.normal, alignment: 'center'}
                            ]),
                        ],
                    },
                });
            }


            pdfContent = pdfContent.concat([
                {
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                { text: ' ', alignment: 'center', border: [false, false, false, false] },
                                { text: ' ', alignment: 'center', border: [false, false, false, false], fontSize: 10 },
                                { image: signPathologistUrl, width: 80, height: 80, alignment: 'center', margin: [0, 10, 0, -50], border: [false, false, false, false] } as any,
                            ],
                        ],
                    },
                },{
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                { text: result.requestingPhysician.name, alignment: 'center', fontSize: 10 },
                                { text: result.medtech.name, alignment: 'center', fontSize: 10 },
                                { text: result.pathologist.name, alignment: 'center', fontSize: 10 },
                            ],[
                                { text: 'License No: '+result.requestingPhysician.license, alignment: 'center', fontSize: 10 },
                                { text: 'License No: '+result.medtech.license, alignment: 'center', fontSize: 10 },
                                { text: 'License No: '+result.pathologist.license, alignment: 'center', fontSize: 10 }
                            ],[
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
                            columns: [
                                {
                                    image: logoDataUrl,
                                    width: 60,
                                    height: 60,
                                    alignment: 'left',
                                    margin: [100, 25, 0, 0] // Adjust the margin as needed
                                },{
                                    stack: [
                                        {
                                            text: '\nSAN ROQUE MULTISPECIALTY CLINIC\nAND DIAGNOSTIC CENTER',
                                            alignment: 'center' as Alignment,
                                            fontSize: 20,
                                            bold: true
                                        },{
                                            text: 'LDMC BLDG., ILUSTRE AVENUE, LEMERY, BATANGAS\nTEL. NO: 043-341-6534',
                                            alignment: 'center' as Alignment,
                                            fontSize: 8,
                                            bold: true
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                content: pdfContent as Content
            } as TDocumentDefinitions;


            //pdfMake.createPdf(docDefinition).open(); // open in new window
            pdfMake.createPdf(docDefinition).open({}, window); // open in own window
        } catch (error) {
            console.error('Error fetching logo data:', error);
        }
    }
}
