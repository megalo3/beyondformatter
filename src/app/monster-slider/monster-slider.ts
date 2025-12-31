import { Component, Input, OnInit, Optional, SkipSelf } from '@angular/core';
import {
    ControlContainer,
    FormBuilder,
    FormControl,
    FormGroupDirective,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

@Component({
    selector: 'app-monster-slider',
    imports: [ReactiveFormsModule, FormsModule, MatSliderModule, MatInputModule],
    templateUrl: './monster-slider.html',
    styleUrl: './monster-slider.scss',
})
export class MonsterSlider implements OnInit {
    @Input() name = '';
    @Input() min = 0;
    @Input() max = 30;
    @Input() label = '';

    control: FormControl;

    constructor(
        @Optional() @SkipSelf() private controlContainer: ControlContainer,
        public form: FormGroupDirective,
        private fb: FormBuilder,
    ) {
        this.control = fb.control({});
    }

    ngOnInit(): void {
        if (this.controlContainer) {
            if (this.name) {
                const control = this.controlContainer.control?.get(this.name);
                if (!control) {
                    throw new Error(`Control '${this.name}' does not exist on the FormGroup.`);
                }
                this.control = control as FormControl;
            }
        } else {
            console.warn(`Can't find parent FormGroup directive`);
            return;
        }
    }

    detect() {
        this.control.setValue(this.control.value);
    }
}
