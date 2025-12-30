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
    ],
    templateUrl: './formatter.html',
    styleUrl: './formatter.scss',
})
export class Formatter implements OnInit {
    attackForm: FormGroup;

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
            ` [rollable](${amount}d${sides}${this.getBonusText(bonus)}); {"diceNotation":"${amount}d${sides}${this.getBonusText(bonus,'')}","rollType":"damage","rollAction":"${this.attackName}","rollDamageType":"${type}"}[/rollable] ${type} damage`
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
}
