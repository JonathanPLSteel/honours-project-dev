import { Dialogue } from "./DialogueManager";
import { LocalStorageManager } from "../managers/LocalStorageManager";
import { MachineProps } from "./TaskManager";

export interface BaseLevel {
    id: number;
    name: string;
    world_id: number;
    completed: boolean;
    initial_grade: number;
    latest_grade: number;
    time_taken: number;
    num_attempts: number;
    type: "cutscene" | "slides" | "tutorial" | "puzzle" | "quiz";
}

export interface CutsceneLevel extends BaseLevel {
    type: "cutscene";
    cutscene_key: string;
}

export interface SlidesLevel extends BaseLevel {
    type: "slides";
    world_path: string;
    number_of_slides: number;
    subtitles: string[];
}

export interface TutorialLevel extends BaseLevel {
    type: "tutorial";
    machine_props: MachineProps[];
    hidden_elements: string[];
    choices: string[];
    correct: number;
    objective: string;
    dialogue?: Dialogue;
}

export interface PuzzleLevel extends BaseLevel {
    type: "puzzle";
    task_keys: string[];
    machine_props: MachineProps[];
    scoreChart: number[];
    objective: string;
    greedy?: boolean;
    exhaustive_search?: boolean;
    dialogue?: Dialogue;
}

export interface QuizLevel extends BaseLevel {
    type: "quiz";
    questions: string[];
    choices: string[][];
    correct: number[];
    dialogue?: Dialogue;
}

