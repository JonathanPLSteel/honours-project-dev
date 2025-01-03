import { Scene, GameObjects } from "phaser";
import LevelManager from "../../managers/LevelManager";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    subtitle: GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    create() {
        // this.background = this.add.image(512, 384, 'background');

        // this.logo = this.add.image(512, 300, 'logo');

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

        // this.input.once("pointerdown", () => {
        //     this.scene.start("Cutscene", {
        //         cutscene_key: "test_video",
        //         next_scene: "LevelSelect",
        //     });
        // });

        this.input.once("pointerdown", () => {
            this.sound.play("switch");
            this.scene.start("LevelSelect");
        });
    }
}
