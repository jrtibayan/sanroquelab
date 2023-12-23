import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { SharedService } from '../../../shared/shared.service';
import { FlashMessagesModule, FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../../shared/utilities.functions';

@Component({
    selector: 'app-fecalysis',
    templateUrl: './fecalysis.component.html',
    styleUrls: ['./fecalysis.component.css']
})
export class FecalysisComponent {
    public utilities = Utilities;
    user: any;
    resultId: string;

    transactionData: any;
    dateDone!: String;
    patientName!: String;
    address!: String;
    gender!: String;
    age!: String;

    color!: String;
    consistency!: String;
    pusCell!: String;
    redBloodCell!: String;
    others!: String;

    labelColor!: String;
    labelConsistency!: String;
    labelPusCell!: String;
    labelRedBloodCell!: String;
    labelOthers!: String;

    requestingPhysicianName!: String;
    requestingPhysicianLicense!: String;
    medtechName!: String;
    medtechLicense!: String;
    pathologistName!: String;
    pathologistLicense!: String;

    constructor(
        private sharedService: SharedService,
        private validateService: ValidateService,
        private authService: AuthService,
        private flashMessage: FlashMessagesService,
        private router: Router
    ) { }


    ngOnInit(): void { 
        // Retrieve the ptest ID from the route parameters
        this.transactionData = this.sharedService.getSharedData();
    
        this.authService.getProfile().subscribe(res => {
            let profile = {} as any;
            profile = res;
            this.user = profile.user;
    
            this.labelColor = 'WBC';
            this.labelConsistency = 'Hematocrit';
            this.labelPusCell = 'Hemoglobin';
            this.labelRedBloodCell = 'Neutrophils';
            this.labelOthers = 'Lymphocytes';
        }, err => {
          this.utilities.dlog(err, 'error');
          return false
        });
    }


    onSaveSubmit(){ 
        this.transactionData.test.parameters = [];
        this.transactionData.status = 'Ready';
    
        let params = [];
 
        params.push({ name: this.labelColor, value: this.color, normal: null});
        params.push({ name: this.labelConsistency, value: this.consistency, normal: null});
        params.push({ name: this.labelPusCell, value: this.pusCell, normal: null});
        params.push({ name: this.labelRedBloodCell, value: this.redBloodCell, normal: null});
        params.push({ name: this.labelOthers, value: this.others, normal: null});
    
        for (const param of params) {
          if (param.value) {
            this.transactionData.test.parameters.push({
              name: param.name,
              value: param.value,
              normal: param.normal
            });
          }
        }
    
        const resultIdToUpdate = this.transactionData._id;
        const updatedResultData = {
          test: this.transactionData.test,
          requestingPhysician: this.transactionData.requestingPhysician,
          medtech: this.transactionData.medtech,
          pathologist: this.transactionData.pathologist,
          status: this.transactionData.status
        };
        this.authService.updateUrinalysisResult(resultIdToUpdate, updatedResultData)
        .subscribe(
            (data) => {
              if ((data as any).success) {
                this.flashMessage.show('Test result updated', { cssClass: 'alert-success', timeout: 3000 });
                this.router.navigate(['labresult/management']);
              } else {
                this.flashMessage.show('Test result was not saved. Make sure the data you entered is complete!', { cssClass: 'alert-danger', timeout: 3000 });
              }
            },
            (error) => {
              console.error('Update failed', error);
              // Handle error, if needed
            }
        );
    
        /*
        if(!this.validateService.validateRegister(user)) {
          this.flashMessage.show('Please fill in all fields', {cssClass: 'alert-danger', timeout: 3000});
          return false;
        }
        */
    
        // Submit and insert result
        /*this.authService.registerUrinalysisResult(this.transactionData).subscribe(
          data => {
            if ((data as any).success){
              this.flashMessage.show('Test result added', { cssClass: 'alert-success', timeout: 3000 });
              this.router.navigate(['labresult/management']);
            } else {
              this.flashMessage.show('Something went wrong', {cssClass: 'alert-danger', timeout: 3000});
            }
          }
        );
        */
    }
}
