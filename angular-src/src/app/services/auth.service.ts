import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";

import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})


export class AuthService {
    private apiUrl = environment.apiUrl;
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
            `${this.apiUrl}/users/register`,
            user,
            httpOptions
        ).pipe(map(res => res));
    }


    authenticateUser(user) {
        const httpOptions = {headers: new HttpHeaders({
        'Content-Type':  'application/json'
        })};
        return this.http.post(
            `${this.apiUrl}/users/authenticate`,
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
            `${this.apiUrl}/users/profile`,
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
            `${this.apiUrl}/patients/register`,
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
            `${this.apiUrl}/patients/getall/active`,
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
            `${this.apiUrl}/transactions/getall`,
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
            `${this.apiUrl}/transactions/register`,
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
            `${this.apiUrl}/transactions/update`,
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
            `${this.apiUrl}/transactions/payment/register`,
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
            `${this.apiUrl}/transactions/delete`,
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
            `${this.apiUrl}/labtests/getall`,
            httpOptions
        ).pipe(map(res => res));
    }

    updateLabTests(tests) {
        const httpOptions = {headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
            `${this.apiUrl}/labtests/update`,
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
            `${this.apiUrl}/labtests/tests/insert`,
            newTest,
            httpOptions
        ).pipe(map(res => res));
    }

    getPendingTests() {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            `${this.apiUrl}/labtests/pending/getall`,
            httpOptions
        ).pipe(map(res => res));
    }

    getFinalizedResults() {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            `${this.apiUrl}/testresults/getall`,
            httpOptions
        ).pipe(map(res => res));
    }


/*************************************************************************************************************************************
 * TestResult Route
 *************************************************************************************************************************************/

    addResult(result) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
            `${this.apiUrl}/testresults/register`,
            result,
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
