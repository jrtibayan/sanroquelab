import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService} from 'flash-messages-angular';
import { SharedService } from '../../shared/shared.service';

import { Utilities } from '../../shared/utilities.functions';

@Component({
    selector: 'app-labresult',
    templateUrl: './labresult.component.html',
    styleUrls: ['./labresult.component.css']
})

export class LabresultComponent {

    constructor(
        private sharedService: SharedService,
        private authService: AuthService,
        private flashMessage: FlashMessagesService,
        private router: Router
    ) {}

    public utilities = Utilities;

    user: any;
    allPendingTests: any[] = [];
    selectedPatientId: number = null;
    pendingTests: any[] = [];
    incompleteTests: any[] = [];
    finalizedResults: any[] = [];
    selectedTests: any[] = [];

    showLabResultsList: boolean = true;
    showLabResultManager: boolean = false;

    showTestSelection:boolean = true;
    showDataInput:boolean = false;

    labTests: any[] = [];
    newResultToSubmit: any = {
        dateDone: '',
        patientId: '',
        patientName: '',
        patientAddress: '',
        patientAge: '',
        patientGender: '',
        medtech: '',
        pathologist: '',
        testsAndResults: []
    };

    ngOnInit(): void {
        this.authService.getProfile().subscribe({
            next: (res) => {
                let profile = {} as any;
                profile = res;
                this.user = profile.user;

                // gets result that have status "Ready"
                this.getFinalResult();

                // gets result that have status "Incomplete"
                this.getPendingResult();

                this.getLabtests();
            },
            error: (err) => {
                return false;
            }
        });
    }


    /**
     * Calls the authservice getLabTests() which retrives and stores the list of tests to this.test and packages to this.packages
     */
    getLabtests() {
        this.authService.getLabTests().subscribe({
            next: (res) => {
                let allTests = {} as any;
                allTests = res;
                this.labTests = allTests.tests;
            },
            error: (error) => {
                this.utilities.dlog('Error fetching lab tests and packages: ' + error, 'error');
            }
        });
    }


    userHasPermission(permission: string): boolean {
        if(!this.user) return false;
        if(!this.user.role) return false;
        if(this.user.role === 'admin') return true;
        if(!this.user.allowedActions) return false;
        if(this.user.allowedActions.includes(permission) === true) return true;
        else return false;
    }
    

    refreshList(pTest) {
        const selectedTest = this.pendingTests.find(test => test.isSelected === true);
        this.selectedPatientId = selectedTest ? selectedTest.patientId : null;

        this.getPendingResult();

        this.selectedTests = this.incompleteTests.filter((test) => test.isSelected === true);
        this.utilities.dlog('--------------------');
        this.utilities.dlog(this.selectedTests);

        for (const sTest of this.selectedTests) {
            const labTest = this.labTests.find((lTest) => lTest.testName === sTest.testName);
        
            if (labTest) {
                sTest.normalValue = (labTest.normalValue)? labTest.normalValue : 'no property';
            }
        }
    }

    /**
     * Calls the authservice getLabTransactions() which retrives and stores the list of transactions to this.transaction and packages to this.packages
     */
    getPendingResult() {
        this.authService.getPendingResult().subscribe({
            next: (res) => {
                let result = {} as any;
                result = res;
                this.incompleteTests = result.testResults || [];
                this.incompleteTests = result.testResults.map(({ _id, date_done, patient, medtech, pathologist, requesting_physician, test }) => {
                    return {
                      _id: _id,
                      dateDone: date_done,
                      patient: patient,
                      medtech: medtech,
                      pathologist: pathologist,
                      requestingPhysician: requesting_physician,
                      test: test
                    };
                  });
            },
            error: (error) => {
                this.utilities.dlog('Error fetching final lab results: ' + error, 'error');
            }
        });
    }

    fillInForm(ptest: any) {
        switch (ptest.test.type) {
            case 'Urinalysis':
                this.sharedService.setSharedData(ptest);
                this.router.navigate(['/forms/urinalysis']);
                break;
            case 'Hematology':
                this.sharedService.setSharedData(ptest);
                this.router.navigate(['/forms/hematology']);
                break;
            case 'Blood Chemistry':
                this.sharedService.setSharedData(ptest);
                this.router.navigate(['/forms/blood-chemistry']);
                break;
            // Add more cases for other test types
            // case 'AnotherTestType':
            //     this.router.navigate(['/another-route', ptest._id]);
            //     break;
            default:
                // Handle the default case or do nothing
                break;
        }
    }
    
