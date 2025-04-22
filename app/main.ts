import { Decks } from "./model/Decks";

const decks = new Decks;
decks.loadDecksFromPath('~/assets/decks/*.json');