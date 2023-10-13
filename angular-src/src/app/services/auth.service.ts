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


/*************************************************************************************************************************************
 * User Route
 *************************************************************************************************************************************/
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


/*************************************************************************************************************************************
 * Patient Route
 *************************************************************************************************************************************/
    registerPatient(patient) {
        const httpOptions = {headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
        'http://localhost:3000/patients/register',
        patient,
        httpOptions
        ).pipe(map(res => res));
    }


    getAllActivePatients() {
        this.loadToken();
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            'http://localhost:3000/patients/getall/active',
            httpOptions
        ).pipe(map(res => res));
    }


/*************************************************************************************************************************************
 * Transactions Route
 *************************************************************************************************************************************/


    getTransactions() {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            'http://localhost:3000/transactions/getall',
            httpOptions
        ).pipe(map(res => res));
    }


    registerTransaction(transaction) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        console.log(' going to /transactions/register from auth service');
        console.log(' authorization');
        console.log(localStorage.getItem('id_token'));
        return this.http.post(
            'http://localhost:3000/transactions/register',
           transaction,
           httpOptions
        ).pipe(map(res => res));
    }

    updateTransaction(updatedTransaction) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
            'http://localhost:3000/transactions/update',
            updatedTransaction,
            httpOptions
        ).pipe(map(res => res));
    }

    updateTransactionWithNewPayment(newPayment) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
            'http://localhost:3000/transactions/payment/register',
            newPayment,
            httpOptions
        ).pipe(map(res => res));
    }

    deleteTransaction(updatedTransaction) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
            'http://localhost:3000/transactions/delete',
            updatedTransaction,
            httpOptions
        ).pipe(map(res => res));
    }


/*************************************************************************************************************************************
 * Labtests Route
 *************************************************************************************************************************************/


    getLabTests() {
        this.loadToken();
        const httpOptions = {headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.authToken
        })};
        return this.http.get(
        'http://localhost:3000/labtests/getall',
        httpOptions
        ).pipe(map(res => res));
    }

    updateLabTests(tests) {
        const httpOptions = {headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
        'http://localhost:3000/labtests/update',
        tests,
        httpOptions
        ).pipe(map(res => res));
    }

    insertNewTest(newTest) {
        const httpOptions = {headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
        'http://localhost:3000/labtests/tests/insert',
        newTest,
        httpOptions
        ).pipe(map(res => res));
    }


/*************************************************************************************************************************************
 * Labtests Route
 *************************************************************************************************************************************/


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
