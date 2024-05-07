import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { SharedService } from '../../../shared/shared.service';
import { FlashMessagesModule, FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../../shared/utilities.functions';

@Component({
  selector: 'app-urinalysis',
  templateUrl: './urinalysis.component.html',
  styleUrls: ['./urinalysis.component.css']
})
export class UrinalysisComponent {
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

  color!: String;
  transparency!: String;
  sugar!: String;
  ph!: String;
  specificGravity!: String;
  protein!: String;
  pusCells!: String;
  rbc!: String;
  epithelialCells!: String;
  amorphousUrates!: String;
  amorphousPhosphates!: String;
  bacteria!: String;
  mucusThreads!: String;
  pusCellsInClumps!: String;
  micralTest!: String;
  hyalineCasts!: String;
  fineGranularCasts!: String;
  others!: String;

  labelColor!: String;
  labelTransparency!: String;
  labelSugar!: String;
  labelPh!: String;
  labelSpecificGravity!: String;
  labelProtein!: String;
  labelPusCells!: String;
  labelRbc!: String;
  labelEpithelialCells!: String;
  labelAmorphousUrates!: String;
  labelAmorphousPhosphates!: String;
  labelBacteria!: String;
  labelMucusThreads!: String;
  labelPusCellsInClumps!: String;
  labelMicralTest!: String;
  labelHyalineCasts!: String;
  labelFineGranularCasts!: String;
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

      this.labelColor = 'Color';
      this.labelTransparency = 'Transparency';
      this.labelSugar = 'Sugar';
      this.labelPh = 'PH';
      this.labelSpecificGravity = 'Specific Gravity';
      this.labelProtein = 'Protein';
      this.labelPusCells = 'Pus Cells';
      this.labelRbc = 'RBC';
      this.labelEpithelialCells = 'Epithelial Cells';
      this.labelAmorphousUrates = 'Amorphous Urates';
      this.labelAmorphousPhosphates = 'Amorphous Phosphates';
      this.labelBacteria = 'Bacteria';
      this.labelMucusThreads = 'Mucus Threads';
      this.labelPusCellsInClumps = 'Pus Cells In Clumps';
      this.labelMicralTest = 'Micral Test';
      this.labelHyalineCasts = 'Hyaline Casts';
      this.labelFineGranularCasts = 'Fine Granular Casts';
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

  // Check if there is an object with property name "Sugar" in this.requiredParameters
  hasParameter(paramName): boolean {
    return this.requiredParameters.some(param => param.name.toLowerCase() === paramName.toLowerCase());
  }

  onSaveSubmit(){ 
    this.transactionData.test.parameters = [];
    this.transactionData.status = 'Ready';

    let params = [];
    params.push({ name: this.labelColor, value: this.color, normal: null});
    params.push({ name: this.labelTransparency, value: this.transparency, normal: null});
    params.push({ name: this.labelSugar, value: this.sugar, normal: null});
    params.push({ name: this.labelPh, value: this.ph, normal: null});
    params.push({ name: this.labelSpecificGravity, value: this.specificGravity, normal: null});
    params.push({ name: this.labelProtein, value: this.protein, normal: null});
    params.push({ name: this.labelPusCells, value: this.pusCells, normal: null});
    params.push({ name: this.labelRbc, value: this.rbc, normal: null});
    params.push({ name: this.labelEpithelialCells, value: this.epithelialCells, normal: null});
    params.push({ name: this.labelAmorphousUrates, value: this.amorphousUrates, normal: null});
    params.push({ name: this.labelAmorphousPhosphates, value: this.amorphousPhosphates, normal: null});
    params.push({ name: this.labelBacteria, value: this.bacteria, normal: null});
    params.push({ name: this.labelMucusThreads, value: this.mucusThreads, normal: null});
    params.push({ name: this.labelPusCellsInClumps, value: this.pusCellsInClumps, normal: null});
    params.push({ name: this.labelMicralTest, value: this.micralTest, normal: null});
    params.push({ name: this.labelHyalineCasts, value: this.hyalineCasts, normal: null});
    params.push({ name: this.labelFineGranularCasts, value: this.fineGranularCasts, normal: null});
    params.push({ name: this.labelOthers, value: this.others, normal: null});

    for (const param of params) {
      if (param.value) {
        this.transactionData.test.parameters.push({
          name: param.name,
          value: param.value,
          normal: null
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
