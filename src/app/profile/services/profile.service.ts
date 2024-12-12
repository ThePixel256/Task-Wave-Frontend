import { Injectable } from '@angular/core';
import {BaseService} from "../../shared/services/base.service";
import {Profile} from "../model/profile.entity";
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, retry} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService<Profile>{

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = '/profiles';
  }

  public getByUserId(userId: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.resourcePath()}?userId=${userId}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
