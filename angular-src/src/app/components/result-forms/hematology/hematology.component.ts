import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { SharedService } from '../../../shared/shared.service';
import { FlashMessagesModule, FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../../shared/utilities.functions';

@Component({
    selector: 'app-hematology',
    templateUrl: './hematology.component.html',
    styleUrls: ['./hematology.component.css']
})
export class HematologyComponent {
    public utilities = Utilities;
    user: any;
    resultId: string;

    transactionData: any;
    dateDone!: String;
    patientName!: String;
    address!: String;
    gender!: String;
    age!: String;

    wbc!: String;
    hematocrit!: String;
    hemoglobin!: String;
    neutrophils!: String;
    lymphocytes!: String;
    midCells: String;
    plateletCount!: String;
    bleedingTime!: String;
    clottingTime!: String;
    esr!: String;
    bloodType!: String;
    others!: String;

    labelWbc!: String;
    labelHematocrit!: String;
    labelHemoglobin!: String;
    labelNeutrophils!: String;
    labelLymphocytes!: String;
    labelMidCells!: String;
    labelPlateletCount!: String;
    labelBleedingTime!: String;
    labelClottingTime!: String;
    labelEsr!: String;
    labelBloodType!: String;
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
    
            this.labelWbc = 'WBC';
            this.labelHematocrit = 'Hematocrit';
            this.labelHemoglobin = 'Hemoglobin';
            this.labelNeutrophils = 'Neutrophils';
            this.labelLymphocytes = 'Lymphocytes';
            this.labelMidCells = 'Mid Cells';
            this.labelPlateletCount = 'Platelet Count';
            this.labelBleedingTime = 'Bleeding Time';
            this.labelClottingTime = 'Clotting Time';
            this.labelEsr = 'ESR';
            this.labelBloodType = 'Blood Type';
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
 
        params.push({ name: this.labelWbc, value: this.wbc, normal: '4 - 10 x 10\u2079 g/L'});
        params.push({ name: this.labelHematocrit, value: this.hematocrit, normal: this.transactionData.patient.gender === 'Female' ? '37 - 47 %' : '42 - 52 %'});
        params.push({ name: this.labelHemoglobin, value: this.hemoglobin, normal: this.transactionData.patient.gender === 'Female' ? '120 - 160 g/L' : '140 - 180 g/L'});
        params.push({ name: this.labelNeutrophils, value: this.neutrophils, normal: '0.50 - 0.70'});
        params.push({ name: this.labelLymphocytes, value: this.lymphocytes, normal: '0.20 - 0.40'});
        params.push({ name: this.labelMidCells, value: this.midCells, normal: '0.01 - 0.09'});
        params.push({ name: this.labelPlateletCount, value: this.plateletCount, normal: '150 - 400 x 10\u2079 g/L'});
        params.push({ name: this.labelBleedingTime, value: this.bleedingTime, normal: '1 - 3 minutes'});
        params.push({ name: this.labelClottingTime, value: this.clottingTime, normal: '3 - 5 minutes'});
        params.push({ name: this.labelEsr, value: this.esr, normal: '0 - 20 mm/Hr'});
        params.push({ name: this.labelBloodType, value: this.bloodType, normal: 'N/A'});
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
