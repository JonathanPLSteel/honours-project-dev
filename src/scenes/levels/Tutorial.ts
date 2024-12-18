import { Scene } from "phaser";
import { TutorialLevel } from "../../managers/LevelManager";

export class Tutorial extends Scene {
    private level: TutorialLevel;

    constructor() {
        super("Tutorial");
    }

    create(data: { level: TutorialLevel }) {
        this.level = data.level;

        this.add.text(512, 384, "Tutorial", {
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