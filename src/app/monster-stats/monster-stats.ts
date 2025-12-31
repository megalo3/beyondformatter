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
            points: { value: 0, disabled: true },
            level: { value: 17, disabled: true },
            proficiency: { value: 4, disabled: true },
            spellHit: { value: 8, disabled: true },
            spellLevel: { value: 6, disabled: true },
            ac: 16,
            hp: 165,
            dmg: 66,
            hit: 9,
            dc: 16,
        });
    }

    crChange() {
        const values: Monster = {
            ...this.chartStats,
            points: 0,
        };
        this.monsterForm.patchValue(values);
    }

    get chartStats(): Monster {
        return npcChart.find((c) => c.cr === this.monsterForm.value.cr) || {};
    }

    statChange() {
        const chartStats = this.chartStats;
        const current = this.monsterForm.value;
        const hpPoints = (Number(chartStats.hp) - current.hp) / 7.5;
        const acPoints = Number(chartStats.ac) - current.ac;
        const dmgPoints = (Number(chartStats.dmg) - current.dmg) / 3;
        const hitAcPoints =
            (Number(chartStats.hit) +
                Number(chartStats.dc) -
                (current.hit + current.dc)) /
            2;
        const points =
            Math.trunc(hpPoints) +
            Math.trunc(acPoints) +
            Math.trunc(dmgPoints) +
            Math.trunc(hitAcPoints);
        this.monsterForm.patchValue({
            points,
            spellHit: current.hit - 1
        });
    }
}
