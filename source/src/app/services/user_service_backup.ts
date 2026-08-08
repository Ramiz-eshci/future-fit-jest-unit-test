import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ILogin } from '../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { appApi, errorMessage } from '../shared/app.constants';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';
// import Swal from 'sweetalert2';
// import { ErrorLogService } from './error-log.service';

@Injectable({
  providedIn: 'root'
})

interface JwtPayload {
  exp: number;
  user_name: string;
  jti: string;
  client_id: string;
  scope: string[];
  authorities?: string[];
}

export class UserService {
  private isAuthenticated = false;
  jwtHelper: JwtHelperService = new JwtHelperService();
  // payload = new BehaviorSubject<JwtPayload>(null);
  constructor(private router:Router,private http: HttpClient) { }
  login(username: string, password: string): boolean {
    // Implement your login logic here
    console.log('12 ---- ')
    if (username === 'admin' && password === 'admin') { // Example check
      this.isAuthenticated = true;
      console.log('14 ---- ')
      this.router.navigate(['/']);
      return true;
    }
    return false;
  }

  loginNew(data:any){
    return this.http.post<ILogin>(appApi.login, data).subscribe(
      (result) => {
        localStorage.setItem('Token', result.token);
        sessionStorage.setItem('loggedIn', 'true');
        localStorage.setItem('loggedIn', 'true');
        this.saveTokens(result.token)
        // this.commonService.ChangeUpdate('Login')
        // if (result.token) {
        //   this.me()
        // }
      },
      (error) => {
        return this.handleError(error);
      }
    );
  }

  logout(): void {
    this.isAuthenticated = false;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
  saveTokens(access_token: string) {
    console.log(this.jwtHelper.decodeToken(access_token),'this.jwtHelper.decodeToken(access_token)')
    let jwtHelperPayload = this.jwtHelper.decodeToken(access_token)
    localStorage.setItem('authorities', jwtHelperPayload.authorities);
    // this.payload.next(this.jwtHelper.decodeToken(refresh_token));
  }

  
  private handleError(error: any) {
    // this.spinner.hide();

    if (error.status === 401) {
    

      localStorage.clear();
      localStorage.setItem('loggedIn', 'false');
      // this.commonService.ChangeUpdate('Login')
      let ErrorMsg = errorMessage.tokenError
      let ButtonText = 'Login'
      if(error.error.error == 'unauthorized'){
        ButtonText = 'Ok'
        ErrorMsg = error.error.error_description
      }

      Swal.fire({

        title: error.error != undefined && error.error.error != 'invalid_token' ?error.error.error: 'Authorization',
        text: error.error != undefined && error.error.error != 'invalid_token' ?error.error.error_description: errorMessage.tokenError,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: ButtonText,
        cancelButtonText: 'No, let me think',
      }).then((result) => {
        if (result.value) {
          this.router.navigate(['/login'])
          // Swal.fire('Removed!', 'Product removed successfully.', 'success');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire('Cancelled', 'Product still in our database.)', 'error');
        }
      });
      // this.router.navigate(['/login']);
    }else{
      this.errorLogService.handleError(error);
    }
  }
  
}
