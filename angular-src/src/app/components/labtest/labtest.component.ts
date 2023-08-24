import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService} from 'flash-messages-angular';


@Component({
    selector: 'app-labtest',
    templateUrl: './labtest.component.html',
    styleUrls: ['./labtest.component.css']
})


export class LabtestComponent {
    isButtonDisabled: boolean;
    user: any;
    packages: any[] = [];
    tests: any[] = [];
    newTest: any = {};
    newPackage: any = {};
    newUpdates: any = {};
    editingIndex: number | null = null;
    editingPackageIndex: number | null = null;
    showAddTestRow: boolean = false;
    showAddPackageRow: boolean = false;
    allReagents: string[] = [
        'Reagent 1', 'Reagent 2', 'Reagent 3', 'Reagent 4', 'Reagent 5', 'Reagent 6',
        'Reagent 7', 'Reagent 8', 'Reagent 9', 'Reagent 10', 'Reagent 11', 'Reagent 12'
    ];
    completeTests: string[] = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5', 'Test 6',
        'Test 7', 'Test 8', 'Test 9', 'Test 10', 'Test 11', 'Test 12'
    ];


    constructor(
        private authService: AuthService,
        private flashMessage: FlashMessagesService,
        private router: Router
    ) { }


    /**
     * Checks if user is logged in, if user is, calls getLabtests() to retrieve the list of tests and reagents
     */
    ngOnInit(): void {
        this.authService.getProfile().subscribe({
            next: (res) => {
                let profile = {} as any;
                profile = res;
                this.user = profile.user;

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
                this.tests = allTests.tests;
                this.packages = allTests.packages;
            },
            error: (error) => {
                console.log('Error fetching lab tests and packages:', error);
            }
        });
    }


/*************************************************************************************************************************************
 * Managing Tests
 *************************************************************************************************************************************/
    showAddTestInputRow() {
        this.showAddTestRow = true;
        this.newTest = {};
    }


    cancelAddTest() {
        this.showAddTestRow = false;
        this.newTest = {};
    }


    /**
     * Calls the authservice insertNewTest() instead of using the authservice updateLabTests()
     * insertNewTest() actually inserts the test into the tests property array in the databse
     * you can check the addPackage() function used on this ts file to compare
     * that one doesnt really insert the package to the database.
     * After retrieving the data ang storing it on variable in the front end, then making changes on it including inserting or even editing,
     * all changes will be saved using the authservice updateLabTests()
     * 
     * PS: I can just use the updateLabTests() for add edit and delete of any data in the labtest collection
     * but used insertNewTest() here just to show and make it basis for when i make other management module
     * update will only work with this module because there only one record in the database and only want to update part of it
     * but on usual like user, you will need authservice for adding, editing and deleting
     */
    addTest() {
        if (this.userHasPermission('Add Test')) {
            if (this.newTest.testName && this.newTest.price && this.newTest.testType && this.newTest.maleNormalValue && this.newTest.femaleNormalValue) {
                this.authService.insertNewTest(this.newTest).subscribe({      
                    next: (response) => {
                        // Handle any UI updates or notifications here
                        this.getLabtests(); // after adding test i need to call this function to refresh the list displayed
                        this.newTest = {}; // this reset text inside the input boxes
                        this.showAddTestRow = false;
                        this.flashMessage.show('New Test Added!', { cssClass: 'alert-success', timeout: 3000 });
                        this.router.navigate(['/labtest/management']);
                    },
                    error: (error) => {
                        console.error('Error adding new test:', error);
                        this.flashMessage.show('Failed to add test!', {cssClass: 'alert-danger', timeout: 3000});
                        this.router.navigate(['labtest/management']);
                        // Handle error notifications or other actions here
                    }
                });
            }
        }
    }


    editTest(index: number) {
        this.editingIndex = index;
    }


    saveEditTest(index: number) {
        this.editingIndex = null;
        this.submitTestsToBackend('Test Edited!', 'Failed to edit test!', 'Edit Test');
        // alert(`Updated tests: ${JSON.stringify(this.tests)}`);
    }


    cancelEditTest() {
        this.editingIndex = null;
    }


    deleteTest(index: number) {
        const confirmed = window.confirm('Are you sure you want to delete this test?');
        if (confirmed) {
            this.tests[index].isDeleted = true;
            // this.tests.splice(index, 1);
            this.submitTestsToBackend('Test Deleted!',  'Failed to delete test!', 'Delete Test');
        }
    }


