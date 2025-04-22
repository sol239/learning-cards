import type { Card } from "./Card";

export class Deck {
    /**
     * Id of the deck.
     */
    private id: number;

    /**
     * Name of the deck
     * @example Predicate Logic
     */
    private name: string;

    /**
     * Tags which can be used in the cards of the deck.
     * @example ["Definition", "Theorem"]
     */
    private tags: string[];

    /**
     * Cards in the deck.
     */
    private cards: Card[];

    public loadDeck(path: string) {
        // loads all class fields and cards
        // TO-DO
    }




}