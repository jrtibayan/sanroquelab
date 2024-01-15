import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { SharedService } from '../../../shared/shared.service';
import { FlashMessagesModule, FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../../shared/utilities.functions';


@Component({
    selector: 'app-blood-chemistry',
    templateUrl: './blood-chemistry.component.html',
    styleUrls: ['./blood-chemistry.component.css']
})
export class BloodChemistryComponent {
    public utilities = Utilities;
    user: any;
    resultId: string;

    transactionData: any;
    dateDone!: String;
    patientName!: String;
    address!: String;
    gender!: String;
    age!: String;

    hba1c!: String;
    fbs!: String;
    cholesterol!: String;
    triglycerides!: String;
    hdl!: String;
    ldl: String;
    bua!: String;
    creatinine!: String;
    bun!: String;
    sgot!: String;
    sgpt!: String;
    rbs!: String;
    others!: String;

    labelHba1c!: String;
    labelFbs!: String;
    labelCholesterol!: String;
    labelTriglycerides!: String;
    labelHdl!: String;
    labelLdl!: String;
    labelBua!: String;
    labelCreatinine!: String;
    labelBun!: String;
    labelSgot!: String;
    labelSgpt!: String;
    labelRbs!: String;
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
    
            this.labelHba1c = 'HbA1c';
            this.labelFbs = 'FBS';
            this.labelCholesterol = 'Cholesterol';
            this.labelTriglycerides = 'Triglycerides';
            this.labelHdl = 'HDL';
            this.labelLdl = 'LDL';
            this.labelBua = 'BUA';
            this.labelCreatinine = 'Creatinine';
            this.labelBun = 'BUN';
            this.labelSgot = 'SGOT';
            this.labelSgpt = 'SGPT';
            this.labelRbs = 'RBS';
            this.labelOthers = 'Others';

          /*
          this.transactionData = {
            dateDone: "12/11/2023",
            patient: {
              name: "Lastname, Firstname Middlename",
              address: "Street, City, Province",
              gender: "Male / Female",
              age: "30Yo 5Mo"
            },
            test: {
              type: "Urinalysis"
            },
            requestingPhysician: {
              name: 'Firstname MI. Lastname, MD',
              license: '00123456'
            },
            medtech: {
              name: 'Joyce Ann E. Magnaye, RMT',
              license: '0063961'
            },
            pathologist: {
              name: 'Colso, S. Ramos, MD, FPSP',
              license: '0046296'
            }
          };
          */
        }, err => {
          this.utilities.dlog(err, 'error');
          return false
        });
    }


    onSaveSubmit(){ 
        this.transactionData.test.parameters = [];
        this.transactionData.status = 'Ready';
    
        let params = [];
        params.push({ name: this.labelHba1c, value: this.hba1c, normal: '4.0 - 5.6 %'});
        params.push({ name: this.labelFbs, value: this.fbs, normal: '3.6 - 6.1 mmol/L'});
        params.push({ name: this.labelCholesterol, value: this.cholesterol, normal: 'Up to 5.18 mmol/L'});
        params.push({ name: this.labelTriglycerides, value: this.triglycerides, normal: 'Up to 1.7 mmol/L'});
        params.push({ name: this.labelHdl, value: this.hdl, normal: '> 0.9 mmol/L'});
        params.push({ name: this.labelLdl, value: this.ldl, normal: '< 3.9 mmol/L'});
        params.push({ name: this.labelBua, value: this.bua, normal: this.transactionData.patient.gender === 'Female' ? '2.3 - 6.1 mg/dl' : '3.6 - 8.2 mg/dl'});
        params.push({ name: this.labelCreatinine, value: this.creatinine, normal: '0.60 - 1.30 mg/dl'});
        params.push({ name: this.labelBun, value: this.bun, normal: '6 - 19 mg/dl'});
        params.push({ name: this.labelSgot, value: this.sgot, normal: this.transactionData.patient.gender === 'Female' ? '0 - 31 U/L' : '0 - 37 U/L'});
        params.push({ name: this.labelSgpt, value: this.sgpt, normal: this.transactionData.patient.gender === 'Female' ? '0 - 31 U/L' : '0 - 41 U/L'});
        params.push({ name: this.labelRbs, value: this.rbs, normal: '80 - 120 mg/dl'});
        params.push({ name: this.labelOthers, value: this.others, normal: 'N/A'});
    
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
