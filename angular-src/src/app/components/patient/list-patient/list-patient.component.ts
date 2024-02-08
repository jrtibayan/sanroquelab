import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService} from 'flash-messages-angular';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';
import { Utilities } from '../../../shared/utilities.functions';

@Component({
    selector: 'app-list-patient',
    templateUrl: './list-patient.component.html',
    styleUrls: ['./list-patient.component.css']
})
export class ListPatientComponent {
    public utilities = Utilities;
    user: any;

    patientsToDisplay: any[] = [];
    patientsFromDb: any[] = [];
    editingIndex: number | null = null;
    filterString: string = '';
    maxPageNumber: number = null;
    selectedPatientIndex: number = -1;
    resultsOfSelectedPatient: any[] = [];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private flashMessage: FlashMessagesService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.authService.getProfile().subscribe({
            next: (res) => {
                let profile = {} as any;
                profile = res;
                this.user = profile.user;

                // fetch all patients
                this.getPatientByName(this.filterString, 1);
            },
            error: (err) => {
                return false;
            }
        });
    }
    currentPage: number = 1;

    getPageNumbers(): number[] {
        const totalPages = this.maxPageNumber;
        const maxPagesToShow = 7;
        const pages: number[] = [];

        // Calculate the starting page based on the current page
        let startPage = Math.max(1, this.currentPage - 3);

        // Calculate the ending page based on the starting page and maxPagesToShow
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust the starting page if the ending page reaches the maximum
        startPage = Math.max(1, endPage - maxPagesToShow + 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    }

    //currentPage: number = 1;
    getPatientsOnPage(pageNumber: number) {
        this.currentPage = pageNumber;
        // Make another API call or filter the patients based on the current page
        this.getPatientByName(this.filterString, pageNumber);
        this.selectedPatientIndex = -1;
    }

    getPatientByName(filterString, page=0) {
        this.authService.getAllActivePatientsByName(filterString, 20, page).subscribe({
            next: (response) => {
                let allRes = {} as any;
                allRes = response;

                this.patientsFromDb = allRes.patients;
                this.maxPageNumber = allRes.maxPage;
            },
            error: (error) => {
                this.utilities.dlog('Error adding getting patient by name: ' + error, 'error');
            }
        });
    }

    toggleDropdown(index: number): void {
        // Clicking Result will trigger function that will get testresults of that patient and display on dropdownbox
        this.selectedPatientIndex = this.selectedPatientIndex === index ? -1 : index;
        this.getTestResultByPatientId(this.patientsFromDb[this.selectedPatientIndex]._id);
    }

    previewResult(event: any): void {
        // Get the selected value from the <select> element
        const selectedValue = event.target.previousElementSibling.value;

        if (selectedValue !== 'Choose...') {
          // Find the selected result based on the selected value
          const selectedResult = this.resultsOfSelectedPatient.find(result => result._id === selectedValue);

          if (selectedResult) {
            this.utilities.generateUrinalysisPdf(selectedResult);
          }
        }
    }

    alertFunction(result: any): void {
        // Use your utilities function to format the result and display in an alert
        const formattedResult = this.utilities.formatDateToLongDate(result.date_done) + ' ' + result.test.type;
        alert(formattedResult);
    }

    getTestResultByPatientId(patientId) {
        this.authService.getFinalResultById(patientId).subscribe({
            next: (response) => {
                let allRes = {} as any;
                allRes = response;
                this.resultsOfSelectedPatient = allRes.testresults || [];

                this.resultsOfSelectedPatient = this.resultsOfSelectedPatient.map(({ _id, date_done, patient, medtech, pathologist, requesting_physician, test }) => {
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
                this.utilities.dlog('Error adding getting patient by name: ' + error, 'error');
            }
        });
    }

    handleDropdownChange(event: any): void {
        // Handle dropdown change if needed
        // console.log('Dropdown selected:', event.target.value);
    }
}
