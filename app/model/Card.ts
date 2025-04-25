
export class Card {
    private id: number;
    private level: number;
    private tags: string[];
    private front: string;
    private back: string;

    public constructor(id: number, level: number, tags: string[], front: string, back: string) {
        this.id = id;
        this.level = level;
        this.tags = tags;
        this.front = front;
        this.back = back;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getId(): number {
        return this.id;
    }

    public setLevel(level: number): void {
        this.level = level;
    }

    public getLevel(): number {
        return this.level;
    }

    public setTags(tags: string[]): void {
        this.tags = tags;
    }

    public getTags(): string[] {
        return this.tags;
    }

    public setFront(front: string): void {
        this.front = front;
    }

    public getFront(): string {
        return this.front;
    }

    public setBack(back: string): void {
        this.back = back;
    }

    public getBack(): string {
        return this.back;
    }

    public toString(): string {
        return `Card { id: ${this.id}, level: ${this.level}, tags: ${this.tags.join(', ')}, front: ${this.front}, back: ${this.back} }`;
    }
}