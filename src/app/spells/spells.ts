import { Component } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Monster } from '../app.interface';
import { NgClass } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MonsterService } from '../monster.service';
import { spellChart } from "../spell-chart";

@Component({
    selector: 'app-spells',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatButtonModule,
        NgClass,
    ],
    templateUrl: './spells.html',
    styleUrl: './spells.scss',
})
export class SpellsComponent {
    spellForm: FormGroup;

    classes = [
        'Artificer',
        'Barbarian',
        'Bard',
        'Cleric',
        'Druid',
        'Fighter',
        'Monk',
        'Paladin',
        'Ranger',
        'Rogue',
        'Sorcerer',
        'Warlock',
        'Wizard',
    ];
    pronouns = ['He/him', 'She/her', 'They/them'];

    get spells(): FormArray {
        return this.spellForm.get('spells') as FormArray;
    }

    constructor(
        private fb: FormBuilder,
        public monsterService: MonsterService,
    ) {
        this.spellForm = this.fb.group({
            version: '2024',
            monster: 'Monster',
            cr: 7,
            abilityScore: 18,
            casterClass: 'Wizard',
            pronoun: 'They/them',
            spellAtWill: 'Mage Hand, Prestidigitation',
            spells: this.fb.array(this.#getSpellsArray(4)),
        });
    }

    #getSpellsArray(n: number): FormGroup[] {
        return [
            ...[...Array(n).keys()].map(() =>
                this.fb.group({
                    id: crypto.randomUUID(),
                    list: '',
                }),
            ),
        ];
    }

    get chartStats(): Monster {
        return this.monsterService.getChartStats(this.spellForm.value.cr);
    }

    get dc(): number {
        return this.chartStats.dc || 10;
    }

    get spellAttack(): number {
        return this.chartStats.spellHit || 10;
    }

    get pronounPosessive(): string {
        switch (this.spellForm.value.pronoun) {
            case 'He/him':
                return 'His';
            case 'She/her':
                return 'Hers';
        }
        return 'Their';
    }

    get spellcastingAbility(): string {
        switch (this.spellForm.value.casterClass) {
            case 'Artificer':
            case 'Wizard':
            case 'Warlock':
                return 'Intelligence';
            case 'Bard':
            case 'Paladin':
            case 'Sorcerer':
                return 'Charisma';
            case 'Cleric':
            case 'Druid':
            case 'Ranger':
                return 'Wisdom';
        }
        return 'Intelligence';
    }

    get spellLevelFromCr(): number {
        return this.chartStats.spellLevel || 1;
    }
    get casterLevelFromCr(): number {
        return this.chartStats.level || 1;
    }

    get spellcastingText(): string {
        return `${this.spellForm.value.monster} casts one of the following spells, requiring no Material components and using ${this.spellcastingAbility} (spell save DC ${this.dc}, [rollable]+${this.spellAttack};{"diceNotation":"1d20+${this.spellAttack}","rollType":"to hit","rollAction":"Spellcasting"}[/rollable] to hit with spell attacks):`;
    }

    getSpellLevelLabel(n: number): string {
        switch (this.spellForm.value.version) {
            case '2024':
                if (n === 0) {
                    return 'At Will';
                }
                return `${n}/Day Each`;
            case '2014':
                if (n === 0) {
                    return 'Cantrips (at will)';
                }
                return `${this.monsterService.getNumberString(n)} level (# slots)`;
                break;
        }
        return '';
    }

    versionChange() {
        while (this.spells.length !== 0) {
            this.spells.removeAt(0);
        }

        const count = this.spellForm.value.version === '2024' ? 4 : 10;
        this.spells.push(this.#getSpellsArray(count));

        console.log(this.spellForm.value);
    }
}
