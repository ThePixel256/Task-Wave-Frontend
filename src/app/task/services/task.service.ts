import { Injectable } from '@angular/core';
import {BaseService} from "../../shared/services/base.service";
import {Task} from "../model/task.entity";
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, retry} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TaskService extends BaseService<Task> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = '/tasks';
  }

  public getAllByBoardId(boardId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.resourcePath()}?boardId=${boardId}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  public patch(id: number, task: Task): Observable<Task> {
    return this.http.patch<Task>(`${this.resourcePath()}/${id}`, JSON.stringify(task), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
