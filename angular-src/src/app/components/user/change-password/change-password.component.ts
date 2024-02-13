import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FlashMessagesService} from 'flash-messages-angular';
import { Router } from '@angular/router';
import { Utilities } from '../../../shared/utilities.functions';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  user: any;
  public utilities = Utilities;

  currentPassword!: String;
  newPassword!: String;
  confirmPassword!: String;

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

  onSubmit(){
    const userInput = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }

    this.authService.changeUserPassword(userInput).subscribe(
      data => {
        if ((data as any).success){
          this.flashMessage.show('Password updated!', { cssClass: 'alert-success position-fixed top-0 start-0 w-100', timeout: 3000 });
          this.router.navigate(['dashboard']);
        } else {
          this.flashMessage.show('Change password failed!', {cssClass: 'alert-danger', timeout: 3000});
        }
      }
    );
  }
}
