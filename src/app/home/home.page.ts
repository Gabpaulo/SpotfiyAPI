import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private plt: Platform
  ) {}

  async ngOnInit() {

    await this.plt.ready();
    
  }

  login() {
    this.auth.login();
  }

  reset() {
  localStorage.removeItem('pkce_verifier');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  this.router.navigateByUrl('/home');
}
}
