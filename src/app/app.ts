import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './menu/menu';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Menu],
    templateUrl: './app.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('dndbeyond');
}
