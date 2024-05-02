import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService} from 'flash-messages-angular';
import { FormBuilder, FormGroup, Validators, FormControl  } from '@angular/forms';

import { Utilities } from '../../shared/utilities.functions';

@Component({
  selector: 'app-transactionhistory',
  templateUrl: './transactionhistory.component.html',
  styleUrls: ['./transactionhistory.component.css']
})
export class TransactionhistoryComponent {
  public utilities = Utilities;
  currentDate: Date = new Date();

  selectedStartDate: string = '';
  selectedEndDate: string = '';
  transactionHistory: any[] = [];
  refunds: any[] = [];
  retrievedTransactions: any = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private flashMessage: FlashMessagesService,
    private router: Router
  ) {
    this.selectedStartDate = this.utilities.formatDateForInput(this.currentDate);
    this.selectedEndDate = this.utilities.formatDateForInput(this.currentDate);
  }

  getTotal(field: string): number {
    return this.transactionHistory.reduce((acc, transaction) => acc + transaction[field], 0);
    //return this.transactionHistory.reduce((acc, transaction) => acc + (transaction[field] || 0), 0);
  }

  getTransactionHistory() {
    console.log('getTransactionHistory');
    // Implement logic to fetch transaction history based on selected dates
    // Update this.transactionHistory array accordingly
    this.authService.getTransactionsByDate(this.selectedStartDate,this.selectedEndDate).subscribe({
      next: (response) => {
          // Handle any UI updates or notifications here
          
          console.log('list of transactions');
          this.retrievedTransactions = response;
          this.retrievedTransactions = this.retrievedTransactions.transactions;
          console.log(this.retrievedTransactions);  

          // Create a new array with the desired format
          const formattedTransactions = this.retrievedTransactions.reduce((acc, transaction) => {
            // Check if the transaction has payments
            if (transaction.payments && transaction.payments.length > 0) {
              // For each payment, create a new object with combined information
              const payments = transaction.payments.map(payment => {
                // Concatenate package names if packages exist
                const packageNames = transaction.packages ? transaction.packages.map(pkg => pkg.packageName).join(', ') : '';
                return {
                  receiptNo: payment.receiptNumber,  // Replace with the actual property
                  paymentDate: payment.paymentDate,      // Replace with the actual property
                  patientName: transaction.patientName,
                  subTotal: transaction.subTotal,
                  discount: transaction.discount.amount,
                  total: transaction.total,
                  transactionId: transaction._id,        // Assuming you want the _id of the transaction
                  items: packageNames,
                  receiptCancelled: payment?.receiptCancelled ?? false,
                  refundAmount: payment?.refundAmount ?? 0,
                  remarks: payment?.remarks ?? "",
                };
              });

              // Add the payments to the accumulator
              acc.push(...payments);
            }

            return acc;
          }, []);
          this.transactionHistory = formattedTransactions;

          this.transactionHistory.sort((a, b) => {
            // Convert receipt numbers to numbers for proper numeric sorting
            const receiptNoA = parseInt(a.receiptNo);
            const receiptNoB = parseInt(b.receiptNo);

            // Compare receipt numbers
            if (receiptNoA < receiptNoB) {
                return -1; // a should come before b
            } else if (receiptNoA > receiptNoB) {
                return 1; // a should come after b
            } else {
                return 0; // receipt numbers are equal
            }
          });

          this.refunds = this.transactionHistory.filter(transaction => transaction.refundAmount > 0);

          console.log('this.refunds');
          console.log(this.refunds);
      },
      error: (error) => {
          this.utilities.dlog('Error adding new transaction: ' + error, 'error');
          this.flashMessage.show('Failed to add transaction!', {cssClass: 'alert-danger', timeout: 3000});
          // Handle error notifications or other actions here
      }
    });
  }

  private getRandomAmount(): number {
    // Helper function to generate a random amount for sample data
    return Math.floor(Math.random() * 1000) + 1;
  }

  private getRandomDate(): string {
    // Helper function to generate a random date for sample data
    const startDate = new Date(2022, 0, 1); // January 1, 2022
    const endDate = new Date();
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    return randomDate.toISOString().split('T')[0]; // Return date in 'YYYY-MM-DD' format
  }

}
