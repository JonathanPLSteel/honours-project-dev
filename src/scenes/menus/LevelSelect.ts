import { Scene } from "phaser";
import LevelManager, { Level, World } from "../../managers/LevelManager";
import DialogueManager from "../../managers/DialogueManager";

export class LevelSelect extends Scene {
    private level_manager: LevelManager;
    private current_world_id: number;

    private world_text: Phaser.GameObjects.Text;
    private level_buttons: Phaser.GameObjects.Text[] = [];
    private stars: Phaser.GameObjects.Image[] = [];
    private previousWorldButton: Phaser.GameObjects.Text;
    private nextWorldButton: Phaser.GameObjects.Text;

    constructor() {
        super("LevelSelect");
    }

    create() {
        const levels: Level[] = this.cache.json.get("levels");
        const worlds: World[] = this.cache.json.get("worlds");
        this.level_manager = new LevelManager(levels, worlds);
        this.current_world_id = 0;

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
            this.level_manager.getWorldLevelIDs(this.current_world_id)
        );

        this.addWorldButtons();
    }

    private addLevelButton(
        x: number,
        y: number,
        level: Level,
        accessible: boolean = true
    ) {
        if (accessible) {
            let hoverTween: Phaser.Tweens.Tween | null = null;
            const level_button = this.add
                .text(x, y, `${level.name}`, {
                    fontFamily: "WorkSansBold, Arial, sans-serif",
                    fontSize: 32,
                    color: "#000000",
                    align: "center",
                })
                .setInteractive()
                .on("pointerdown", () => {
                    this.scene.start("Game", { level: level });
                })
                .on("pointerover", () => {
                    // Stop any existing tweens
                    if (hoverTween) {
                        hoverTween.stop();
                        hoverTween = null;
                    }

                    hoverTween = this.add.tween({
                        targets: level_button,
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
                    level_button.setAlpha(1);
                });
            this.level_buttons.push(level_button);
        } else {
            const level_button = this.add.text(x, y, `${level.name}`, {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 32,
                color: "#777777",
                align: "center",
            });
            this.level_buttons.push(level_button);
        }
    }

    private addLevelButtons(level_ids: number[]) {
        let x = 100;
        let y = 200;
        for (let i of level_ids) {
            const level = this.level_manager.loadLevel(i);
            if (i != 0) {
                if (this.level_manager.loadGrade(i - 1)) {
                    this.addLevelButton(x, y, level, true);
                } else {
                    this.addLevelButton(x, y, level, false);
                }
            } else {
                this.addLevelButton(x, y, level, true);
            }
            this.addStars(
                this.scale.width - 100,
                y + 15,
                this.level_manager.loadGrade(i)
            );
            y += 50;
        }
    }

    private addStars(x: number, y: number, grade: number) {
        let first_star = this.add
            .image(x - 120, y, "star")
            .setDisplaySize(40, 40);
        let second_star = this.add
            .image(x - 60, y, "star")
            .setDisplaySize(40, 40);
        let third_star = this.add.image(x, y, "star").setDisplaySize(40, 40);

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

        this.stars.push(first_star);
        this.stars.push(second_star);
        this.stars.push(third_star);
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
                    `<- ${this.level_manager.getWorld(previousWorldID).name}`,
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

        if (nextWorldID != -1 && nextWorldID <= this.level_manager.getLastUnlockedWorldID()) {
            let hoverTween: Phaser.Tweens.Tween | null = null;
            this.nextWorldButton = this.add
                .text(
                    this.scale.width - 10,
                    this.scale.height - 40,
                    `${this.level_manager.getWorld(nextWorldID).name} ->`,
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

        for (let star of this.stars) {
            star.destroy();
        }
        this.stars = [];

        if (this.previousWorldButton) this.previousWorldButton.destroy();
        if (this.nextWorldButton) this.nextWorldButton.destroy();
    }
}
