import { computed, Injectable, signal } from '@angular/core';
import { Monster } from './app.interface';
import { npcChart } from './npc-chart';

@Injectable({
    providedIn: 'root',
})
export class MonsterService {
    // CR
    cr = signal(10);
    chartStats = computed<Monster>(() => {
        return npcChart.find((c) => c.cr === this.cr())!;
    });
    damageBonus = computed<number>(() => {
        return this.chartStats().hit! - this.chartStats().proficiency!;
    });
    crList = [
        { label: '0', value: 0 },
        { label: '1/8', value: 0.125 },
        { label: '1/4', value: 0.25 },
        { label: '1/2', value: 0.5 },
        ...Array.from(Array(30).keys()).map((k) => ({ label: k + 1, value: k + 1 })),
    ];

    // Name / Pronouns
    name = signal('Monster');
    pronoun = signal('They/them');
    pronouns = ['He/him', 'She/her', 'They/them', 'It/it'];

    posessivePronoun = computed(() => {
        switch (this.pronoun()) {
            case 'He/him':
                return 'his';
            case 'She/her':
                return 'her';
            case 'It/it':
                return 'its';
        }
        return 'their';
    });

    // He, She, They
    subjectPronoun = computed(() => {
        return this.pronoun().split('/')[0].toLowerCase();
    });

    // Him, Her, Them
    objectPronoun = computed(() => {
        return this.pronoun().split('/')[1];
    });

    verbPlural = computed(() => {
        return this.pronoun() === 'They/them' ? '' : 's';
    });

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

    getChartStats(cr: number): Monster {
        return npcChart.find((c) => c.cr === cr) || {};
    }

    getMarkupText(type: string, list: string): string {
        const items = list.split(/\s*,\s*/).filter((item: string) => item.length > 0);
        return items.length === 0
            ? ''
            : `[${type}]` + items.join(`[/${type}], [${type}]`) + `[/${type}]`;
    }
}
