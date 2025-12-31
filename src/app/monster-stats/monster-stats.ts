import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MonsterSlider } from '../monster-slider/monster-slider';
import { npcChart } from '../npc-chart';
import { Monster } from '../app.interface';

@Component({
    selector: 'app-monster-stats',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatButtonModule,
        MatSliderModule,
        MonsterSlider,
    ],
    templateUrl: './monster-stats.html',
    styleUrl: './monster-stats.scss',
})
export class MonsterStats {
    monsterForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.monsterForm = this.fb.group({
            cr: 10,
            level: 17,
            proficiency: 4,
            ac: 16,
            hp: 165,
            dmg: 66,
            hit: 9,
            dc: 16,
            spellHit: 8,
            spellLevel: 6,
            points: 73,
        });
    }

    crChange() {
        const values: Monster | {} = npcChart.find((c) => c.cr === this.monsterForm.value.cr) || {};
        console.log(values);
        this.monsterForm.patchValue(values);
    }
}
