import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterPatientComponent } from './components/patient/register-patient/register-patient.component';
import { RegisterUserComponent } from './components/user/register-user/register-user.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';

import { ValidateService } from './services/validate.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { FlashMessagesModule } from 'flash-messages-angular';
import { LabtestComponent } from './components/labtest/labtest.component';
import { TransactionComponent } from './components/transaction/transaction.component';
import { LabresultComponent } from './components/labresult/labresult.component';
import { TransactionhistoryComponent } from './components/transactionhistory/transactionhistory.component';
import { UrinalysisComponent } from './components/result-forms/urinalysis/urinalysis.component';
import { HematologyComponent } from './components/result-forms/hematology/hematology.component';
import { BloodChemistryComponent } from './components/result-forms/blood-chemistry/blood-chemistry.component';
import { FecalysisComponent } from './components/result-forms/fecalysis/fecalysis.component';
import { SerologyComponent } from './components/result-forms/serology/serology.component';
import { ListPatientComponent } from './components/patient/list-patient/list-patient.component';
import { InfoPatientComponent } from './components/patient/info-patient/info-patient.component';
import { ChangePasswordComponent } from './components/user/change-password/change-password.component';


const appRoutes: Routes = [
  {path:'', component: HomeComponent},
  {path:'user/register', component: RegisterUserComponent, canActivate: [AuthGuard]},
  {path:'user/password/update', component: ChangePasswordComponent, canActivate: [AuthGuard]},
  {path:'patient/register', component: RegisterPatientComponent, canActivate: [AuthGuard]},
  {path:'patient/list', component: ListPatientComponent, canActivate: [AuthGuard]},
  {path:'patient/info', component: InfoPatientComponent, canActivate: [AuthGuard]},
  {path:'login', component: LoginComponent},
  {path:'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path:'transaction/management', component: TransactionComponent, canActivate: [AuthGuard]},
  {path:'labresult/management', component: LabresultComponent, canActivate: [AuthGuard]},
  {path:'labresult/management/temp', component: LoginComponent, canActivate: [AuthGuard]},
  {path:'labtest/management', component: LabtestComponent, canActivate: [AuthGuard]},
  {path:'transaction/history', component: TransactionhistoryComponent, canActivate: [AuthGuard]},
  {path:'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path:'forms/urinalysis', component: UrinalysisComponent, canActivate: [AuthGuard]},
  {path:'forms/hematology', component: HematologyComponent, canActivate: [AuthGuard]},
  {path:'forms/fecalysis', component: FecalysisComponent, canActivate: [AuthGuard]},
  {path:'forms/serology', component: SerologyComponent, canActivate: [AuthGuard]},
  {path:'forms/blood-chemistry', component: BloodChemistryComponent, canActivate: [AuthGuard]},
]

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterPatientComponent,
    RegisterUserComponent,
    HomeComponent,
    DashboardComponent,
    ProfileComponent,
    TransactionComponent,
    LabresultComponent,
    LabtestComponent,
    TransactionhistoryComponent,
    UrinalysisComponent,
    HematologyComponent,
    BloodChemistryComponent,
    FecalysisComponent,
    SerologyComponent,
    ListPatientComponent,
    ChangePasswordComponent,
    InfoPatientComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    FlashMessagesModule.forRoot()
  ],
  providers: [
    ValidateService,
    AuthGuard,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
