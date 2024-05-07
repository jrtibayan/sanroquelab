import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { SharedService } from '../../../shared/shared.service';
import { FlashMessagesModule, FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../../shared/utilities.functions';

@Component({
    selector: 'app-serology',
    templateUrl: './serology.component.html',
    styleUrls: ['./serology.component.css']
})
export class SerologyComponent {
    public utilities = Utilities;
    user: any = {};
    resultId: string;

    transactionData: any;
    dateDone!: String;
    patientName!: String;
    address!: String;
    gender!: String;
    age!: String;
    requiredParameters: any;

    hbsag!: String;
    vdrl!: String;
    others!: String;

    labelHbsag!: String;
    labelVdrl!: String;
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
        this.requiredParameters = this.transactionData.test.parameters;
    
        this.authService.getProfile().subscribe(res => {
            let profile = {} as any;
            profile = res;
            this.user = profile.user;

            this.medtechName = this.user.signatoryName && this.user.signatoryName.length > 0 ? this.user.signatoryName : 'Joyce Ann E. Magnaye, RMT';
            this.medtechLicense = this.user.license && this.user.license.length > 0 ? this.user.license : '0063961';
            this.transactionData.medtech = {
              name: this.medtechName,
              license: this.medtechLicense
            }

            this.labelHbsag = 'HBsAg';
            this.labelVdrl = 'VDRL';
            this.labelOthers = 'Others';
        }, err => {
          this.utilities.dlog(err, 'error');
          return false
        });
    }

    // Check if there is an object with property name "Sugar" in this.requiredParameters
    hasParameter(paramName): boolean {
      return this.requiredParameters.some(param => param.name.toLowerCase() === paramName.toLowerCase());
    }

    onSaveSubmit(){ 
        this.transactionData.test.parameters = [];
        this.transactionData.status = 'Ready';
    
        let params = [];
 
        params.push({ name: this.labelHbsag, value: this.hbsag, normal: null});
        params.push({ name: this.labelVdrl, value: this.vdrl, normal: null});
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
          patient: this.transactionData.patient,
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
