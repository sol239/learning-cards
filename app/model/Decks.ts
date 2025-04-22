import type { Deck } from "./Deck";

export class Decks {
    private decks: Deck[];
    
    // TO-DO: Load from .env
    private path: string = '~/assets/decks/*.json';
    
    constructor() {
        this.decks = this.loadDecksFromPath(this.path);
    }

    public loadDecksFromPath(path: string): Deck[] {
        const decks: Deck[] = [];
        const deckModules = import.meta.glob(path, { eager: true });
        console.log(deckModules);
        // load into decks

        return decks;

    }
    
}