import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ICommon, ILogin } from '../shared/interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { appApi, errorMessage } from '../shared/app.constants';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { ErrorLogService } from './error-log.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';
import { RolepermissionService } from './rolepermission.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})


export class UserService {
  private loggedInStatus = 'false';;
  jwtHelper: JwtHelperService = new JwtHelperService();
  // payload = new BehaviorSubject<JwtPayload>(null);
  constructor(private router: Router,
    private http: HttpClient,
    private errorLogService: ErrorLogService,
    private permissionService: RolepermissionService,
    private commonService: CommonService,
    private _snackBar: MatSnackBar) { }

  login(data: any) {
    return this.http.post<ILogin>(appApi.login, data).subscribe(
      (result) => {
        // const key = 'JCH7b1ASHQ2xijsFJCH7b1ASHQ2xijsF'; // must match ENC_KEY used in Node
        const key = `${environment.ENCKey}`; // must match ENC_KEY used in Node
        const decrptedRes = this.decryptPayload(result.data, key);
        console.log(decrptedRes, 'Result Dataaaa')
        if (decrptedRes) {
          localStorage.setItem('Token', result.token);
          localStorage.setItem('loggedIn', 'true');
          //  localStorage.setItem('profile_pic', decrptedRes.logo )
          localStorage.setItem('profile_pic', decrptedRes.profile_pic ?? '/assets/images/profile/user-1.png')
          console.log(decrptedRes.profile_pic ?? '/assets/images/profile/user-1.png', ' Main decrptedRes.profile_pic')
          localStorage.setItem('UserId', decrptedRes.user_id)
          localStorage.setItem('UserName', decrptedRes.first_name + ' ' + decrptedRes.last_name)
          localStorage.setItem('Email', decrptedRes.email)
          localStorage.setItem('RoleID', decrptedRes.role_id)
          localStorage.setItem('CompanyID', decrptedRes.company_id)
          localStorage.setItem('IsHandlingScores', decrptedRes.is_handling_scores)
          this.loadPermissions(decrptedRes.role_id);
          // localStorage.setItem('permissions', JSON.stringify(result.permissions));
          // this.permissionService.setPermissions(result.permissions);
          // document.cookie = `token=${result.token}; path=/`;
          this.saveTokens(result.token)
        }
        // this.commonService.ChangeUpdate('Login')
        // if (result.token) {
        //   this.me()
        // }
        this.router.navigate(['/']);
      },
      (error) => {
        return this.handleError(error);
      }
    );
  }

  loadPermissions(roleId: number) {
    // alert(roleId)
    this.commonService
      .getData(
        'list/getrolepermissions/' + roleId
      )
      .subscribe({
        next: (response: any) => {
          if (response.status) {

            localStorage.setItem(
              'permissions',
              JSON.stringify(response.data)
            );

            this.permissionService
              .setPermissions(response.data);

            this.router.navigate(['/']);

          }

        },

        error: (error) => {
          console.log(error);
        }
      });

  }
  change_password(data: any) {
    let header = new HttpHeaders().set('Content-Type', "application/json");

    header = header.set("Access-Control-Allow-Origin", "*");
    header = header.set("Access-Control-Allow-Headers", "*");
    header = header.set("cache-control", "no-cache");
    header = header.set(
      "Authorization",
      'Bearer ' + localStorage.getItem('Token'),
    )

    return this.http.post<ICommon>(appApi.changePassword, data, { headers: header }).subscribe(
      (result) => {
        this._snackBar.open(result.message, '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          window.location.reload();
          this.logout();
        }, 2000);
      },
      (error) => {
        return this.handleError(error);
      }
    );
  }


  forgot_password(data: any) {
    let header = new HttpHeaders().set('Content-Type', "application/json");

    header = header.set("Access-Control-Allow-Origin", "*");
    header = header.set("Access-Control-Allow-Headers", "*");
    header = header.set("cache-control", "no-cache");
    console.log(header, 'header ---- ')

    return this.http.post<ILogin>(appApi.forgotPassword, data, { headers: header }).subscribe(
      (result) => {
        this._snackBar.open(result.message, '', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['customSuccessClass']
        });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);

      },
      (error) => {
        return this.handleError(error);
      }
    );
  }


  logout() {
    localStorage.clear();
    localStorage.setItem('loggedIn', 'false');
    // this.commonService.ChangeUpdate('Login')
    // this.payload.next(null);
    this.router.navigate(['/authentication/login'])
  }
  get isLoggedIn() {
    return JSON.parse(localStorage.getItem('loggedIn') || this.loggedInStatus.toString())
  }

  get userName() {
    return localStorage.getItem('UserName')
  }
  get UserEmail() {
    return localStorage.getItem('UserEmail')
  }
  get UserID() {
    return localStorage.getItem('UserId')
  }
  get RoleID() {
    return localStorage.getItem('RoleID')
  }
  get CompanyID() {
    return localStorage.getItem('CompanyID')
  }
  get IsHandlingScores() {
    return localStorage.getItem('IsHandlingScores')
  }
  saveTokens(access_token: string) {
    // console.log(this.jwtHelper.decodeToken(access_token), 'this.jwtHelper.decodeToken(access_token)')
    let jwtHelperPayload = this.jwtHelper.decodeToken(access_token)
    localStorage.setItem('authorities', jwtHelperPayload.authorities);
    // this.payload.next(this.jwtHelper.decodeToken(refresh_token));
  }


  private handleError(error: any) {
    // this.spinner.hide();

    if (error.status === 400 && error.error.error == 'unauthorized') {


      localStorage.clear();
      localStorage.setItem('loggedIn', 'false');
      // this.commonService.ChangeUpdate('Login')
      let ErrorMsg = errorMessage.tokenError
      let ButtonText = 'Login'
      if (error.error.error == 'unauthorized') {
        ButtonText = 'Ok'
        ErrorMsg = error.error.error_description
      }

      Swal.fire({

        title: error.error != undefined && error.error.error != 'invalid_token' ? error.error.error : 'Authorization',
        text: error.error != undefined && error.error.error != 'invalid_token' ? error.error.message : errorMessage.tokenError,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: ButtonText,
        cancelButtonText: 'No, let me think',
      }).then((result) => {
        if (result.value) {
          this.router.navigate(['/authentication/login'])
          // Swal.fire('Removed!', 'Product removed successfully.', 'success');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire('Cancelled', 'Product still in our database.)', 'error');
        }
      });
      // this.router.navigate(['/login']);
    } else {
      this.errorLogService.handleError(error);
    }
  }
  decryptPayload(encrypted: { iv: string; data: string }, keyHex: string): any {
    const key = CryptoJS.SHA256(keyHex);
    const iv = CryptoJS.enc.Base64.parse(encrypted.iv);
    const decrypted = CryptoJS.AES.decrypt(encrypted.data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedText);
  }
}
