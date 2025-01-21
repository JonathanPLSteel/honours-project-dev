import { Scene, GameObjects } from "phaser";
import LevelManager from "../../managers/LevelManager";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    subtitle: GameObjects.Text;
    versionText: GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    create() {
        let version = "v3.0 (Alpha)";

        this.title = this.add
            .text(512, 300, "Task Scheduling Game", {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 52,
                color: "#000000",
                align: "center",
            })
            .setOrigin(0.5);

        this.subtitle = this.add
            .text(512, 460, "Click anywhere to start", {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 38,
                color: "#000000",
                align: "center",
            })
            .setOrigin(0.5);

        this.versionText = this.add
            .text(10, 10, version, {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 20,
                color: "#000000",
            })

        this.input.once("pointerdown", () => {
            this.sound.play("switch");
            this.scene.start("LevelSelect");
        });
    }
}
