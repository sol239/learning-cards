import type { Deck } from "./Deck";
import * as fs from 'fs';


export class Decks {
    private decks: Deck[];

    // TO-DO: Load from .env
    private path: string = '~/assets/decks/*.json';

    constructor() {
        this.decks = this.loadDecksFromPath(this.path);
    }

    public loadDecksFromPath(path: string): Deck[] {
        const decks: Deck[] = [];
        const rawData = fs.readFileSync(path, 'utf-8');
        const data = JSON.parse(rawData);
        console.log(data);

        return decks;

    }

}