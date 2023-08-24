import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { AuthService } from '../../../services/auth.service';
import { FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent {
  user: any;

  firstName!: String;
  middleName!: String;
  lastName!: String; 
  dateOfBirth!: String;
  email!: String;
  mobile!: String;
  role!: String;
  license!: String;
  receivePromo!: Boolean;
  signatoryName!: String;
  gender!: String;
  address!: String;
  isSeniorCitizen!: Boolean;
  seniorIdNumber!: String;

  availableRoles: string[] = ['admin', 'cashier', 'drirector', 'medtech', 'radtech'];
  selectedRole: string = '';

  availableActions: string[] = [
    'Add All User',
    'Add Cashier',
    'Add Director',
    'Add Medtech',
    'Add Radtech',
    'Add Test',
    'Edit Test',
    'Delete Test',
    'Add Package',
    'Edit Package',
    'Delete Package',
  ];
  selectedAction: string = '';
  selectedActions: string[] = [];

  addName() {
    if (this.selectedAction) {
      this.selectedActions.push(this.selectedAction);
      this.availableActions = this.availableActions.filter(name => name !== this.selectedAction);
      this.selectedAction = '';
    }
  }

  removeName() {
    if (this.selectedActions.length > 0) {
      const removedName = this.selectedActions.pop();
      this.availableActions.push(removedName);
    }
  }

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
      role: this.role,
      license: this.license,
      receivePromo: this.receivePromo,
      signatoryName: this.signatoryName,
      allowedActions: this.selectedActions,
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
