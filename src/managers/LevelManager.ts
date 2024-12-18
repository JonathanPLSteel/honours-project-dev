import { Dialogue } from "./DialogueManager";
import { LocalStorageManager } from "../managers/LocalStorageManager";
import { MachineProps } from "./TaskManager";

export interface BaseLevel {
    id: number;
    name: string;
    world_id: number;
    completed: boolean;
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
    dialogue?: Dialogue;
}

export interface PuzzleLevel extends BaseLevel {
    type: "puzzle";
    task_keys: string[];
    machine_props: MachineProps[];
    scoreChart: number[];
    grade: number;
    dialogue?: Dialogue;
}

export interface QuizLevel extends BaseLevel {
    type: "quiz";
    question: string;
    choices: string[];
    correct: number;
    dialogue?: Dialogue;
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

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.levels = this.loadLevels();
        this.worlds = this.loadWorlds();
    }

    // Loaders
    private loadLevels(): Level[] {
        let levels: Level[] = [];
        let json_levels_map = this.scene.cache.json.get("levels");
        let cutscenes = this.scene.cache.json.get("cutscenes");
        let tutorials = this.scene.cache.json.get("tutorials");
        let puzzles = this.scene.cache.json.get("puzzles");
        let quizzes = this.scene.cache.json.get("quizzes");

        for (let level_map of json_levels_map) {
            let level: Level;
            let progress = this.loadLevelProgress(level_map.id);
            switch (level_map.level_type) {
                case "cutscene":
                    level = {
                        id: level_map.id,
                        name: cutscenes[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        type: "cutscene",
                        cutscene_key: cutscenes[level_map.level_id].key,
                    };
                    break;
                case "tutorial":
                    level = {
                        id: level_map.id,
                        name: tutorials[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        type: "tutorial",
                        machine_props: tutorials[level_map.level_id].machine_props,
                        choices: tutorials[level_map.level_id].choices,
                        correct: tutorials[level_map.level_id].correct,
                        dialogue: tutorials[level_map.level_id].dialogue ?? null,
                    };
                    break;
                case "puzzle":
                    level = {
                        id: level_map.id,
                        name: puzzles[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        type: "puzzle",
                        task_keys: puzzles[level_map.level_id].task_keys,
                        machine_props: puzzles[level_map.level_id].machine_props,
                        scoreChart: puzzles[level_map.level_id].scoreChart,
                        grade: progress.grade,
                        dialogue: puzzles[level_map.level_id].dialogue ?? null,
                    };
                    break;
                case "quiz":
                    level = {
                        id: level_map.id,
                        name: quizzes[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        type: "quiz",
                        question: quizzes[level_map.level_id].question,
                        choices: quizzes[level_map.level_id].choices,
                        correct: quizzes[level_map.level_id].correct,
                        dialogue: quizzes[level_map.level_id].dialogue ?? null,
                    };
                    break;
                default:
                    throw new Error("Invalid level type");

            }

            levels.push(level);

        }

        return levels;
    }

    private loadWorlds(): World[] {
        return this.scene.cache.json.get("worlds");
    }

    private loadLevelProgress(level_id: number): {completed: boolean, grade: number} {
        return LocalStorageManager.loadData<{completed: boolean, grade: number}>(level_id.toString()) ?? {completed: false, grade: 0};
    }

    public saveLevelProgress(level_id: number, completed: boolean, grade: number): void {
        LocalStorageManager.saveData(level_id.toString(), {completed, grade});

        this.levels[level_id].completed = completed;
        if (this.levels[level_id].type === "puzzle") {
            this.levels[level_id].grade = grade;
        }
    }


    // Getters

    public get length(): number {
        return this.levels.length;
    }

    public getLevelByID(level_id: number): Level {
        if (level_id < 0 || level_id >= this.levels.length ) {
            throw new Error("Invalid level");
        }
        return this.levels[level_id];
    }

    public getLastUnlockedLevelID(): number {
        for (let level of this.levels) {
            if (!(level.completed)) {
                return level.id;
            }
        }
        return this.levels.length - 1;
    }

    public getLastUnlockedWorldID(): number {
        return this.getLevelByID(this.getLastUnlockedLevelID()).world_id;
    }

    public getLevelsIDsByWorldID(world: number): number[] {
        return this.levels.filter((level) => level.world_id === world).map((level) => level.id);
    }

    public getAllLevels(): Level[] {
        return this.levels;
    }

    public getWorld(world_id: number): World {  
        if (world_id < 0 || world_id >= this.worlds.length) {
            throw new Error("Invalid world");
        }
        return this.worlds[world_id];
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

    public isNewPlayer(): boolean {
        return localStorage.length === 0; // Returns true if no keys are present
    }
}