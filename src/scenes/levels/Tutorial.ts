import { Scene } from "phaser";
import { TutorialLevel } from "../../managers/LevelManager";
import TaskManager from "../../managers/TaskManager";
import DialogueManager from "../../managers/DialogueManager";

export class Tutorial extends Scene {
    private level: TutorialLevel;
    private task_manager: TaskManager;
    private dialogue_manager: DialogueManager;

    constructor() {
        super("Tutorial");
    }

    create(data: { level: TutorialLevel }) {
        this.level = data.level;

        this.events.once("shutdown", this.onShutdown, this);

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
            this.cache.json.get("task_types"),
            this.level
        );

        this.sound.play("card-fan-2");

        if (this.level.dialogue) {
            this.dialogue_manager.displayDialogue(this.level.dialogue);

            this.events.once(`dialogue-${this.level.dialogue.id}-start`, () => {
                this.task_manager.pause();
            });

            this.events.once(`dialogue-${this.level.dialogue.id}-end`, () => {
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
        this.scene.start("SubmitScreen", { level: this.level });
    }

    update() {
        if (this.task_manager) {
            this.task_manager.update();
        }
    }
}
