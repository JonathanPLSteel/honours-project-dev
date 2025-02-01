import { Scene } from "phaser";

export class EndScreen extends Scene {
    constructor() {
        super("EndScreen");
    }

    create() {
        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            "Congratulations!\n\nYou have completed the game!",
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 32,
                color: "#000000",
                align: "center",
                wordWrap: { width: this.scale.width * 0.8 },
            }
        ).setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.sound.play("switch");
            this.scene.start("MainMenu");
        });
    }
}