import { Scene } from "phaser";
import { PuzzleLevel } from "../../managers/LevelManager";
import TaskManager from "../../managers/TaskManager";
import DialogueManager from "../../managers/DialogueManager";

export class Puzzle extends Scene {
    private level: PuzzleLevel;
    private task_manager: TaskManager;
    private dialogue_manager: DialogueManager;
    private start_time: number;

    constructor() {
        super("Puzzle");
    }

    create(data: { level: PuzzleLevel }) {

        this.level = data.level;

        this.events.once("shutdown", this.onShutdown, this);

        this.dialogue_manager = new DialogueManager(this);

        this.start_time = Date.now();

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
            this.cache.json.get("task_types"),
            this.level
        );

        this.task_manager.triggerEntrances(1200)

        if (this.level.dialogue) {
            this.dialogue_manager.displayDialogue(this.level.dialogue);

            this.events.once(`dialogue-${this.level.dialogue.id}-start`, () => {
                this.task_manager.pause();
            });

            this.events.once(`dialogue-${this.level.dialogue.id}-end`, () => {
                this.task_manager.resume();
            });
        }

        this.sound.play("card-fan-2");
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

        let end_time = Date.now();
        this.level.time_taken = end_time - this.start_time;

        this.level.completed = true;

        if (total_duration <= this.level.scoreChart[0]) {
            this.level.latest_grade = 3;
        } else if (total_duration <= this.level.scoreChart[1]) {
            this.level.latest_grade = 2;
        } else {
            this.level.latest_grade = 1;
        }

        this.sound.play("card-fan-1");

        this.task_manager.triggerExits(700);

        this.time.delayedCall(700, () => {
            this.scene.start("SubmitScreen", {
                level: this.level,
            });
        });
    }

    update(time: number, delta: number): void {
        if (this.task_manager) {
            this.task_manager.update();
        }
    }
}
