import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Utilities } from '../../shared/utilities.functions';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{
  user: any;

  public utilities = Utilities;

  constructor(
    private authService: AuthService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.authService.getProfile().subscribe(res => {
      let profile = {} as any;
      profile = res;
      this.user = profile.user;
    }, err => {
      this.utilities.dlog(err);
      return false
    });
  }

}
