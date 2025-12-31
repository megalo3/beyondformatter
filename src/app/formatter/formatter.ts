import { Component, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
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
import { MatTabsModule } from '@angular/material/tabs';
import { npcChart } from './npc-chart';
interface Damage {
    id: string;
    amount: number;
    sides: number;
    bonus: number;
    type: string;
}
@Component({
    selector: 'app-formatter',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatButtonModule,
        MatTabsModule,
    ],
    templateUrl: './formatter.html',
    styleUrl: './formatter.scss',
})
export class Formatter implements OnInit {
    attackForm: FormGroup;
    markupForm: FormGroup;
    monster = 'Monster';
    cr = 7;
    abilityScore = 18;
    casterClass = 'Wizard';
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
    pronoun = 'They/them';

    get reachText(): string {
        let returnText = '';
        if (this.attackType === 'Melee') {
            returnText += `reach ${this.attackForm.get('reach')?.value} ft.`;
        }
        if (this.attackType.includes('Ranged')) {
            returnText += `range ${this.attackForm.get('range')?.value} ft./${this.attackForm.get('rangeDisadvantage')?.value} ft.`;
        }
        return returnText;
    }

    get damages(): FormArray {
        return this.attackForm.get('damages') as FormArray;
    }

    get saves(): FormArray {
        return this.attackForm.get('saves') as FormArray;
    }

    get attackName(): string {
        return this.attackForm.get('name')?.value;
    }

    get attackType(): string {
        return this.attackForm.get('type')?.value;
    }

    constructor(private fb: FormBuilder) {
        this.attackForm = this.fb.group({
            name: 'Rend',
            type: 'Melee',
            toHit: 9,
            reach: 5,
            range: 20,
            rangeDisadvantage: 60,
            targets: 'one target',
            damages: this.fb.array([
                this.fb.group({
                    id: crypto.randomUUID(),
                    amount: 1,
                    sides: 6,
                    type: 'piercing',
                    bonus: 5,
                }),
            ]),
            saves: this.fb.array([]),
        });

        this.markupForm = this.fb.group({
            type: 'spell',
            list: 'Mage Hand, Prestidigitation',
        });
    }

    ngOnInit(): void {}

    addAttack() {
        this.damages.push(
            this.fb.group({
                id: crypto.randomUUID(),
                amount: 1,
                sides: 6,
                bonus: 0,
                type: 'poison',
            }),
        );
    }

    get damagePerAttack(): number {
        return this.damages.controls.reduce((accumulator, group) => {
            return (
                this.getDamageAverage(
                    group.get('amount')?.value,
                    group.get('sides')?.value,
                    group.get('bonus')?.value,
                ) + accumulator
            );
        }, 0);
    }

    getDamageAverage(amount: number, die: number, bonus = 0): number {
        return Math.floor(((Number(die) + 1) / 2) * Number(amount)) + Number(bonus);
    }

    getBonusText(bonus: number, spaces = ' '): string {
        return !bonus ? '' : `${spaces}+${spaces}${bonus}`;
    }

    get damageMessages(): string {
        const messages = this.damages.controls.map((item) => {
            const [amount, sides, bonus, type] = [
                item.get('amount')?.value,
                item.get('sides')?.value,
                item.get('bonus')?.value,
                item.get('type')?.value,
            ];

            return this.getDamageMarkup(amount, sides, bonus, type);
        });
        return messages.join(' plus ');
    }

    getDamageMarkup(amount: number, sides: number, bonus: number, type: string): string {
        return (
            this.getDamageAverage(amount, sides, bonus) +
            ` [rollable](${amount}d${sides}${this.getBonusText(bonus)}); {"diceNotation":"${amount}d${sides}${this.getBonusText(bonus, '')}","rollType":"damage","rollAction":"${this.attackName}","rollDamageType":"${type}"}[/rollable] ${type} damage`
        );
    }

    get saveMessages(): string {
        const messages = this.saves.controls.map((item) => {
            const [dc, ability, effect] = [
                item.get('dc')?.value,
                item.get('ability')?.value,
                item.get('effect')?.value,
            ];

            return `, and the target must make a DC ${dc} ${ability} saving throw, ${effect}`;
        });
        return messages.join('. ');
    }

    clearDamage(index: number): void {
        this.damages.removeAt(index);
    }

    addSave() {
        this.saves.push(
            this.fb.group({
                id: crypto.randomUUID(),
                dc: 10,
                ability: 'Constitution',
                effect: 'taking 9 (2d8) poison damage on a failed save, or half as much damage on a successful one.',
            }),
        );
    }

    clearSave(index: number): void {
        this.saves.removeAt(index);
    }

    get markupText(): string {
        const [type, list] = [
            this.markupForm.get('type')?.value,
            this.markupForm.get('list')?.value,
        ];
        const items = list.split(/\s*,\s*/).filter((item: string) => item.length > 0);
        return items.length === 0
            ? ''
            : `[${type}]` + items.join(`[/${type}], [${type}]`) + `[/${type}]`;
    }

    getNumberString(n: number): string {
        if (!n) {
            return '0th';
        }
        if (n === 1) {
            return '1st';
        }
        if (n === 2) {
            return '2nd';
        }
        return `${n}th`;
    }

    getProficiency(cr: number): number {
        return Math.ceil(cr / 4) + 1;
    }

    getAbilityMod(n: number): number {
        const calc = (n - 10) / 2;
        return Math.floor(calc);
    }

    get dc(): number {
        return 10 + this.getProficiency(this.cr) + this.getAbilityMod(this.abilityScore);
    }

    get spellAttack(): number {
        return this.dc - 10;
    }

    get pronounPosessive(): string {
        switch (this.pronoun) {
            case 'He/him':
                return 'His';
            case 'She/her':
                return 'Hers';
        }
        return 'Their';
    }

    get spellcastingAbility(): string {
        switch (this.casterClass) {
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

    getSpellLevelFromCr(cr: number): number {
        return npcChart.find((c) => c.CR === cr)?.SpellLevel || 1;
    }

    get spellcastingText(): string {
        return `${this.monster} is a ${this.getNumberString(this.getSpellLevelFromCr(this.cr))}-level spellcaster. ${this.pronounPosessive} spellcasting ability is ${this.spellcastingAbility} (spell save DC ${this.dc}, [rollable]+${this.spellAttack};{"diceNotation":"1d20+${this.spellAttack}","rollType":"to hit","rollAction":"Spellcasting"}[/rollable] to hit with spell attacks). ${this.monster} has the following ${this.casterClass} spells prepared:`;
    }
}
