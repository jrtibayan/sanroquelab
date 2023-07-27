import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authToken: any;
  user: any;

  constructor(
    private http:HttpClient
    ) { }

    registerUser(user) {
    const httpOptions = {headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': localStorage.getItem('id_token')
    })};
    return this.http.post(
      'http://localhost:3000/users/register', 
      user, 
      httpOptions
    ).pipe(map(res => res));
  }

  authenticateUser(user) {
    const httpOptions = {headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })};
    return this.http.post(
      'http://localhost:3000/users/authenticate',
      user,
      httpOptions
    ).pipe(map(res => res));
  }

  getProfile() {
    this.loadToken();
    const httpOptions = {headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': this.authToken
    })};
    return this.http.get(
      'http://localhost:3000/users/profile',
      httpOptions
    ).pipe(map(res => res));
  }

  storeUserData(token, user) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  isLoggedin() {
    const helper = new JwtHelperService();
    let isExpired = helper.isTokenExpired(this.authToken);
    let isLoggedIn = !isExpired;

    return isLoggedIn;
  }

  logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
}
