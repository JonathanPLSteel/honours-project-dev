import { Dialogue } from "./DialogueManager";

export interface Level {
    id: number;
    name: string;
    world: number;
    task_keys: string[];
    machine_names: string[];
    scoreChart: { [key: number]: number };
    dialogue?: Dialogue;
}

export default class LevelManager {
    private levels: Level[];

    constructor(levels: Level[]) {
        this.levels = levels;
    }

    public getAllLevels(): Level[] {
        return this.levels;
    }

    public loadLevel(level: number): Level {
        if (level < 1 || level > this.levels.length) {
            throw new Error("Invalid level");
        }
        return this.levels[level - 1];
    }
}
    