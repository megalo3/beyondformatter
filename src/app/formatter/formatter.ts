import { Component, computed, effect, OnInit, signal } from '@angular/core';
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
import { SpellsComponent } from '../spells/spells';
import { MonsterService } from '../monster.service';

@Component({
    selector: 'app-formatter',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatButtonModule,
        SpellsComponent,
    ],
    templateUrl: './formatter.html',
    styleUrl: './formatter.scss',
})
export class Formatter {
    attackForm: FormGroup;
    markupForm: FormGroup;
    hitDiceType = signal<number>(8);
    hideDiceTypeChange(n: number) {
        this.hitDiceType.set(n);
    }
    hitpoints = signal<number>(165);
    hitpointsChange(n: number) {
        this.hitpoints.set(n);
    }
    hitDiceAmount = signal<number>(5);
    hitDiceAmountChange(n: number) {
        this.hitDiceAmount.set(n);
    }

    hitpointsModifier = computed<number>(() => {
        const hitDiceModifier = (this.hitDiceType() + 1) / 2;
        const calculatedHp = this.hitDiceAmount() * hitDiceModifier;
        return Math.trunc(this.hitpoints() - calculatedHp);
    });

    get reachText(): string {
        let returnText = '';
        if (this.attackProximity === 'Melee') {
            returnText += `reach ${this.attackForm.value.reach} ft.`;
        }
        if (this.attackProximity.includes('Ranged')) {
            returnText +=
                `range ${this.attackForm.value.range} ft.` +
                (this.attackForm.value.rangeDisadvantage
                    ? `/${this.attackForm.value.rangeDisadvantage} ft.`
                    : '');
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

    get attackProximity(): string {
        return this.attackForm.get('proximity')?.value;
    }

    constructor(
        private fb: FormBuilder,
        public monsterService: MonsterService,
    ) {
        this.attackForm = this.fb.group({
            name: 'Rend',
            proximity: 'Melee',
            type: 'Weapon',

            toHit: 9,
            reach: 5,
            range: 20,
            rangeDisadvantage: 60,
            targets: 'one target',
            numberOfAttacks: 2,
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

        effect(() => {
            console.log(`Challenge Rating changed to  ${this.monsterService.cr()}`);
            this.hitpoints.set(this.monsterService.chartStats().hp!);
            this.hitDiceAmount.set(this.monsterService.cr() * 2);
        });
    }

    crChange(cr: number) {
        this.monsterService.cr.set(cr);
        this.attackForm.patchValue({
            toHit: this.monsterService.chartStats().hit,
        });
        this.damages.at(0).get('bonus')?.setValue(this.monsterService.damageBonus());
    }

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

    get totalAttackDamage(): number {
        return this.damagePerAttack * Number(this.attackForm.get('numberOfAttacks')?.value);
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

            return `, and the target must succeed on a DC ${dc} ${ability} saving throw, ${effect}`;
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
                dc: this.monsterService.chartStats().dc,
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
        return this.monsterService.getMarkupText(type, list);
    }

    getProficiency(cr: number): number {
        return Math.ceil(cr / 4) + 1;
    }

    getAbilityMod(n: number): number {
        const calc = (n - 10) / 2;
        return Math.floor(calc);
    }
}
