import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate() {
        this.authService.loadToken();

        if(this.authService.isLoggedin()) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}