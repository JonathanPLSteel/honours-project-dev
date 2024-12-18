import { Scene } from "phaser";
import { PuzzleLevel } from "../../managers/LevelManager";

export class Puzzle extends Scene {
    private level: PuzzleLevel;

    constructor() {
        super("Puzzle");
    }

    create(data: { level: PuzzleLevel }) {
        this.level = data.level;

        this.add.text(512, 384, "Puzzle", {
            fontFamily: "WorkSansBold, Arial, sans-serif",
            fontSize: 52,
            color: "#000000",
            align: "center",
        }).setOrigin(0.5);

        this.add.text(512, 460, "Click anywhere to start", {
            fontFamily: "WorkSansRegular, Arial, sans-serif",
            fontSize: 38,
            color: "#000000",
            align: "center",
        }).setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.sound.play("switch");
            this.scene.start("LevelSelect", { level: this.level });
        });
    }
}