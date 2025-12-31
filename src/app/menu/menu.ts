import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterModule, MatButtonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {

}
