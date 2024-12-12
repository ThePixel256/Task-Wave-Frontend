import {Injectable, signal} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {SignUpRequest} from "../model/sign-up.request";
import {SignUpResponse} from "../model/sign-up.response";
import {SignInRequest} from "../model/sign-in.request";
import {SignInResponse} from "../model/sign-in.response";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  basePath: string = `${environment.serverBasePath}`;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
  public userId = signal(0);
  public username = signal('');
  public token = signal('');

  constructor(private router: Router, private http: HttpClient) { }


  setUserId(value: number) {
    this.userId.set(value);
    localStorage.setItem('userId', value.toString());
  }

  setUserName(value: string) {
    this.username.set(value);
    localStorage.setItem('username', value);
  }

  setToken(value: string) {
    this.token.set(value);
    localStorage.setItem('token', value);
  }

  refreshData() {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    const username = localStorage.getItem('username') || '';
    const token = localStorage.getItem('token') || '';

    if (this.userId() !== userId) this.userId.set(userId);
    if (this.username() !== username) this.username.set(username);
    if (this.token() !== token) this.token.set(token);
  }

  signUp(signUpRequest: SignUpRequest) {
    return this.http.post<SignUpResponse>(`${this.basePath}/authentication/sign-up`, signUpRequest, this.httpOptions)
      .subscribe({
        next: () => {
          this.router.navigate(['/login']).then();
        },
        error: (error) => {
          console.error(`Error while signing up: ${error.message}`);
          this.router.navigate(['/register']).then();
        }
      });
  }

  signIn(signInRequest: SignInRequest) {
    return this.http.post<SignInResponse>(`${this.basePath}/authentication/sign-in`, signInRequest, this.httpOptions)
      .subscribe({
        next: (response) => {
          this.setUserId(response.id);
          this.setUserName(response.username);
          this.setToken(response.token);
          this.router.navigate(['/']).then();
        },
        error: () => {
          this.setUserId(0);
          this.setUserName('');
          this.setToken('');
          this.router.navigate(['/login']).then();
        }
      });
  }

  signOut() {
    this.router.navigate(['/login']).then(
      () => {
        this.setUserId(0);
        this.setUserName('');
        this.setToken('');
      }
    );
  }
}
