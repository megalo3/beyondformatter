import { Component, signal } from '@angular/core';
import { Formatter } from './formatter/formatter';

@Component({
    selector: 'app-root',
    imports: [Formatter],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('dndbeyond');
}
