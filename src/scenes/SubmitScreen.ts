import { Scene } from "phaser";
import { LocalStorageManager } from "../managers/LocalStorageManager";

export class SubmitScreen extends Scene {
    grading_text: Phaser.GameObjects.Text;

    private grade: number;
    private level_id: number;

    constructor() {
        super("SubmitScreen");
    }

    create(data: { level_id: number, grade: number }) {
        this.level_id = data.level_id;
        this.grade = data.grade;

        this.save_grade();

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

        if (this.grade === 1) {
            second_star.setTint(0x777777);
            third_star.setTint(0x777777);
        } else if (this.grade === 2) {
            third_star.setTint(0x777777);
        }

        this.grading_text = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 100,
            `${this.grade_to_text(data.grade)}`,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 64,
                color: "#000000",
                align: "center",
            }
        );
        this.grading_text.setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("LevelSelect", { level_id: this.level_id, grade: this.grade });
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

    private save_grade() {
        // Save the grade to the server
        LocalStorageManager.saveData(this.level_id.toString(), this.grade);
    }
}
