import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Damage {
    index: number;
    amount: number;
    sides: number;
    bonus: number;
    type: string;
}
@Component({
    selector: 'app-formatter',
    imports: [FormsModule],
    templateUrl: './formatter.html',
    styleUrl: './formatter.scss',
})
export class Formatter {
    attackName = 'Rend';
    attackType = ['Melee'];
    toHit = 9;
    reach = 5;
    rangeReach1 = 20;
    rangeReach2 = 60;
    targets = 'one target';
    damages: Damage[] = [
        {
            index: 1,
            amount: 1,
            sides: 6,
            bonus: 5,
            type: 'piercing',
        },
    ];

    addAttack() {
        this.damages.push({
            index: this.damages.length + 1,
            amount: 1,
            sides: 6,
            bonus: 0,
            type: 'poison',
        });
    }
    get attackTypeText(): string {
        return this.attackType.join(' or ');
    }

    get reachText(): string {
        let returnText = '';
        if (this.attackType.includes('Melee')) {
            returnText += `reach ${this.reach} ft.`;
        }
        if (this.attackType.length > 1) {
            returnText += ' or ';
        }
        if (this.attackType.includes('Ranged')) {
            returnText += `range ${this.rangeReach1} ft./${this.rangeReach2} ft.`;
        }
        return returnText;
    }

    getDamageAverage(amount: number, die: number, bonus = 0): number {
        return Math.floor(((Number(die) + 1) / 2) * Number(amount)) + Number(bonus);
    }

    getBonusText(bonus: number): string {
        return !bonus ? '' : ` + ${bonus}`;
    }

    getDamageMessage(item: Damage): string {
        return (
            this.getDamageAverage(item.amount, item.sides, item.bonus) +
            ` [rollable](${item.amount}d${item.sides}${this.getBonusText(item.bonus)}); {"diceNotation":"${item.amount}d${item.sides}${this.getBonusText(item.bonus)}","rollType":"damage","rollAction":"${this.attackName}","rollDamageType":"${item.type}"}[/rollable] ${item.type} damage` +
            (this.damages.length > item.index ? ' plus ' : '')
        );
    }
}
