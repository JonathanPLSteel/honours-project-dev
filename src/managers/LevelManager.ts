import { Dialogue } from "./DialogueManager";
import { LocalStorageManager } from "../managers/LocalStorageManager";

export interface Level {
    id: number;
    name: string;
    world: number;
    task_keys: string[];
    machine_names: string[];
    scoreChart: { [key: number]: number };
    dialogue?: Dialogue;
}

export interface World {
    id: number;
    name: string;
}

export default class LevelManager {
    private levels: Level[];
    private worlds: World[];

    constructor(levels: Level[], worlds: World[]) {
        this.levels = levels;
        this.worlds = worlds;
    }

    public get length(): number {
        return this.levels.length;
    }

    public isNewPlayer(): boolean {
        return localStorage.length === 0; // Returns true if no keys are present
    }

    public getLastUnlockedLevelID(): number {
        for (let level of this.levels) {
            if (!(this.loadGrade(level.id))) {
                return level.id;
            }
        }
        return this.levels.length - 1;
    }

    public getLastUnlockedWorldID(): number {
        return this.loadLevel(this.getLastUnlockedLevelID()).world;
    }

    public getWorldLevelIDs(world: number): number[] {
        return this.levels.filter((level) => level.world === world).map((level) => level.id);
    }

    public getAllLevels(): Level[] {
        return this.levels;
    }

    public loadLevel(level_id: number): Level {
        if (level_id < 0 || level_id >= this.levels.length ) {
            throw new Error("Invalid level");
        }
        return this.levels[level_id];
    }

    public getWorld(world_id: number): World {  
        if (world_id < 0 || world_id >= this.worlds.length) {
            throw new Error("Invalid world");
        }
        return this.worlds[world_id];
    }

    public loadGrade(level_id: number): number {
        let grade = LocalStorageManager.loadData<number>(level_id.toString());
        if (grade === null) {
            return 0;
        }
        return grade;
    }

    public getPreviousWorldID(world_id: number): number {
        if (world_id <= 0) {
            return -1;
        }
        return world_id - 1;
    }

    public getNextWorldID(world_id: number): number {
        if (world_id >= this.worlds.length - 1) {
            return -1;
        }
        return world_id + 1;
    }
}