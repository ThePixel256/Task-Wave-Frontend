import { Injectable } from '@angular/core';
import {BaseService} from "../../shared/services/base.service";
import {Board} from "../model/board.entity";
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, retry} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BoardService extends BaseService<Board>{

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = '/boards';
  }

  public getAllByOwnerId(ownerId: number): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.resourcePath()}?ownerId=${ownerId}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  public getAllByMemberId(memberId: number): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.resourcePath()}?memberId=${memberId}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
