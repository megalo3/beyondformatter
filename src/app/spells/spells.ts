import { Component, computed, effect } from '@angular/core';
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
import { NgClass } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MonsterService } from '../monster.service';
import { spellChart } from '../spell-chart';

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

    get spells(): FormArray {
        return this.spellForm.get('spells') as FormArray;
    }

    constructor(
        private fb: FormBuilder,
        public monsterService: MonsterService,
    ) {
        this.spellForm = this.fb.group({
            version: '2024',
            abilityScore: 18,
            casterClass: 'Wizard',
            spellAtWill: 'Mage Hand, Prestidigitation',
            spells: this.fb.array(this.#getSpellsArray(4)),
        });
        effect(() => {
            console.log(`Challenge Rating changed to  ${this.monsterService.cr()}`);
            this.versionChange();
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

    get dc(): number {
        return this.monsterService.chartStats().dc!;
    }

    get spellAttack(): number {
        return this.monsterService.chartStats().spellHit!;
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

    get casterLevel(): number {
        return this.monsterService.chartStats().level!;
    }

    get spellcastingText(): string {
        return `${this.monsterService.name()} casts one of the following spells, requiring no Material components and using ${this.spellcastingAbility} (spell save DC ${this.dc}, [rollable]+${this.spellAttack};{"diceNotation":"1d20+${this.spellAttack}","rollType":"to hit","rollAction":"Spellcasting"}[/rollable] to hit with spell attacks):`;
    }

    get spellcastingText2014(): string {
        return `${this.monsterService.name()} is a ${this.monsterService.getNumberString(this.casterLevel)}-level spellcaster. ${this.monsterService.posessivePronoun()} spellcasting ability is ${this.spellcastingAbility} (spell save DC ${this.dc}, [rollable]+${this.spellAttack};{"diceNotation":"1d20+${this.spellAttack}","rollType":"to hit","rollAction":"Spellcasting"}[/rollable] to hit with spell attacks). ${this.monsterService.name()} has the following ${this.spellForm.value.casterClass} spells prepared:`;
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
                return `${this.monsterService.getNumberString(n)} level (${this.spellLevels2014()[n]} slots)`;
        }
        return '';
    }

    versionChange() {
        while (this.spells.length !== 0) {
            this.spells.removeAt(0);
        }
        const count = this.spellForm.value.version === '2024' ? 4 : 10;
        this.spells.push(this.#getSpellsArray(count));
    }

    spellLevels2014 = computed<number[]>(() => {
        const casterLevel = this.monsterService.chartStats().level!;
        const pure = [...spellChart.pure[casterLevel]];
        const partial = [...spellChart.partial[casterLevel]];

        switch (this.spellForm.value.casterClass) {
            case 'Cleric':
            case 'Wizard':
                return pure;
            case 'Bard':
            case 'Druid':
                pure[0] = pure[0] - 1;
                return pure;
            case 'Sorcerer':
                pure[0] = pure[0] + 1;
                return pure;
            case 'Warlock':
                return Array.from(Array(this.monsterService.chartStats().spellLevel).keys()).map(
                    () => 5,
                );
            case 'Artificer':
                return partial;
            case 'Paladin':
            case 'Ranger':
                partial[0] = 0;
                return partial;
            case 'Rogue':
                return [...spellChart.arcaneTrickster[casterLevel]];
        }
        return Array.from(Array(casterLevel).keys()).map(() => 0);
    });
}
