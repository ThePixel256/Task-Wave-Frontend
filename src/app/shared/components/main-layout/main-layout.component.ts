import {Component, inject} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {Router, RouterOutlet} from "@angular/router";
import {AuthenticationService} from "../../../iam/services/authentication.service";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    RouterOutlet,
    MatToolbar
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private authenticationService: AuthenticationService = inject(AuthenticationService);
  protected username = this.authenticationService.username;
  private router: Router = inject(Router);

  constructor() {
    this.authenticationService.refreshData();
  }

  protected logout() {
    this.authenticationService.signOut();
  }

  protected navigateToHome() {
    this.router.navigate(['/']).then();
  }
}

