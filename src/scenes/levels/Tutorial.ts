import { Scene } from "phaser";
import { TutorialLevel } from "../../managers/LevelManager";
import TaskManager from "../../managers/TaskManager";
import DialogueManager from "../../managers/DialogueManager";
import AnswersManager from "../../managers/AnswersManager";

export class Tutorial extends Scene {
    private level: TutorialLevel;
    private task_manager: TaskManager;
    private dialogue_manager: DialogueManager;
    private answers_manager: AnswersManager;
    private start_time: number;

    constructor() {
        super("Tutorial");
    }

    create(data: { level: TutorialLevel }) {
        this.level = data.level;

        this.events.once("shutdown", this.onShutdown, this);

        this.dialogue_manager = new DialogueManager(this);

        this.start_time = Date.now();

        this.launchLevel();
    }

    private launchLevel() {
        this.events.once("correctAnswer", this.onSubmit, this);

        // Clean up old TaskManager if it exists
        if (this.task_manager) {
            this.task_manager.destroy();
        }

        this.task_manager = new TaskManager(
            this,
            this.cache.json.get("task_types"),
            this.level
        );

        this.answers_manager = new AnswersManager(
            this,
            this.level.choices,
            this.level.correct
        );

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
        // Remove lingering event listeners
        this.events.off("correctAnswer", this.onSubmit, this);
    }

    private onSubmit() {
        this.task_manager.destroy();
        this.answers_manager.destroy();

        let end_time = Date.now();
        this.level.time_taken = end_time - this.start_time;

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            "Great Job!",
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 64,
                color: "#000000",
                align: "center",
            }
        ).setOrigin(0.5);

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 100,
            "Press anywhere to continue",
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 32,
                color: "#000000",
                align: "center",
            }
        ).setOrigin(0.5);

        // Wait 0.1 seconds before allowing the player to continue
        this.time.delayedCall(100, () => {
            this.input.once("pointerdown", () => {
                this.sound.play("switch");
                this.scene.start("LevelSelect", { level: this.level });
            });
        });
    }

    update() {
        if (this.task_manager) {
            this.task_manager.update();
        }
    }
}