export type Level = CutsceneLevel | SlidesLevel | TutorialLevel | PuzzleLevel | QuizLevel;

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

        if (this.isNewPlayer()) {
            this.initialiseProgress();
        }
    }

    // Loaders
    private loadLevels(): Level[] {
        let levels: Level[] = [];
        let json_levels_map = this.scene.cache.json.get("levels");
        let cutscenes = this.scene.cache.json.get("cutscenes");
        let slides = this.scene.cache.json.get("slides");
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
                        initial_grade: progress.initial_grade,
                        latest_grade: progress.latest_grade,
                        time_taken: progress.time_taken,
                        num_attempts: progress.num_attempts,
                        type: "cutscene",
                        cutscene_key: cutscenes[level_map.level_id].cutscene_key,
                    };
                    break;
                case "slides":
                    level = {
                        id: level_map.id,
                        name: slides[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        initial_grade: progress.initial_grade,
                        latest_grade: progress.latest_grade,
                        time_taken: progress.time_taken,
                        num_attempts: progress.num_attempts,
                        type: "slides",
                        world_path: slides[level_map.level_id].world_path,
                        number_of_slides: slides[level_map.level_id].number_of_slides,
                        subtitles: slides[level_map.level_id].subtitles,
                    };
                    break;
                case "tutorial":
                    level = {
                        id: level_map.id,
                        name: tutorials[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        initial_grade: progress.initial_grade,
                        latest_grade: progress.latest_grade,
                        time_taken: progress.time_taken,
                        num_attempts: progress.num_attempts,
                        type: "tutorial",
                        machine_props:
                            tutorials[level_map.level_id].machine_props,
                        hidden_elements:
                            tutorials[level_map.level_id].hidden_elements,
                        choices: tutorials[level_map.level_id].choices,
                        correct: tutorials[level_map.level_id].correct,
                        objective: tutorials[level_map.level_id].objective,
                        dialogue:
                            tutorials[level_map.level_id].dialogue ?? null,
                    };
                    break;
                case "puzzle":
                    level = {
                        id: level_map.id,
                        name: puzzles[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        initial_grade: progress.initial_grade,
                        latest_grade: progress.latest_grade,
                        time_taken: progress.time_taken,
                        num_attempts: progress.num_attempts,
                        type: "puzzle",
                        task_keys: puzzles[level_map.level_id].task_keys,
                        machine_props:
                            puzzles[level_map.level_id].machine_props,
                        scoreChart: puzzles[level_map.level_id].scoreChart,
                        objective: puzzles[level_map.level_id].objective
                            ? puzzles[level_map.level_id].objective
                            : "Assign tasks to achieve the lowest total time.",
                        greedy: puzzles[level_map.level_id].greedy ?? false,
                        exhaustive_search:
                            puzzles[level_map.level_id].complete_greedy ?? false,
                        dialogue: puzzles[level_map.level_id].dialogue ?? null,
                    };
                    break;
                case "quiz":
                    level = {
                        id: level_map.id,
                        name: quizzes[level_map.level_id].name,
                        world_id: level_map.world_id,
                        completed: progress.completed,
                        initial_grade: progress.initial_grade,
                        latest_grade: progress.latest_grade,
                        time_taken: progress.time_taken,
                        num_attempts: progress.num_attempts,
                        type: "quiz",
                        questions: quizzes[level_map.level_id].questions,
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

    private loadLevelProgress(level_id: number): { 
        world_id: number;
        type: string;
        completed: boolean; 
        initial_grade: number;
        latest_grade: number;
        time_taken: number;
        num_attempts: number;
    } {
        return (
            LocalStorageManager.loadData<{ 
                world_id: number;
                type: string;
                completed: boolean; 
                initial_grade: number;
                latest_grade: number;
                time_taken: number;
                num_attempts: number;
            }>(
                level_id.toString()
            ) ?? { 
                world_id: -1,
                type: "none",
                completed: false,
                initial_grade: 0,
                latest_grade: 0,
                time_taken: 0,
                num_attempts: 0
            }
        );
    }

    public initialiseProgress(): void {
        for (let level of this.levels) {
            LocalStorageManager.saveData(level.id.toString(), {
                world_id: level.world_id,
                type: level.type,
                completed: false,
                initial_grade: 0,
                latest_grade: 0,
                time_taken: 0,
                num_attempts: 0,
            });
        }
    }

    public saveLevelProgress(
        level_id: number,
        grade: number,
        time_taken: number = 0,
    ): void {
        let level = this.levels[level_id];

        level.completed = true;
        
        if (level.initial_grade === 0) {
            level.initial_grade = grade;
        }
        if (grade > level.latest_grade) {
            level.latest_grade = grade;
        }

        level.num_attempts++;

        LocalStorageManager.saveData(level_id.toString(), { 
            world_id: level.world_id,
            type: level.type, 
            completed: level.completed, 
            initial_grade: level.initial_grade,
            latest_grade: level.latest_grade,
            time_taken: level.time_taken + time_taken / 1000,
            num_attempts: level.num_attempts
        });

        // console.log(LocalStorageManager.loadData(level_id.toString()));
    }

    // Getters

    public get length(): number {
        return this.levels.length;
    }

    public getLevelByID(level_id: number): Level {
        if (level_id < 0 || level_id >= this.levels.length) {
            throw new Error("Invalid level");
        }
        return this.levels[level_id];
    }

    public getLastUnlockedLevelID(): number {
        for (let level of this.levels) {
            if (!level.completed) {
                return level.id;
            }
        }
        return this.levels.length - 1;
    }

    public getLastUnlockedWorldID(): number {
        return this.getLevelByID(this.getLastUnlockedLevelID()).world_id;
    }

    public getLevelsIDsByWorldID(world: number): number[] {
        return this.levels
            .filter((level) => level.world_id === world)
            .map((level) => level.id);
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

    public allLevelsCompleted(): boolean { 
        for (let level of this.levels) {
            if (!level.completed) {
                return false;
            }
        }
        return true;
    }

    public getStarCount(): {stars: number, total: number} {
        let stars = 0;
        let total = 0;
        for (let level of this.levels) {
            if (level.type === "puzzle" || level.type === "quiz") {
                total += 3;
                stars += level.latest_grade;
            }
        }
        return {stars, total};
    }
}
