export interface Damage {
    id: string;
    amount: number;
    sides: number;
    bonus: number;
    type: string;
}
export interface Monster {
    partialCr?: number;
    cr?: number;
    level?: number;
    proficiency?: number;
    ac?: number;
    hp?: number;
    dmg?: number;
    hit?: number;
    dc?: number;
    spellHit?: number;
    spellLevel?: number;
    points?: number;
}
