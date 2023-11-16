import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService} from 'flash-messages-angular';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';

import { Utilities } from '../../shared/utilities.functions';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})


export class TransactionComponent {
    public utilities = Utilities;

    user: any;
    newPaymentAmount: number = null;
    newPaymentReceiptNumber: number = null;
    idToUpdate: string = null;
    transactions: any[] = [];
    newTransaction: any = {};
    editingIndex: number | null = null;
    editingTransactionIndex: number | null = null;
    newUpdates: any = {};
    showTransactionListRow: boolean = true;
    showAddPaymentTransactionRow: boolean = false;
    showAddTransactionRow: boolean = false;
    showSelectPatientSection: boolean = false;
    showSelectPackageSection: boolean = false;
    showSelectDiscountSection: boolean = false;
    patientAge: any = {years: 0, months: 0, days: 0};
    age: string = this.patientAge.years + 'yo ' +  this.patientAge.months + 'mo ' + this.patientAge.days + 'd';
    gender: string = '';
    address: string = '';
    selectedDate = new FormControl();
    selectedTime = new FormControl();


    transactionForm: FormGroup;


    // Sample data array for testPackages
    testPackages: any[] = [
        { _id: '101', packageName: 'Package A', price: 50, isSelected: false },
        { _id: '102', packageName: 'Package B', price: 75, isSelected: false },
        { _id: '103', packageName: 'Package C', price: 100, isSelected: false },
    ];
    selectedPackages: any[] = [];

    patients: any[] = [];
    selectedPatient: any = null;
    patientName: string = '';


    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private flashMessage: FlashMessagesService,
        private router: Router
    ) {}


    onSubmit() {
        if (this.transactionForm.valid) {
        // Handle form submission here
        const formData = this.transactionForm.value;
        this.utilities.dlog(formData);

        // You can send the form data to your backend or perform any other action here
        } else {
        // Form is not valid, display error messages or take appropriate action
        }
    }

    showSelectedPatient() {
        this.showSelectPatientSection = true;
        this.showSelectPackageSection = false;
        this.showSelectDiscountSection = false;
    }



    showSelectPackages() {
        this.showSelectPatientSection = false;
        this.showSelectPackageSection = true;
        this.showSelectDiscountSection = false;
        // ... other logic
    }

    showSetDiscount() {
        this.showSelectPatientSection = false;
        this.showSelectPackageSection = false;
        this.showSelectDiscountSection = true;
        // ... other logic
    }


    /**
     * Checks if user is logged in, if user is, calls getLabtransactions() to retrieve the list of transactions and reagents
     */
    ngOnInit(): void {
        this.authService.getProfile().subscribe({
            next: (res) => {
                let profile = {} as any;
                profile = res;
                this.user = profile.user;

                this.utilities.dlog('---------------------------------------------------------hello');
                // Fetch active patients here
                this.getPatients();

                // Fetch active patients here
                this.getTestPackages();

                // get transactions here
                this.getTransactions();
            },
            error: (err) => {
                return false;
            }
        });
    }


    selectPatient(patient: any) {
        this.selectedPatient = patient;
        this.patientName = this.selectedPatient.lastName + ", " + this.selectedPatient.firstName;
        this.gender = this.selectedPatient.gender;
        this.address = this.selectedPatient.address;
        if(this.selectedPatient.middleName) this.patientName = this.patientName + ' ' + this.selectedPatient.middleName;
        this.patientAge = this.getAge(this.selectedPatient.dateOfBirth);
        this.age = this.patientAge.years + 'yo ' +  this.patientAge.months + 'mo ' + this.patientAge.days + 'd';
    }



    onPackageSelectionChange() {
        // Filter selected packages and store them in the selectedPackages array
        this.selectedPackages = this.testPackages.filter(testPackage => testPackage.isSelected);
    }

    showSelectedPackages() {
        this.showSelectPackageSection = true;
        this.showSelectDiscountSection = false;
    }


    /**
     * Calls the authservice getLabTransactions() which retrives and stores the list of transactions to this.transaction and packages to this.packages
     */
    getTransactions() {
        this.utilities.dlog('-------------------------------');
        this.authService.getTransactions().subscribe({
            next: (res) => {
                let allTransactions = {} as any;
                allTransactions = res;

                this.transactions = allTransactions.transactions;
            },
            error: (error) => {
                this.utilities.dlog('Error fetching lab transactions and packages: ' + error, 'error');
            }
        });
    }

    getTestPackages() {
        this.authService.getLabTests().subscribe({
            next: (res) => {
                let allRes = {} as any;
                allRes = res;
                this.utilities.dlog("test apckages res");
                this.utilities.dlog(res);
                this.testPackages = allRes.packages;
            },
            error: (error) => {
                this.utilities.dlog('Error fetching patients: ' + error, 'error');
            }
        });
    }

    getPatients() {
        this.authService.getAllActivePatients().subscribe({
            next: (res) => {
                let allRes = {} as any;
                allRes = res;
                this.utilities.dlog(res);

                this.patients = allRes.patients;
            },
            error: (error) => {
                this.utilities.dlog('Error fetching patients: ' + error, 'error');
            }
        });
    }


