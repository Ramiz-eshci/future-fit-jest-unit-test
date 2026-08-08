import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalFlagService {

  private _formSubmitted = false;

  setSubmitted(submitted: boolean) {
    this._formSubmitted = submitted;
  }

  isSubmitted(): boolean {
    return this._formSubmitted;
  }
}
