import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { User, DataTable } from '../models/datatable';
import { appApi, createUrl, errorMessage } from '../shared/app.constants';
import Swal from 'sweetalert2';

import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ErrorLogService } from './error-log.service';
import { Router } from '@angular/router';
import { ICommon } from '../shared/interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient,
    private router: Router,
    private errorLogService: ErrorLogService,
    private _snackBar: MatSnackBar
  ) { }


  // public getDatatable(
  //   url: any,
  //   pageNumber: Number,
  //   pageSize: Number
  // ) {
  //   const finalurl = createUrl(url) + `?page=${pageNumber}&per_page=${pageSize}`;

  //   return this.http.get<DataTable>(finalurl).subscribe(
  //     (result) => {
  //       return result;
  //     },
  //     (error) => {
  //       return this.handleError(error);
  //     }
  //   );;
  // }


  // getHeader(isJson: any = false, isLng: any = false, isContent: any = false) {
  //   let isLogin = localStorage.getItem('Token') != undefined
  //   let header: any = {}
  //   header = isLogin ? new HttpHeaders().set(
  //     "Authorization", 'Bearer ' + localStorage.getItem('Token'),
  //   ) : {}
  //   if (isLogin && isJson) {
  //     header.set("content-type", "application/json")
  //   }
  //   if (isLogin && isLng) {
  //     header.set('Accept-Language', "en-US,en;q=0.9,en-GB;q=0.8")
  //   }
  //   if (isLogin && isContent) {
  //     header.set('Content-Type', "application/json")
  //   }
  //   header.set('Accept-Encoding', "gzip, deflate, br")

  //   return header;
  // }
  getHeader(
    isJson: boolean = false,
    isLng: boolean = false,
    isContent: boolean = false
  ): HttpHeaders {

    const isLogin = localStorage.getItem('Token') !== undefined;

    let header = new HttpHeaders();

    if (isLogin) {
      header = header.set(
        'Authorization',
        'Bearer ' + localStorage.getItem('Token')
      );
    }

    if (isLogin && isJson) {
      header = header.set('Content-Type', 'application/json');
    }

    if (isLogin && isLng) {
      header = header.set(
        'Accept-Language',
        'en-US,en;q=0.9,en-GB;q=0.8'
      );
    }

    if (isLogin && isContent) {
      header = header.set('Content-Type', 'application/json');
    }

    return header;
  }

  public getDatatable(url: any, pageNumber: Number, pageSize: Number): Observable<DataTable | null> {
    const finalurl = `${createUrl(url)}?page=${pageNumber}&per_page=${pageSize}`;

    return this.http.get<DataTable>(finalurl, { headers: this.getHeader() }).pipe(
      catchError((error) => {
        this.handleError(error);
        return of(null); // Use 'of' to return an empty observable in case of an error
      })
    );
  }
  public getDatatableFilter(url: any, pageNumber: Number, pageSize: Number, filter: string): Observable<DataTable | null> {
    const finalurl = `${createUrl(url)}?page=${pageNumber}&per_page=${pageSize}&filter=${filter}`;

    return this.http.get<DataTable>(finalurl, { headers: this.getHeader() }).pipe(
      catchError((error) => {
        this.handleError(error);
        return of(null); // Use 'of' to return an empty observable in case of an error
      })
    );
  }
  public getDatatableFilterCompanyDetails(url: any, pageNumber: Number, pageSize: Number, filter: string, compnay_id: string): Observable<DataTable | null> {
    const finalurl = `${createUrl(url)}?page=${pageNumber}&per_page=${pageSize}&filter=${filter}&company_id=${compnay_id}`;

    return this.http.get<DataTable>(finalurl, { headers: this.getHeader() }).pipe(
      catchError((error) => {
        this.handleError(error);
        return of(null); // Use 'of' to return an empty observable in case of an error
      })
    );
  }

  //Add Data
  // addData(method: any, data: any): Observable<ICommon> {

  //   let header = new HttpHeaders().set(
  //     "Authorization",
  //     '' + localStorage.getItem('token_type') + ' ' + localStorage.getItem('Token'),
  //   ).set("content-type", "application/json");
  //   return this.http.post<ICommon>(createUrl(method), data, { headers: header })
  //     .pipe(
  //       map((response) => {
  //         return response;
  //       }),
  //       catchError(this.handleError(this))
  //     );
  // }

  addData(method: any, data: any): Observable<ICommon> {
    let header = new HttpHeaders().set(
      "Authorization",
      'Bearer ' + localStorage.getItem('Token'),
    );
    return this.http.post<ICommon>(createUrl(method), data, { headers: header })
      .pipe(
        map((response) => response),
        catchError((error) => this.handleErrorNew(error)) // Handle errors here
      );
  }

  public handleErrorNew(error: any) {
    // Handle specific error status
    if (error.status === 400 && error.error?.error === 'unauthorized') {
      localStorage.clear();
      localStorage.setItem('loggedIn', 'false');

      let ErrorMsg = errorMessage.tokenError;
      let ButtonText = 'Login';

      if (error.error?.error === 'unauthorized') {
        ButtonText = 'Ok';
        ErrorMsg = error.error?.error_description;
      }

      Swal.fire({
        title: error.error?.error !== 'invalid_token' ? error.error?.error : 'Authorization',
        text: error.error?.error !== 'invalid_token' ? error.error?.message : ErrorMsg,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: ButtonText,
        cancelButtonText: 'No, let me think',
      }).then((result) => {
        if (result.value) {
          this.router.navigate(['/authentication/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire('Cancelled', 'Product still in our database.', 'error');
        }
      });
    } else {
      // Log the error using the errorLogService
      console.log(error.error.errors);
      // console.log(Object.keys(error.error.data).length);
      if (!error.error.status && error.error.errors && Object.keys(error.error.errors).length > 0) {
        // const values = Object.values(error.error.errors);
        const values = error.error.errors;
        console.log(values, 'values')
        console.log(error.error.errors, 'error.error.errors')
        let err: any = []
        // values.forEach(value => {
        //   console.log(value);
        //   const stringValue: string = value as string;
        //   err.push(stringValue);
        // });
        Object.keys(values).forEach((key) => {
          const errorItem = values[key];
          err.push(this.formatErrorMessage(key, errorItem));
        });
        if (err.length > 0) {
          let eeee = err.join('\n')
          this._snackBar.open(eeee, '', {
            duration: 10000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['customClass']
          });
        }
      } else {
        this.errorLogService.handleError(error);
      }
    }
    return throwError(error)

  }

  public handleError(error: any) {
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
    return throwError(() => new Error('An error occurred; please try again later.'));
  }



  getData(method: any): Observable<ICommon> {

    let header = new HttpHeaders().set(
      "Authorization",
      'Bearer ' + localStorage.getItem('Token'),
    ).set("content-type", "application/json");
    return this.http.get<any>(createUrl(method), { headers: header })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => this.handleErrorNew(error))
      );
  }
  postData(method: any, body: any): Observable<ICommon> {
    let header = new HttpHeaders()
      .set("Authorization", 'Bearer ' + localStorage.getItem('Token'))
      .set("content-type", "application/json");

    return this.http.post<any>(createUrl(method), body, { headers: header })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => this.handleErrorNew(error))
      );
  }


  getDropdownData<T = ICommon>(method: string): Observable<T> {
    const header = new HttpHeaders()
      .set("Authorization", 'Bearer ' + localStorage.getItem('Token'))
      .set("content-type", "application/json");

    return this.http.get<T>(createUrl(method), { headers: header }).pipe(
      map((response) => response), // This map is redundant but kept for consistency
      catchError((error) => this.handleErrorNew(error))
    );
  }
  deleteData(method: any) {
    return this.http.delete(createUrl(method), { headers: this.getHeader() }).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => this.handleErrorNew(error))
    );
  }

  private formatErrorMessage(key: string, errorItem: any): string {
    let formattedKey = key;
    const keyParts = key.split('.');

    if (keyParts[0] === 'sites' && !isNaN(Number(keyParts[1]))) {
      const siteIndex = Number(keyParts[1]) + 1; // Convert to 1-based index
      const fieldName = keyParts.slice(2).join(' ');
      formattedKey = `Site ${siteIndex} - ${this.capitalize(fieldName)}`;
    }

    const message = this.extractErrorMessage(errorItem);
    return `${formattedKey}: ${message}`;
  }

  /**
   * Extracts the `message` property from an error object or returns a string directly.
   */
  private extractErrorMessage(errorItem: any): string {
    if (typeof errorItem === 'object' && errorItem !== null && errorItem.message) {
      return errorItem.message;
    }
    return String(errorItem);
  }

  /**
   * Capitalizes the first letter of each word.
   */
  private capitalize(text: string): string {
    return text.replace(/([A-Za-z0-9]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1));
  }
}
