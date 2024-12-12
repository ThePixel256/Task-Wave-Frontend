import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";

export const authenticationGuard: CanActivateFn = () => {
  const router = inject(Router);

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  const isLoggedIn = userId && userId !== '0' &&
    username && username !== '' &&
    token && token !== '';

  if (!isLoggedIn) {
    router.navigate(['/login']).then();
    return false;
  }

  return true;
};
