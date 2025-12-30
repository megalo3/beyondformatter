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
        });
    }

    ngOnInit(): void {}

    addAttack() {
        const index = this.damages.length;
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

    getBonusText(bonus: number): string {
        return !bonus ? '' : ` + ${bonus}`;
    }

    get damageMessages(): string {
        const messages = this.damages.controls.map((item) => {
            const [amount, sides, bonus, type] = [
                item.get('amount')?.value,
                item.get('sides')?.value,
                item.get('sides')?.value,
                item.get('type')?.value,
            ];

            return (
                this.getDamageAverage(amount, sides, bonus) +
                ` [rollable](${amount}d${sides}${this.getBonusText(bonus)}); {"diceNotation":"${amount}d${sides}${this.getBonusText(bonus)}","rollType":"damage","rollAction":"${this.attackName}","rollDamageType":"${type}"}[/rollable] ${type} damage`
            );
        });
        return messages.join(' plus ');
    }

    clear(index: number): void {
        this.damages.removeAt(index);
    }
}