    // Method to preview the PDF for a specific result
    previewResult(result: any): void {
        // Call the generatePdf method from the Utilities class
        console.log('Preview button clicked!', result);
        this.utilities.generateUrinalysisPdf(result);
    }

    getFinalResult() {
        this.authService.getFinalResult().subscribe({
            next: (res) => {
                let result = {} as any;
                result = res;
                console.log();
                console.log('httpresultRes');
                console.log(result);
                this.finalizedResults = result.testResults || [];

                this.finalizedResults = result.testResults.map(({ _id, date_done, patient, medtech, pathologist, requesting_physician, test }) => {
                    return {
                      _id: _id,
                      dateDone: date_done,
                      patient: patient,
                      medtech: medtech,
                      pathologist: pathologist,
                      requestingPhysician: requesting_physician,
                      test: test
                    };
                  });
            },
            error: (error) => {
                this.utilities.dlog('Error fetching final lab results: ' + error, 'error');
            }
        });
    }

    showLabResultManagerSection() {
        this.showLabResultsList = false;
        this.showLabResultManager = true;
        this.showTestSelection = true;
    }

    showTestSelectionSection() {
        //this.showDataInput = false;
        this.showTestSelection = true;
    }

    submitResult() {
        //this.showTestSelection = false;
        //this.showDataInput = true;
        this.utilities.dlog('allPendingTests');
        this.utilities.dlog(this.allPendingTests);
        this.utilities.dlog('selected tests');
        this.utilities.dlog(this.selectedTests);
        this.utilities.dlog('selected patient id');
        this.utilities.dlog(this.selectedPatientId);
        this.utilities.dlog('lab tests');
        this.utilities.dlog(this.labTests);
        const validationErrors = [];

        if (!this.userHasPermission('Add Result')) {
            validationErrors.push('User is not allowed to use this feature!');
        }

        // checks if there selected test
        if (this.selectedTests.length <= 0) {
            validationErrors.push('User must select at least 1 test!');
        }

        let falsyInInput = false;
        for (const test of this.selectedTests) {
            if(!test.resultValue) {
                falsyInInput = true;
            }
        }

        if(falsyInInput){
            validationErrors.push('Please fill out all values for the tests selected!');
        }


        if (validationErrors.length > 0) {
            // Display all validation errors to the user
            for (const error of validationErrors) {
                this.flashMessage.show(error, { cssClass: 'alert-danger', timeout: 3000 });
            }
        } else {
            // Everything is okay; proceed with the desired action
            // do what is needed here

            this.newResultToSubmit = {
                patientId: this.selectedTests[0].patientId,
                patientName: this.selectedTests[0].patientName,
                patientAddress: 'patient address',
                dateDone: this.utilities.formatDateToMMDDYYYY(this.selectedTests[0].dateDone),
                patientAge: this.selectedTests[0].patientAge,
                patientGender: this.selectedTests[0].patientGender,
                medtech: 'lab tech name',
                pathologist: 'patho name',
                testsAndResults: this.selectedTests
            };

            this.authService.addResult(this.newResultToSubmit).subscribe({
                next: (response) => {
                    // Handle any UI updates or notifications here
                    // after adding transaction i need to call this function to refresh the list displayed
                    // this reset text inside the input boxes
                    this.flashMessage.show('New Result Added!', { cssClass: 'alert-success', timeout: 3000 });
                    this.router.navigate(['/labresult/management/temp']).then(() => {
                        this.router.navigate(['/labresult/management']);
                    });
                },
                error: (error) => {
                    this.utilities.dlog('Error adding new transaction: ' + error, 'error');
                    this.flashMessage.show('Failed to add result!', {cssClass: 'alert-danger', timeout: 3000});
                    this.router.navigate(['/labresult/management']);
                    // Handle error notifications or other actions here
                }
            });
        }
    }

}
