import { Routes } from '@angular/router';
import { Formatter } from './formatter/formatter';
import { MonsterStats } from './monster-stats/monster-stats';

export const routes: Routes = [
    {
        path: '',
        component: Formatter,
    },
    {
        path: 'monster',
        component: MonsterStats,
    },
];
