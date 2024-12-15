import { Dialogue } from "./DialogueManager";
import { LocalStorageManager } from "../managers/LocalStorageManager";
import { MachineProps } from "./TaskManager";

export interface BaseLevel {
    id: number;
    name: string;
    world_id: number;
    type: "cutscene" | "tutorial" | "puzzle" | "quiz";
}

export interface CutsceneLevel extends BaseLevel {
    type: "cutscene";
    cutscene_key: string;
}

export interface TutorialLevel extends BaseLevel {
    type: "tutorial";
    machine_props: MachineProps[];
    choices: string[];
    correct: number;
    dialogue: Dialogue;
}

export interface PuzzleLevel extends BaseLevel {
    type: "puzzle";
    task_keys: string[];
    machine_props: MachineProps[];
    scoreChart: { [key: number]: number };
    dialogue: Dialogue;
}

export interface QuizLevel extends BaseLevel {
    type: "quiz";
    question: string;
    choices: string[];
    correct: number;
    dialogue: Dialogue;
}

export type Level = CutsceneLevel | TutorialLevel | PuzzleLevel | QuizLevel;

export interface World {
    id: number;
    name: string;
}

export default class LevelManager {
    scene: Phaser.Scene;
    private levels: Level[];
    private worlds: World[];

    constructor(scene: Phaser.Scene, levels: Level[], worlds: World[]) {
        this.scene = scene;
        this.levels = [];
        this.worlds = this.loadWorlds();
    }

    // Loaders
    private loadLevels(): Level[] {
        let levels: Level[] = [];
        let json_levels_map = this.scene.cache.json.get("levels");

        for (let level of json_levels_map) {
            
    }

    private loadWorlds(): World[] {
        return this.scene.cache.json.get("worlds");
    }

    // Getters

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