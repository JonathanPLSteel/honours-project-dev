import { Scene } from "phaser";
import { PuzzleLevel } from "../../managers/LevelManager";

export class SubmitScreen extends Scene {
    private level: PuzzleLevel;

    grading_text: Phaser.GameObjects.Text;

    constructor() {
        super("SubmitScreen");
    }

    create(data: { level: PuzzleLevel; }) {
        this.level = data.level;

        let first_star = this.add
            .image(
                this.scale.width / 2 - 125,
                this.scale.height / 2 - 25,
                "star"
            )
            .setDisplaySize(150, 150)
            .setOrigin(0.5);
        let second_star = this.add
            .image(
                this.scale.width / 2 + 125,
                this.scale.height / 2 - 25,
                "star"
            )
            .setDisplaySize(150, 150)
            .setOrigin(0.5);
        let third_star = this.add
            .image(this.scale.width / 2, this.scale.height / 2 - 50, "star")
            .setDisplaySize(200, 200)
            .setOrigin(0.5);

        if (this.level.latest_grade === 1) {
            second_star.setTint(0x777777);
            third_star.setTint(0x777777);
        } else if (this.level.latest_grade === 2) {
            third_star.setTint(0x777777);
        }

        this.grading_text = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 100,
            `${this.grade_to_text(this.level.latest_grade)}!`,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 64,
                color: "#000000",
                align: "center",
            }
        );
        this.grading_text.setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.sound.play("switch");
            this.scene.start("LevelSelect", { level: this.level });
        });
    }

    private grade_to_text(grade: number): string {
        if (grade === 1) {
            return "Good";
        } else if (grade === 2) {
            return "Excellent";
        } else {
            return "Perfect";
        }
    }
}
