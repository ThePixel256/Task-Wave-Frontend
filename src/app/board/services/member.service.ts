import { Injectable } from '@angular/core';
import {BaseService} from "../../shared/services/base.service";
import {Member} from "../model/member.entity";
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, retry} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseService<Member> {
  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = '/boards';
  }

  public createMember(item: Member, boardId: number): Observable<Member> {
    return this.http.post<Member>(`${this.resourcePath()}/${boardId}/members`, item, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
