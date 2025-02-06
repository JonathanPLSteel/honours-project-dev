import { Scene } from "phaser";
import LevelManager, { Level, World } from "../../managers/LevelManager";
import DialogueManager from "../../managers/DialogueManager";
import Button from "../../gameobjects/Button";

export class LevelSelect extends Scene {
    private level_manager: LevelManager;
    private current_world_id: number;

    private world_text: Phaser.GameObjects.Text;
    private level_buttons: Phaser.GameObjects.Container[] = [];
    private previousWorldButton: Phaser.GameObjects.Text;
    private nextWorldButton: Phaser.GameObjects.Text;
    private finish_playthrough_button: Button;

    constructor() {
        super("LevelSelect");
    }

    create(data: { level: Level }) {
        this.level_manager = new LevelManager(this);
        this.current_world_id = 0;

        this.finish_playthrough_button = new Button(
            this,
            this.scale.width / 2,
            50,
            0,
            "Finish Playthrough",
            async () => {
                if (!this.level_manager.allLevelsCompleted()) {
                    let confirmation = await this.confirmFinishPlaythrough();
                    if (confirmation) {
                        this.scene.start("EndScreen");
                    }
                } else {
                    this.scene.start("EndScreen");
                }
            }
        );

        if (this.level_manager.allLevelsCompleted()) {
            this.finish_playthrough_button.shake();
        }

        if (data.level) {
            if (data.level.type === "puzzle") {
                this.level_manager.saveLevelProgress(
                    data.level.id,
                    data.level.latest_grade,
                    data.level.time_taken,
                );
            } else {
                this.level_manager.saveLevelProgress(
                    data.level.id, 
                    0,
                    data.level.time_taken,
                );
            }
        }

        if (this.level_manager.isNewPlayer()) {
            let dialogue_manager = new DialogueManager(this);
            dialogue_manager.displayDialogue({
                id: "game-intro",
                icon: "chef-jonathan",
                text: "Hello, welcome to the Task Scheduling Game! Click anywhere to continue.",
                name: "Head Chef Jonathan",
            });
            this.events.once(`dialogue-game-intro-end`, () => {
                this.addLevelSelect();
            });
        } else {
            let last_unlocked_world_id =
                this.level_manager.getLastUnlockedWorldID();
            this.current_world_id = last_unlocked_world_id;
            this.addLevelSelect();
        }
    }

    private addLevelSelect() {
        this.world_text = this.add.text(
            100,
            100,
            `${this.level_manager.getWorld(this.current_world_id).name}`,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 64,
                color: "#000000",
                align: "center",
            }
        );

        this.addLevelButtons(
            this.level_manager.getLevelsIDsByWorldID(this.current_world_id)
        );

