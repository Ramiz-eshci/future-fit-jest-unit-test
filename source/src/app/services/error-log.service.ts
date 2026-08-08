import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { errorMessage } from '../shared/app.constants';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class ErrorLogService extends ErrorHandler {

  messageConfig = {
    timeOut: 3000,
  };
  invokeEvent: Subject<any> = new Subject();
  constructor(
    private router: Router,
    private _snackBar: MatSnackBar
    // public toastr: ToastrService
  ) {
    super();
  }
  override handleError(error: any) {
    console.log(error, 'error --- 24')
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error.message !== 'undefined' && error.status === 401) {
        // this.toastr.error(error.error.message, '', this.messageConfig);
        if (error.status === 401 && error.error.error == 'unauthorized') {
            Swal.fire({
              title: error.error.error,
              text: error.error.message,
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'Login',
              cancelButtonText: 'No, let me think',
            }).then((result) => {
              if (result.value) {
                console.log('The dialog was closed');
                localStorage.clear();
                localStorage.setItem('loggedIn', 'false');
                this.router.navigate(['/authentication/login'])
                // Swal.fire('Removed!', 'Product removed successfully.', 'success');
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire('Cancelled', 'Product still in our database.)', 'error');
              }
            });
          }else{
            Swal.fire({
              title: error.error.error,
              text: error.error.message,
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'Ok',
              cancelButtonText: 'No, let me think',
            }).then((result) => {
              if (result.value) {
                console.log('The dialog was closed');
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire('Cancelled', 'Product still in our database.)', 'error');
              }
            });
          }
        // Swal.fire('Removed!', 'Product removed successfully.', 'success');
      } else if (typeof error.message !== 'undefined') {
        console.log('error log service 28')
        if (error.status === 404) {
          // this.toastr.error(errorMessage.pageNotFound, '404', this.messageConfig);
        } else if (error.status === 401) {
          localStorage.clear();
          localStorage.setItem('loggedIn', 'false');
          this.ChangeUpdate('Login')
          Swal.fire({
            title: 'Authorization',
            text: errorMessage.tokenError,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'Login',
            cancelButtonText: 'No, let me think',
          }).then((result) => {
            if (result.value) {
              console.log('The dialog was closed');
              localStorage.clear();
              localStorage.setItem('loggedIn', 'false');
              this.router.navigate(['/authentication/login'])
              // Swal.fire('Removed!', 'Product removed successfully.', 'success');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              Swal.fire('Cancelled', 'Product still in our database.)', 'error');
            }
          });
        } else if (error.status === 500) {
          // this.toastr.error(errorMessage.internalServerError, '500', this.messageConfig);
        } else if (error.status === 403) {
          // this.toastr.error(errorMessage.forbidden, '403', this.messageConfig);
        } else if (error.status === 0) {
          // this.toastr.error(errorMessage.unknownError, '0', this.messageConfig);
        } else {
          // this.toastr.error(error.message, '', this.messageConfig);
          if(error.error.errors && error.error.errors != undefined && error.error.errors.length > 0){
            const messages = error.error.errors.map((err: { message: any; }) => err.message).join('\n');
            this._snackBar.open(messages, '', { 
              duration: 2000, 
              verticalPosition: 'top', 
              horizontalPosition: 'end',
              panelClass:['customClass']
            }); 
          }else{
            this._snackBar.open(error.error.message, '', { 
              duration: 2000, 
              verticalPosition: 'top', 
              horizontalPosition: 'end',
              panelClass:['customClass']
            }); 
            
          }
        }
      } else if (typeof error.status !== 'undefined') {
        // this.toastr.error(error.status.toString(), '', this.messageConfig);
      } else {
        // this.toastr.error(errorMessage.httpError, '', this.messageConfig);
      }
    } else if (error instanceof TypeError) {
      console.log('error log service 49')
      if (typeof error.message !== 'undefined' && error.message !== 'Full authentication is required to access this resource') {
        // this.toastr.error(error.message, '', this.messageConfig);
      } else {
        // this.toastr.error(errorMessage.typeError, '', this.messageConfig);
      }
    } else if (error instanceof Error) {
      console.log('error log service 56')
      if (typeof error.message !== 'undefined' && error.message !== 'Full authentication is required to access this resource') {
        // this.toastr.error(error.message, '', this.messageConfig);
      } else {
        // this.toastr.error(errorMessage.generalError, '', this.messageConfig);
      }
    } else if (error instanceof ErrorEvent) {
      console.log('error log service 63')
      if (typeof error.message !== 'undefined' && error.message !== 'Full authentication is required to access this resource') {
        // this.toastr.error(error.message, '', this.messageConfig);
      } else {
        // this.toastr.error(errorMessage.generalError, '', this.messageConfig);
      }
    } else if (typeof error !== 'undefined' && error !== 'Full authentication is required to access this resource') {
      console.log('error log service 70')
      // this.toastr.error(error, '', this.messageConfig);
    }
  }
  handleSuccess(message: any) {
    // this.toastr.success(message, '', this.messageConfig);
  }
  handleWarning(message: any) {
    // this.toastr.warning(message, '', this.messageConfig);
  }
  ChangeUpdate(TypeCalling: any) {
    this.invokeEvent.next(TypeCalling)
  }
}
