import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  get(url: string, options: any = {}): Observable<any> {
    return this.request('GET', url, {}, options);
  }

  post(url: string, body: any = {}, options: any = {}): Observable<any> {
    return this.request('POST', url, body, options);
  }

  delete(url: string, options: any = {}): Observable<any> {
    return this.request('DELETE', url, {}, options);
  }

  private request(method: string, url: string, body: any, options: any) {
    return this.http.request(method, this.getUrl(url, options), {
      ...this.getRequestOptions(options),
      responseType: options.responseType ? options.responseType : 'json',
      body: this.getPostBody(body),
    })
      .pipe(
        map(result => this.successHandler(result)),
        catchError(error => this.errorHandler(error)),
      );
  }

  private getUrl(url: string, options: any) {
    if (options.api2) {
      return `api/${url}`;
    }

    return url;
  }

  private getRequestOptions(options: any) {
    const requestOptions: any = {};

    requestOptions.headers = new HttpHeaders();

    if (options.type === 'json') {
      requestOptions.headers = requestOptions.headers.append('Content-Type', 'application/json');
    }

    if (options.params) {
      requestOptions.params = options.params;
    }

    return requestOptions;
  }

  private getPostBody(body: any) {
    const formData = new FormData();

    Object.keys(body).forEach(key => formData.append(key, body[key]));

    return formData;
  }

  private successHandler(result: any) {
    if (typeof result === 'string' && result === 'manager token is null') {
      throw new Error(result);
    }

    return result;
  }

  private errorHandler(error: HttpErrorResponse) {
    if (error.url && !error.url.includes('checkLogin')) {
      if (error.error.includes('Unauthorized')) {
        this.router.navigate(['login']);
      }

      if (error.error.includes('change password')) {
        this.router.navigate(['settings/password']);
      }
    }

    return throwError(error);
  }
}