/*************************************************************************************************************************************
 * Managing Transactions
 *************************************************************************************************************************************/

resetSelections() {
    this.testPackages.forEach(testPackage => {
      testPackage.isSelected = false;
    });
    this.selectedPackages = [];
  }
    showAddTransactionInputRow() {
        this.showSelectPatientSection = true;
        this.showAddTransactionRow = true;
        this.showTransactionListRow = false;
        this.newTransaction = {};

        // Set default values for the date and time
        const currentDate = new Date();
        this.selectedDate.setValue(currentDate.toISOString().split('T')[0]);
        this.selectedTime.setValue(currentDate.toTimeString().split(' ')[0]);
    }


    cancelAddTransaction() {
        this.resetSelections();
        this.discountAmount = 0;
        this.discType = "NA";
        this.showAddTransactionRow = false;
        this.showTransactionListRow = true;
        this.newTransaction = {};
    }


    addTransaction() {
        if (this.userHasPermission('Add Transaction')) {
            // checks if there is both patient and package selected
            if (!(this.selectedPackages.length === 0 || !this.selectedPatient)) {
                // make an object similart but only get the properties you want
                const selectedProperties = this.selectedPackages.map((item) => ({
                    _id: item._id,
                    packageName: item.packageName,
                    price: item.price,
                    reagents: item.reagents,
                    testIncluded: item.testIncluded
                  }));

                this.newTransaction = {
                    //dateDone: this.getCurrentDateTime() this.utilities.,
                    dateDone: this.selectedDate.value + ' ' + this.selectedTime.value, // Date Time String
                    patientId: this.selectedPatient._id,
                    patientName: this.patientName,
                    patientAddress: this.address,
                    patientAge: this.age,
                    patientGender: this.gender,
                    subTotal: this.calculateSubtotal(),
                    discount: {
                        amount: this.discountAmount,
                        discountType: this.discType
                    },
                    total: this.calculateTotal(),
                    packages: selectedProperties
                }

                //alert('Going to add new transaction: ' + JSON.stringify(this.newTransaction));
                this.authService.registerTransaction(this.newTransaction).subscribe({
                    next: (response) => {
                        // Handle any UI updates or notifications here
                        this.getTransactions(); // after adding transaction i need to call this function to refresh the list displayed
                        this.newTransaction = {}; // this reset text inside the input boxes
                        this.showAddTransactionRow = false;
                        this.showTransactionListRow = true;
                        this.flashMessage.show('New Transaction Added!', { cssClass: 'alert-success', timeout: 3000 });
                        this.router.navigate(['/transaction/management']);
                    },
                    error: (error) => {
                        this.utilities.dlog('Error adding new transaction: ' + error, 'error');
                        this.flashMessage.show('Failed to add transaction!', {cssClass: 'alert-danger', timeout: 3000});
                        this.router.navigate(['transaction/management']);
                        // Handle error notifications or other actions here
                    }
                });
            }
        }
    }

    // ...

    discountAmount: number = 0; // Initialize discount amount
    discType: string = "NA";

    // ...

    calculateSubtotal(): number {
        // Calculate subtotal by summing up the prices of selected packages
        return this.selectedPackages.reduce((subtotal, testPackage) => subtotal + testPackage.price, 0);
    }

    calculateTotal(): number {
        // Calculate total by subtracting the discount from the subtotal
        return this.calculateSubtotal() - this.discountAmount;
    }

    // ...

    // Add a method to apply a discount (if needed)
    /*applyDiscount(discount: number): void {
        this.discountAmount = discount;
    }*/

    discountType: string = 'percentage'; // Default to percentage discount
    percentageDiscount: number = 0; // Initial percentage discount
    fixedDiscount: number = 0; // Initial fixed amount discount
    seniorCitizenDiscount: number = 20; // Senior Citizen discount percentage
    pwdDiscount: number = 20; // PWD discount percentage

    sampleDateOfBirth: Date = new Date('1985-03-11'); // Replace with your desired date
    getAge(dateOfBirth: Date): any {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        // Check if days are negative and borrow from months
        if (days < 0) {
            const borrow = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            days += borrow;
            months--;

            // If months are negative, borrow from years
            if (months < 0) {
                months += 12;
                years--;
            }
        }

        return {years: years, months: months, days: days};
        //return `${years}yr, ${months}mo, ${days}d`;
    }

    getMMDDYYYY(gDate): string {
        const givenDate = new Date(gDate);
        const formattedDateTime = `${givenDate.toLocaleDateString()}`;
        return formattedDateTime;
    }


    getCurrentDateTime(): string {
        // Create a new Date object to get the current date and time
        const now = new Date();

        // Format the date and time as a string
        const formattedDateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        return formattedDateTime;
    }

    getTotalPaid(payments): string {
        const total = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
        return total;
    }


  applyDiscount(): void {
    if (this.discountType === 'percentage') {
      // Calculate discount based on percentage
      this.discountAmount = (this.percentageDiscount / 100) * this.calculateSubtotal();
      this.discType = 'Courtesy';
    } else if (this.discountType === 'fixed') {
      // Use fixed discount amount
      this.discountAmount = this.fixedDiscount;
      this.discType = 'Courtesy';
    } else if (this.discountType === 'seniorCitizen') {
      // Apply Senior Citizen discount
      this.discountAmount = (this.seniorCitizenDiscount / 100) * this.calculateSubtotal();
      this.discType = 'Senior';
    } else if (this.discountType === 'pwd') {
      // Apply PWD discount
      this.discountAmount = (this.pwdDiscount / 100) * this.calculateSubtotal();
      this.discType = 'PWD';
    }
  }

  // Replace this with your actual function to get the total amount
  getTotalAmount(): number {
    return this.calculateSubtotal()-this.discountAmount;
  }


    editTransaction(index: number) {
        this.editingIndex = index;
    }


    saveEditTransaction(index: number) {
        this.editingIndex = null;
        this.submitTransactionsToBackend('Transaction Edited!', 'Failed to edit transaction!', 'Edit Transaction');
        // alert(`Updated transactions: ${JSON.stringify(this.transactions)}`);
    }


    cancelEditTransaction() {
        this.editingIndex = null;
    }


    deleteTransaction(index: number) {
        const confirmed = window.confirm('Are you sure you want to delete this transaction?');
        if (confirmed) {
            this.transactions[index].isDeleted = true;
            // this.transactions.splice(index, 1);
            this.submitTransactionsToBackend('Transaction Deleted!',  'Failed to delete transaction!', 'Delete Transaction');
        }
    }

    submitNewPaymentForm() {
        if (this.userHasPermission('Add Payment')) {
            if(this.newPaymentAmount && this.newPaymentReceiptNumber) {
                const newPayment = {
                    idToUpdate: this.idToUpdate,
                    paymentDate: this.getCurrentDateTime(),
                    receiptNumber: this.newPaymentReceiptNumber,
                    amountPaid: this.newPaymentAmount
                };

                this.authService.updateTransactionWithNewPayment(newPayment).subscribe({
                    next: (response) => {
                        // Handle any UI updates or notifications here

                        // after adding test i need to call this function to get updated list of transactions
                        this.getTransactions();

                        // hide the add payment section then show the list of transaction with a success flashmessage
                        this.showAddPaymentTransactionRow = false;
                        this.showTransactionListRow = true;
                        this.flashMessage.show('Payment Added!', { cssClass: 'alert-success', timeout: 3000 });
                    },
                    error: (error) => {
                        this.utilities.dlog('Error adding new test: ' + error, 'error');
                        this.flashMessage.show('Failed to add test!', {cssClass: 'alert-danger', timeout: 3000});
                        this.router.navigate(['transactions/management']);
                        // Handle error notifications or other actions here
                    }
                });
            }
            else {
                this.flashMessage.show('Please fill needed info.', { cssClass: 'alert-success', timeout: 3000 });
            }
        }

    }

    cancelNewPayment() {
        // hide the section for adding payment then show the list of transactions
        this.showAddPaymentTransactionRow = false;
        this.showTransactionListRow = true;
    }

    addPaymentTransaction(index: number) {
        // alert(JSON.stringify(this.transactions[index]));

        // this will be the transaction id to be updated
        this.idToUpdate = this.transactions[index]._id;

        // made these null instead of 0 so user can easily input data in blank textbox
        this.newPaymentAmount = null;
        this.newPaymentReceiptNumber = null;

        // hide the list of transaction then show the section where user can input data needed
        this.showTransactionListRow = false;
        this.showAddPaymentTransactionRow = true;
    }

    userHasPermission(permission: string): boolean {
        if(!this.user) return false;
        if(!this.user.role) return false;
        if(this.user.role === 'admin') return true;
        if(!this.user.allowedActions) return false;
        if(this.user.allowedActions.includes(permission) === true) return true;
        else return false;
    }

    submitTransactionsToBackend(successMsg, failMsg, action) {
        if (this.transactions.length > 0) {
            this.utilities.dlog('Submitting transactions to backend: ' + this.transactions);

            this.newUpdates.transactions = this.transactions;
            this.newUpdates.action = action;
            // alert(`Updated transactions and packages: ${JSON.stringify(this.newUpdates)}`);

            this.authService.updateTransaction(this.newUpdates).subscribe(
                data => {
                    if ((data as any).success){
                        this.flashMessage.show(successMsg, { cssClass: 'alert-success', timeout: 3000 });
                        this.router.navigate(['/labtransaction/management']);
                    } else {
                        this.flashMessage.show(failMsg, {cssClass: 'alert-danger', timeout: 3000});
                        this.router.navigate(['labtransaction/management']);
                    }
                }
            );
        } else {
            this.flashMessage.show('No transaction to submit', {cssClass: 'alert-danger', timeout: 3000});
        }
    }

}




/******************************************************************** */
