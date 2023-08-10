import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-patient',
  templateUrl: './register-patient.component.html',
  styleUrls: ['./register-patient.component.css']
})
export class RegisterPatientComponent {
  user: any;

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
    this.authService.getProfile().subscribe(res => {
      let profile = {} as any;
      profile = res;
      this.user = profile.user;
    }, err => {
      console.log(err);
      return false
    });
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
          this.flashMessage.show('User is now registered', { cssClass: 'alert-success', timeout: 3000 });
          this.router.navigate(['/login']);
        } else {
          this.flashMessage.show('Something went wrong', {cssClass: 'alert-danger', timeout: 3000});
      this.router.navigate(['/register']);
        }
      }
    );
  }
}
