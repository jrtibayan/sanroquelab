import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService} from 'flash-messages-angular';

import { Utilities } from '../../shared/utilities.functions';

@Component({
    selector: 'app-labresult',
    templateUrl: './labresult.component.html',
    styleUrls: ['./labresult.component.css']
})

export class LabresultComponent {

    constructor(
        private authService: AuthService,
        private flashMessage: FlashMessagesService,
        private router: Router
    ) {}

    public utilities = Utilities;

    user: any;
    allPendingTests: any[] = [];
    selectedPatientId: number = null;
    pendingTests: any[] = [];
    visiblePendingTests: any[] = [];
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

                this.getPendingTests();

                this.getLabtests();

                this.getFinalizedResults();
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
                console.log('Error fetching lab tests and packages:', error);
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

        this.getPendingTests();

        this.selectedTests = this.visiblePendingTests.filter((test) => test.isSelected === true);
        console.log("--------------------");
        console.log(this.selectedTests);

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
    getPendingTests() {
        this.authService.getPendingTests().subscribe({
            next: (res) => {
                let allPendingTests = {} as any;
                allPendingTests = res;
                this.allPendingTests = allPendingTests.tests;

                // will add to pendingTests only those that are not yet added
                // will add properties that will be used by the component which are the ones below
                // isHidden - to filter which items to be hidden
                // isSelected - to filter which tests needs input for result
                // resultValue - to contain the result value needed for the printed lab report
                if(this.pendingTests.length > 0) {
                    let objectsToAdd = this.allPendingTests.filter(test => {
                        return !this.pendingTests.some(pendingTest => pendingTest._id === test._id);
                    });
                    objectsToAdd = objectsToAdd.map(test => {
                        return { ...test, isSelected: false, isHidden: false, resultValue: '' };
                    });
                    this.pendingTests.push(...objectsToAdd);
                } else {
                    this.pendingTests = [...this.allPendingTests];
                    this.pendingTests = this.pendingTests.map(test => {
                        return { ...test, isSelected: false, isHidden: false, resultValue: '' };
                    });
                }

                // update hidden properties depending on Selected Patient ID
                this.pendingTests.forEach((test) => {
                    if (this.selectedPatientId === null) {
                        test.isHidden = false;
                    } else if (test.patientId !== this.selectedPatientId) {
                        test.isHidden = true;
                    } else {
                        test.isHidden = false;
                    }
                });

                // filters to only get patient that are not hidden
                this.visiblePendingTests = this.pendingTests.filter(test => !test.isHidden);
            },
            error: (error) => {
                console.log('Error fetching lab transactions and packages:', error);
            }
        });
    }

    getFinalizedResults() {

        this.finalizedResults = [];
        /*
        this.authService.getFinalizedResults().subscribe({
            next: (res) => {
                //let allTransactions = {} as any;
                //allTransactions = res;

                //this.finalizedResults = allTransactions.transactions;
                this.finalizedResults = []; //put
            },
            error: (error) => {
                console.log('Error fetching lab transactions and packages:', error);
            }
        });
        */
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
        console.log('allPendingTests');
        console.log(this.allPendingTests);
        console.log('selected tests');
        console.log(this.selectedTests);
        console.log('selected patient id');
        console.log(this.selectedPatientId);
        console.log('lab tests');
        console.log(this.labTests);
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
                    console.error('Error adding new transaction:', error);
                    this.flashMessage.show('Failed to add result!', {cssClass: 'alert-danger', timeout: 3000});
                    this.router.navigate(['/labresult/management']);
                    // Handle error notifications or other actions here
                }
            });
        }
    }

}