/*************************************************************************************************************************************
 * Managing Packages
 *************************************************************************************************************************************/
    showAddPackageInputRow() {
        this.newPackage = {
            packageName: '',
            price: '',
            reagents: [],
            testIncluded: [],
            isDeleted: false
        };
        this.showAddPackageRow = true;
    }


    cancelAddPackage() {
        this.showAddPackageRow = false;
        this.newPackage = {};
    }


    addPackage() {
        if (this.newPackage.packageName && this.newPackage.price) {
            this.packages.unshift({ ...this.newPackage });
            this.newPackage = {};
            this.submitTestsToBackend('Package Added!', 'Failed to add package!', 'Add Package');
            this.showAddPackageRow = false;
        }
    }


    editPackage(index: number) {
        this.editingPackageIndex = index;
    }


    cancelEditPackage() {
        this.editingPackageIndex = null;
    }


    saveEditPackage(index: number) {
        this.editingPackageIndex = null;
        this.submitTestsToBackend('Package Edited!', 'Failed to edit package!', 'Edit Package');
        // alert(`Updated packages: ${JSON.stringify(this.packages)}`);
    }


    deletePackage(index: number) {
        const confirmed = window.confirm('Are you sure you want to delete this package?');
        if (confirmed) {
            this.packages[index].isDeleted = true;        
            //this.packages.splice(index, 1);
            this.submitTestsToBackend('Package Deleted!', 'Failed to delete package!', 'Delete Package');
        }
    }


/*************************************************************************************************************************************
 * Misc
 *************************************************************************************************************************************/


    /**
     * toggles list of tests to be selected and unselected
     */
    toggleTest(tests: string[], test: string) {
        const index = tests.indexOf(test);
        if (index === -1) {
            tests.push(test);
        } else {
            tests.splice(index, 1);
        }
    }


    /**
     * toggles list of reagents to be selected and unselected
     */
    toggleReagent(reagents: string[], reagent: string) {
        const index = reagents.indexOf(reagent);
        if (index === -1) {
            reagents.push(reagent);
        } else {
            reagents.splice(index, 1);
        }
    }


    /**
     * allows logged in user that is either an admin or with permission
     */
    userHasPermission(permission: string): boolean {
        if(!this.user) return false;
        if(!this.user.role) return false;
        if(this.user.role === 'admin') return true;
        if(!this.user.allowedActions) return false;
        if(this.user.allowedActions.includes(permission) === true) return true;
        else return false;
    }


    /**
     * updates the tests and packages on the database
     * uses action to tell if the update is for inserting, updating and deleting tests or packages
     * labtests doesn't use the actual insert and delete since in deleleting we are just updating the tests isDeleted property and
     * on instead of inserting we update our tests and packages pushing the new test or package to the array of tests and packages
     */
    submitTestsToBackend(successMsg, failMsg, action) {
        if (this.tests.length > 0) {
            console.log('Submitting tests to backend:', this.tests);

            this.newUpdates.tests = this.tests;
            this.newUpdates.packages = this.packages;
            this.newUpdates.action = action;
            // alert(`Updated tests and packages: ${JSON.stringify(this.newUpdates)}`);

            this.authService.updateLabTests(this.newUpdates).subscribe(
                data => {
                    if ((data as any).success){
                        this.flashMessage.show(successMsg, { cssClass: 'alert-success', timeout: 3000 });
                        this.router.navigate(['/labtest/management']);
                    } else {
                        this.flashMessage.show(failMsg, {cssClass: 'alert-danger', timeout: 3000});
                        this.router.navigate(['labtest/management']);
                    }
                }
            );
        } else {
            this.flashMessage.show('No test to submit', {cssClass: 'alert-danger', timeout: 3000});
        }
    }
}


