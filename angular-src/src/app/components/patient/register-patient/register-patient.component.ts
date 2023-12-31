import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../../shared/utilities.functions';

@Component({
  selector: 'app-register-patient',
  templateUrl: './register-patient.component.html',
  styleUrls: ['./register-patient.component.css']
})
export class RegisterPatientComponent {
  user: any;

  public utilities = Utilities;

  firstName!: String;
  middleName!: String;
  lastName!: String; 
  dateOfBirth!: String;
  email!: String;
  mobile!: String;
  receivePromo!: Boolean;
  gender!: String;
  address!: String;
  isSeniorCitizen!: Boolean;
  seniorIdNumber!: String;

  constructor(
    private validateService: ValidateService,
    private authService: AuthService,
    private flashMessage: FlashMessagesService,
    private router: Router
  ) { }

  ngOnInit(): void { 
    this.gender = "Male";
    //this.dateOfBirth = this.utilities.formatDateForInput(new Date());

    this.authService.getProfile().subscribe(res => {
      let profile = {} as any;
      profile = res;
      this.user = profile.user;
    }, err => {
      this.utilities.dlog(err);
      return false
    });
  }

  resetInputs() {
    this.firstName = '';
    this.middleName = '';
    this.lastName = '';
    this.dateOfBirth = '';
    this.email = '';
    this.mobile = '';
    this.receivePromo = false;
    this.gender = 'Male';
    this.address = '';
    this.isSeniorCitizen = false;
    this.seniorIdNumber = '';
  }

  onRegisterSubmit() {
    const user = {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      mobile: this.mobile,
      email: this.email,
      receivePromo: this.receivePromo,
      gender: this.gender,
      address: this.address,
      isSeniorCitizen: this.isSeniorCitizen,
      seniorIdNumber: this.seniorIdNumber
    }

    if(!this.validateService.validateRegister(user)) {
      this.flashMessage.show('Please fill in all fields', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    // Validate Email
    if(!this.validateService.validateEmail(user.email)) {
    this.flashMessage.show('Please use a valid email', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    // Register Patient
    this.authService.registerPatient(user).subscribe(
      data => {
        if ((data as any).success){
          this.flashMessage.show('Patient is now registered', { cssClass: 'alert-success position-fixed top-0 start-0 w-100', timeout: 3000 });
          this.resetInputs();
        } else {
          this.flashMessage.show('Something went wrong', {cssClass: 'alert-danger', timeout: 3000});
        }
      }
    );
  }
}
