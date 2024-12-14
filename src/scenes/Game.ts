import { Scene } from "phaser";
import TaskManager from "../managers/TaskManager";
import { Level } from "../managers/LevelManager";
import DialogueManager, { Dialogue } from "../managers/DialogueManager";

export class Game extends Scene {
    private task_manager: TaskManager;
    private dialogue_manager: DialogueManager;
    private current_level: Level;

    constructor() {
        super("Game");
    }

    create(data: { level: Level }) {
        this.events.once("shutdown", this.onShutdown, this);

        this.current_level = data.level;

        this.dialogue_manager = new DialogueManager(this);

        this.launchLevel();
    }

    private launchLevel() {
        this.events.once("submit", this.onSubmit, this);

        // Clean up old TaskManager if it exists
        if (this.task_manager) {
            this.task_manager.destroy();
        }

        this.task_manager = new TaskManager(
            this,
            this.current_level.task_keys,
            this.current_level.machine_names
        );

        if (this.current_level.dialogue) {
            this.dialogue_manager.displayDialogue(this.current_level.dialogue);

            this.events.once(`dialogue-${this.current_level.dialogue.id}-start`, () => {
                this.task_manager.pause();
            });

            this.events.once(`dialogue-${this.current_level.dialogue.id}-end`, () => {
                this.task_manager.resume();
            });
        }
    }

    private onShutdown() {

        if (this.task_manager) {
            this.task_manager.destroy();
        }

        // Remove lingering event listeners
        this.events.off("submit", this.onSubmit, this);
    }

    private onSubmit() {
        let total_duration = this.task_manager.getTotalDuration();
        let grade = this.current_level.scoreChart[total_duration];
        if (grade === undefined) {
            grade = 1;
        }

        this.scene.start("SubmitScreen", {
            level_id: this.current_level.id,
            grade: grade,
        });
    }

    update(time: number, delta: number): void {
        if (this.task_manager) {
            this.task_manager.update();
        }
    }
}
