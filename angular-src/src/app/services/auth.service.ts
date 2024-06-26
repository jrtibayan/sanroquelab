import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";
import { Utilities } from '../../app/shared/utilities.functions';

import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})


export class AuthService {
    private apiUrl = environment.apiUrl;
    authToken: any;
    user: any;

    public utilities = Utilities;

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


    changeUserPassword(userInput) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
            `${this.apiUrl}/users/password/update`,
            userInput,
            httpOptions
        ).pipe(map(res => res));
    }


    resetUserPassword(userInput) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })};
        return this.http.post(
            `${this.apiUrl}/users/password/reset`,
            userInput,
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


    getAllActivePatientsByName(filterName: string, maxPatient = 0, pageNumber = 0) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};

        let url = `${this.apiUrl}/patients/getall/active?name=${filterName}`;
        url += `&max=${maxPatient}`;
        url += `&page=${pageNumber}`;

        return this.http.get(
            url,
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

    getTransactionsByDate(startDate: string, endDate: string) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            `${this.apiUrl}/transactions/getbydate?startDate=${startDate}&endDate=${endDate}`,
            httpOptions
        ).pipe(map(res => res));
    }

    registerTransaction(transaction) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        this.utilities.dlog(' going to /transactions/register from auth service');
        this.utilities.dlog(' authorization');
        this.utilities.dlog(localStorage.getItem('id_token'));
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

    getPendingResult(startDate: string = '1900-01-01', endDate: string = '3000-12-31') {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            `${this.apiUrl}/testresults/getbydate?startDate=${startDate}&endDate=${endDate}&status=Incomplete`,
            httpOptions
        ).pipe(map(res => res));
    }

    getFinalResult(startDate: string = '1900-01-01', endDate: string = '3000-12-31') {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            `${this.apiUrl}/testresults/getbydate?startDate=${startDate}&endDate=${endDate}&status=Ready`,
            httpOptions
        ).pipe(map(res => res));
    }

    getFinalResultById(patientId: string) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': this.authToken
        })};
        return this.http.get(
            `${this.apiUrl}/testresults/getall?id=${patientId}`,
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

    registerUrinalysisResult(result) {
        const httpOptions = {headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': localStorage.getItem('id_token')
        })};
        return this.http.post(
            `${this.apiUrl}/testresults/urinalysis/register`,
            result,
            httpOptions
        ).pipe(map(res => res));
    }

    updateUrinalysisResult(id: string, updatedResult: any) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('id_token')
            })
        };

        return this.http.put(
            `${this.apiUrl}/testresults/urinalysis/update/${id}`,
            updatedResult,
            httpOptions
        ).pipe(map(res => res));
    }

/*************************************************************************************************************************************
 * Labtests Route
 *************************************************************************************************************************************/


    storeUserData(token, user) {
        localStorage.setItem('id_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.authToken = token || '';
        this.user = user;
    }


    loadToken() {
        const token = localStorage.getItem('id_token');
        this.authToken = token || '';
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
