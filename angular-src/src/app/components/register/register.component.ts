import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: any;

  firstname!: String;
  middlename!: String;
  lastname!: String; 
  dateOfBirth!: String;
  email!: String;
  role!: String;
  license!: String;
  signatoryName!: String;
  gender!: String;
  address!: String;

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
      firstname: this.firstname,
      middlename: this.middlename,
      lastname: this.lastname,
      dateOfBirth: this.dateOfBirth,
      email: this.email,
      role: this.role,
      license: this.license,
      signatoryName: this.signatoryName,
      gender: this.gender,
      address: this.address
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

    // Register user
    this.authService.registerUser(user).subscribe(
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