        this.addWorldButtons();
    }

    private addLevelButton(
        x: number,
        y: number,
        width: number,
        height: number,
        level: Level,
        accessible: boolean = true
    ) {
        const level_button = new Phaser.GameObjects.Container(this, x, y);
        level_button.setSize(width, height);

        let level_background = this.add.rectangle(
            0,
            0,
            width,
            height,
            accessible ? 0xeeeeee : 0xffffff
        );

        if (accessible) {
            let hoverTween: Phaser.Tweens.Tween | null = null;

            level_background.setInteractive();

            level_background.on("pointerdown", () => {
                this.sound.play("switch");
                this.launchLevel(level);
            });

            level_background.on("pointerover", () => {
                // Stop any existing tweens
                if (hoverTween) {
                    hoverTween.stop();
                    hoverTween = null;
                }

                hoverTween = this.add.tween({
                    targets: level_background,
                    ease: "Sine.easeInOut",
                    duration: 100,
                    scaleX: 1.025,
                    scaleY: 1.1,
                });
            });

            level_background.on("pointerout", () => {
                if (hoverTween) {
                    hoverTween.stop();
                    hoverTween = null;
                }
                hoverTween = this.add.tween({
                    targets: level_background,
                    ease: "Sine.easeInOut",
                    duration: 100,
                    scaleX: 1,
                    scaleY: 1,
                });
            });
        }

        level_button.add(level_background);

        let level_icon = this.add
            .image(
                -width / 2 + 25,
                0,
                level.completed
                    ? "completed"
                    : accessible
                    ? level.type
                    : "locked"
            )
            .setDisplaySize(40, 40);
        level_button.add(level_icon);

        let text = this.add.text(
            -width / 2 + 25 + level_icon.displayWidth,
            -height / 2 + 5,
            `${level.name}`,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 32,
                color: accessible ? "#000000" : "#777777",
                align: "left",
            }
        );
        level_button.add(text);

        if (level.type === "puzzle" && accessible) {
            this.addStars(level.latest_grade, level_button);
        }

        this.level_buttons.push(level_button);
        this.add.existing(level_button);
    }

    private addLevelButtons(level_ids: number[]) {
        let x = this.scale.width / 2;
        let y = this.world_text.y + this.world_text.displayHeight + 50;
        for (let i of level_ids) {
            const level = this.level_manager.getLevelByID(i);

            if (i != 0) {
                this.addLevelButton(
                    x,
                    y,
                    this.scale.width * 0.8,
                    50,
                    level,
                    this.level_manager.getLevelByID(i - 1).completed
                );
            } else {
                this.addLevelButton(
                    x,
                    y,
                    this.scale.width * 0.8,
                    50,
                    level,
                    true
                );
            }
            y += 75;
        }
    }

    private addStars(grade: number, container: Phaser.GameObjects.Container) {
        let first_star = this.add
            .image(container.width / 2 - 125, container.height / 2 - 25, "star")
            .setDisplaySize(40, 40);
        let second_star = this.add
            .image(container.width / 2 - 75, container.height / 2 - 25, "star")
            .setDisplaySize(40, 40);
        let third_star = this.add
            .image(container.width / 2 - 25, container.height / 2 - 25, "star")
            .setDisplaySize(40, 40);

        if (grade === 0) {
            first_star.setTint(0x777777);
            second_star.setTint(0x777777);
            third_star.setTint(0x777777);
        } else if (grade === 1) {
            second_star.setTint(0x777777);
            third_star.setTint(0x777777);
        } else if (grade === 2) {
            third_star.setTint(0x777777);
        }

        container.add(first_star);
        container.add(second_star);
        container.add(third_star);
    }

    private launchLevel(level: Level) {
        switch (level.type) {
            case "cutscene":
                this.scene.start("Cutscene", { level: level });
                break;
            case "tutorial":
                this.scene.start("Tutorial", { level: level });
                break;
            case "quiz":
                this.scene.start("Quiz", { level: level });
                break;
            case "puzzle":
                this.scene.start("Puzzle", { level: level });
                break;
            default:
                throw new Error("Invalid level type");
        }
    }

    private addWorldButtons() {
        let previousWorldID = this.level_manager.getPreviousWorldID(
            this.current_world_id
        );
        let nextWorldID = this.level_manager.getNextWorldID(
            this.current_world_id
        );
        if (previousWorldID != -1) {
            let hoverTween: Phaser.Tweens.Tween | null = null;
            this.previousWorldButton = this.add
                .text(
                    10,
                    this.scale.height - 40,
                    `⬅️ ${this.level_manager.getWorld(previousWorldID).name}`,
                    {
                        fontFamily: "WorkSansBold, Arial, sans-serif",
                        fontSize: 32,
                        color: "#000000",
                        align: "center",
                    }
                )
                .setInteractive()
                .on("pointerdown", () => {
                    this.current_world_id = previousWorldID;
                    this.sound.play("switch");
                    this.reload();
                })
                .on("pointerover", () => {
                    // Stop any existing tweens
                    if (hoverTween) {
                        hoverTween.stop();
                        hoverTween = null;
                    }

                    hoverTween = this.add.tween({
                        targets: this.previousWorldButton,
                        ease: "Sine.easeInOut",
                        duration: 100,
                        alpha: 0.5,
                    });
                })
                .on("pointerout", () => {
                    if (hoverTween) {
                        hoverTween.stop();
                        hoverTween = null;
                    }
                    this.previousWorldButton.setAlpha(1);
                });
        }

        if (
            nextWorldID != -1 &&
            nextWorldID <= this.level_manager.getLastUnlockedWorldID()
        ) {
            let hoverTween: Phaser.Tweens.Tween | null = null;
            this.nextWorldButton = this.add
                .text(
                    this.scale.width - 10,
                    this.scale.height - 40,
                    `${this.level_manager.getWorld(nextWorldID).name} ➡️`,
                    {
                        fontFamily: "WorkSansBold, Arial, sans-serif",
                        fontSize: 32,
                        color: "#000000",
                        align: "center",
                    }
                )
                .setOrigin(1, 0)
                .setInteractive()
                .on("pointerdown", () => {
                    this.current_world_id = nextWorldID;
                    this.sound.play("switch");
                    this.reload();
                })
                .on("pointerover", () => {
                    // Stop any existing tweens
                    if (hoverTween) {
                        hoverTween.stop();
                        hoverTween = null;
                    }

                    hoverTween = this.add.tween({
                        targets: this.nextWorldButton,
                        ease: "Sine.easeInOut",
                        duration: 100,
                        alpha: 0.5,
                    });
                })
                .on("pointerout", () => {
                    if (hoverTween) {
                        hoverTween.stop();
                        hoverTween = null;
                    }
                    this.nextWorldButton.setAlpha(1);
                });
        }
    }

    private async confirmFinishPlaythrough(): Promise<boolean> {
        return new Promise((resolve) => {
            let confirm_box = this.add.rectangle(
                this.scale.width / 2,
                this.scale.height / 2,
                this.scale.width * 0.7,
                this.scale.height * 0.7,
                0xffffff,
                0.975
            ).setOrigin(0.5);

            let confirm_text = this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 - 100,
                "You haven't finished all the levels.\n\nAre you sure you want to finish the playthrough?",
                {
                    fontFamily: "WorkSansBold, Arial, sans-serif",
                    fontSize: 32,
                    color: "#000000",
                    align: "center",
                    wordWrap: { width: this.scale.width * 0.7 - 50 },
                }
            ).setOrigin(0.5);

            let yes_button = new Button(
                this,
                this.scale.width / 2 - 150,
                this.scale.height / 2 + 100,
                0,
                "Yes",
                () => {
                    confirm_box.destroy();
                    confirm_text.destroy();
                    yes_button.destroy();
                    no_button.destroy();
                    resolve(true);
                }
            );

            let no_button = new Button(
                this,
                this.scale.width / 2 + 150,
                this.scale.height / 2 + 100,
                0,
                "No",
                () => {
                    confirm_box.destroy();
                    confirm_text.destroy();
                    yes_button.destroy();
                    no_button.destroy();
                    resolve(false);
                }
            );
        });
    }

    private reload() {
        this.destroyLevelSelectPage();
        this.addLevelSelect();
    }

    private destroyLevelSelectPage() {
        this.world_text.destroy();

        for (let button of this.level_buttons) {
            button.destroy();
        }
        this.level_buttons = [];

        if (this.previousWorldButton) this.previousWorldButton.destroy();
        if (this.nextWorldButton) this.nextWorldButton.destroy();
    }
}
