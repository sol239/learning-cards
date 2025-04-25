import type { Card } from "./Card";

export class Deck {
    /**
     * Id of the deck.
     */
    private id: string;

    /**
     * Name of the deck
     * @example Predicate Logic
     */
    private name: string;

    private description: string;

    private filename: string;

    private cards: Card[];

    /**
     * Tags which can be used in the cards of the deck.
     * @example ["Definition", "Theorem"]
     */
    private tags: string[];

    constructor(id: string, name: string, description: string, filename: string, cards: Card[], tags: string[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.filename = filename;
        this.cards = cards;
        this.tags = tags;
    }


    public setId(id: string): void {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public getDescription(): string {
        return this.description;
    }

    public setCards(cards: Card[]): void {
        this.cards = cards;
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public setTags(tags: string[]): void {
        this.tags = tags;
    }

    public getTags(): string[] {
        return this.tags;
    }

    public setFilename(filename: string): void {
        this.filename = filename;
    }

    public getFilename(): string {
        return this.filename;
    }


    public toString(): string {
        return `- id=${this.id}\n - name=${this.name}\n - description=${this.description}\n - filename=${this.filename}\n - cards=[${this.cards.map(card => card.toString()).join(", ")}]\n - tags=[${this.tags.join(", ")}]\n]`;
    }
}