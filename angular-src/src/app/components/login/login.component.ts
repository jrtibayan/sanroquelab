import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../shared/utilities.functions';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;

  public utilities = Utilities;

  email!: String;
  password!: String;

  constructor(
    private authService: AuthService,
    private flashMessage: FlashMessagesService,
    private router: Router
    ) { }

  ngOnInit():void {
    this.authService.getProfile().subscribe(res => {
      let profile = {} as any;
      profile = res;
      this.user = profile.user;
    }, err => {
      this.utilities.dlog(err);
      return false
    });
  }

  onLoginSubmit(){
    const user = {
      email: this.email,
      password: this.password
    }

    this.authService.authenticateUser(user).subscribe(data => {
      if((data as any).success) {
        if((data as any).token) {
          this.authService.storeUserData((data as any).token, (data as any).user);
          this.router.navigate(['dashboard']);
        } 
        this.flashMessage.show('You are now logged in', {cssClass: 'alert-success', timeout: 5000});
      } else {
        this.flashMessage.show((data as any).msg, {cssClass: 'alert-danger', timeout: 5000});
      }
    });
  }


  resetPassword() {
    // Show confirmation dialog
    const confirmReset = confirm('Are you sure you want to reset your password?');

    if (confirmReset) {
      // Call the resetUserPassword function
      const userInput = {
        email: this.email
      }

      this.authService.resetUserPassword(userInput).subscribe(
        data => {
          console.log('requesting to backend');
          if ((data as any).success){
            this.flashMessage.show('Password Reset Successful', { cssClass: 'alert-success position-fixed top-0 start-0 w-100', timeout: 3000 });
          } else {
            this.flashMessage.show('Password reset failed!', {cssClass: 'alert-danger', timeout: 3000});
          }
        }
      );
    }
  }
}
