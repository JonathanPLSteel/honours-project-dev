import { Scene } from "phaser";
import LevelManager, { Level } from "../managers/LevelManager";
import { LocalStorageManager } from "../managers/LocalStorageManager";

export class LevelSelect extends Scene {
    private level: number;
    private level_manager: LevelManager;

    constructor() {
        super("LevelSelect");
    }

    create() {
        this.level_manager = new LevelManager();

        this.add.text(100, 100, "Level Select", {
            fontFamily: "WorkSansBold, Arial, sans-serif",
            fontSize: 64,
            color: "#000000",
            align: "center",
        });
        this.addLevelButtons();
    }

    private addLevelButton(x: number, y: number, level: Level) {
        let hoverTween: Phaser.Tweens.Tween | null = null;
        const levelButton = this.add
            .text(x, y, `${level.name}`, {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 32,
                color: "#000000",
                align: "center",
            })
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.start("Game", { level_id: level.id });
            })
            .on("pointerover", () => {
                // Stop any existing tweens
                if (hoverTween) {
                    hoverTween.stop();
                    hoverTween = null;
                }

                hoverTween = this.add.tween({
                    targets: levelButton,
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
                levelButton.setAlpha(1);
            });
    }

    private addLevelButtons() {
        let levels = this.level_manager.getAllLevels();
        let x = 100;
        let y = 200;
        for (let level of levels) {
            this.addLevelButton(x, y, level);
            this.addStars(this.scale.width - 100, y+15, this.loadGrade(level.id));
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
        let third_star = this.add
            .image(x, y, "star")
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
    }

    private loadGrade(level_id: number): number {
        let grade = LocalStorageManager.loadData<number>(level_id.toString());
        if (grade === null) {
            return 0;
        }
        return grade;
    }
}
