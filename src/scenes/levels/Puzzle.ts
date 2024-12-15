import { Scene } from "phaser";

export class Puzzle extends Scene {
    constructor() {
        super("Puzzle");
    }

    create() {
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
            this.scene.start("LevelSelect");
        });
    }
}