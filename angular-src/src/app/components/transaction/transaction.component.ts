import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService} from 'flash-messages-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})


export class TransactionComponent {
    user: any;
    transactions: any[] = [];
    newTransaction: any = {};
    editingIndex: number | null = null;
    editingTransactionIndex: number | null = null;
    newUpdates: any = {};
    showTransactionListRow: boolean = true;
    showAddTransactionRow: boolean = false;
    showSelectPatientSection: boolean = false;
    showSelectPackageSection: boolean = false;
    showSelectDiscountSection: boolean = false;
    

    transactionForm: FormGroup;

    // Sample data arrays
    

    // Sample data array for testPackages
    testPackages: any[] = [
        { _id: '101', packageName: 'Package A', price: 50, isSelected: false },
        { _id: '102', packageName: 'Package B', price: 75, isSelected: false },
        { _id: '103', packageName: 'Package C', price: 100, isSelected: false },
    ];
    selectedPackages: any[] = [];

    patients: any[] = [
        { _id: 1, firstname: 'John', lastname: 'Doe' },
        { _id: 2, firstname: 'Jane', lastname: 'Smith' },
        { _id: 3, firstname: 'Alice', lastname: 'Johnson' },
    ];
    selectedPatient: any = null;


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
        console.log(formData);
    
        // You can send the form data to your backend or perform any other action here
        } else {
        // Form is not valid, display error messages or take appropriate action
        }
    }
    

    
    
    showSelectPackages() {
        this.showSelectPackageSection = true;
        this.showSelectDiscountSection = false;
        // ... other logic
    }
    
    showSetDiscount() {
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
    }

    showSelectedPatient() {
        if (this.selectedPatient) {
            alert('Selected Patient: ' + JSON.stringify(this.selectedPatient));
        } else {
            //alert('No patient selected.');
            const userInput = prompt('Please enter a value:');
            console.log('User input:', userInput);
        }
    }

    onPackageSelectionChange() {
        // Filter selected packages and store them in the selectedPackages array
        this.selectedPackages = this.testPackages.filter(testPackage => testPackage.isSelected);
    }

    showSelectedPackages() {
        // Alert and display the selected packages
        if (this.selectedPackages.length === 0) {
            alert('No packages selected.');
        } else {
            alert('Selected Packages: ' + JSON.stringify(this.selectedPackages));
        }
    }


    /**
     * Calls the authservice getLabTransactions() which retrives and stores the list of transactions to this.transaction and packages to this.packages
     */
    getTransactions() {
        console.log('-------------------------------');
        this.authService.getTransactions().subscribe({
            next: (res) => {
                let allTransactions = {} as any;
                allTransactions = res;

                this.transactions = allTransactions.transactions;
            },
            error: (error) => {
                console.log('Error fetching lab transactions and packages:', error);
            }
        });
    }


/*************************************************************************************************************************************
 * Managing Transactions
 *************************************************************************************************************************************/

    showAddTransactionInputRow() {
        this.showSelectPatientSection = true;
        this.showAddTransactionRow = true;
        this.showTransactionListRow = false;
        this.newTransaction = {};
    }


    cancelAddTransaction() {
        this.showAddTransactionRow = false;
        this.showTransactionListRow = true;
        this.newTransaction = {};
    }


    addTransaction() {
        if (this.userHasPermission('Add Transaction')) {
            // checks if there is both patient and package selected
            if (!(this.selectedPackages.length === 0 || !this.selectedPatient)) {
                this.newTransaction.patient = this.selectedPatient;
                this.newTransaction.items = this.selectedPackages;
                this.newTransaction.date = "date now";

                alert('Going to add new transaction: ' + JSON.stringify(this.newTransaction));
                this.authService.registerTransaction(this.newTransaction).subscribe({      
                    next: (response) => {
                        // Handle any UI updates or notifications here
                        this.getTransactions(); // after adding transaction i need to call this function to refresh the list displayed
                        this.newTransaction = {}; // this reset text inside the input boxes
                        this.showAddTransactionRow = false;
                        this.showTransactionListRow = true;
                        this.flashMessage.show('New Transaction Added!', { cssClass: 'alert-success', timeout: 3000 });
                        this.router.navigate(['/labtransaction/management']);
                    },
                    error: (error) => {
                        console.error('Error adding new transaction:', error);
                        this.flashMessage.show('Failed to add transaction!', {cssClass: 'alert-danger', timeout: 3000});
                        this.router.navigate(['labtransaction/management']);
                        // Handle error notifications or other actions here
                    }
                });
            }
        }
    }

    // ...

    discountAmount: number = 0; // Initialize discount amount

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
    getAge(dateOfBirth: Date): string {
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
    
        return `${years}yr, ${months}mo, ${days}d`;
    }
    

    getCurrentDateTime(): string {
        // Create a new Date object to get the current date and time
        const now = new Date();
    
        // Format the date and time as a string
        const formattedDateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
        return formattedDateTime;
    }


  applyDiscount(): void {
    if (this.discountType === 'percentage') {
      // Calculate discount based on percentage
      this.discountAmount = (this.percentageDiscount / 100) * this.calculateSubtotal();
    } else if (this.discountType === 'fixed') {
      // Use fixed discount amount
      this.discountAmount = this.fixedDiscount;
    } else if (this.discountType === 'seniorCitizen') {
      // Apply Senior Citizen discount
      this.discountAmount = (this.seniorCitizenDiscount / 100) * this.calculateSubtotal();
    } else if (this.discountType === 'pwd') {
      // Apply PWD discount
      this.discountAmount = (this.pwdDiscount / 100) * this.calculateSubtotal();
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
            console.log('Submitting transactions to backend:', this.transactions);

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
