import { Scene, GameObjects } from "phaser";

export const version = "v3.2";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    subtitle: GameObjects.Text;
    versionText: GameObjects.Text;
    creditsText: GameObjects.Text;
    soundInfoText: GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    create() {
        this.title = this.add
            .text(this.scale.width / 2, 300, "The Scheduler", {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 64,
                color: "#000000",
                align: "center",
            })
            .setOrigin(0.5);

        this.subtitle = this.add
            .text(this.scale.width / 2, 420, "Click anywhere to start", {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 38,
                color: "#000000",
                align: "center",
            })
            .setOrigin(0.5);

        this.soundInfoText = this.add
            .text(this.scale.width / 2, 560, "Turn up your volume for the best experience 🔊", {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 20,
                color: "#000000",
                align: "center",
            })
            .setOrigin(0.5);

        this.versionText = this.add.text(10, 10, version, {
            fontFamily: "WorkSansRegular, Arial, sans-serif",
            fontSize: 20,
            color: "#000000",
        });

        let edi_logo = this.add
            .image(10, this.scale.height - 10, "edi-logo")
            .setOrigin(0, 1);

        edi_logo.setDisplaySize(
            edi_logo.displayWidth * 0.4,
            edi_logo.displayHeight * 0.4
        );

        this.creditsText = this.add
            .text(
                this.scale.width - 10,
                this.scale.height - 10,
                "By Jonathan Steel (s2153660@ed.ac.uk)\n\nSupervised by Murray Cole (M.Cole@ed.ac.uk)",
                {
                    fontFamily: "WorkSansRegular, Arial, sans-serif",
                    fontSize: 20,
                    color: "#000000",
                    wordWrap: { width: 500 },
                    align: "right",
                }
            )
            .setOrigin(1, 1);

        this.input.once("pointerdown", () => {
            this.sound.play("switch");
            this.scene.start("LevelSelect");
        });
    }
}
