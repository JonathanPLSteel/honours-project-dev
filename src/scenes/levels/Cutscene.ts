import { Scene } from "phaser";
import { CutsceneLevel } from "../../managers/LevelManager";

export class Cutscene extends Scene {
    private level: CutsceneLevel;

    constructor() {
        super("Cutscene");
    }

    create(data: { level: CutsceneLevel }) {

        this.level = data.level;
        // Dynamically load and play the video
        const cutscene = this.add.video(this.scale.width / 2, this.scale.height / 2);
        cutscene.setDisplaySize(cutscene.displayWidth * 1, cutscene.displayHeight * 1);
        cutscene.setOrigin(0.5, 0.5); // Center the video

        cutscene.loadURL(`assets/videos/${this.level.cutscene_key}.webm`, true);
        cutscene.setMute(false);
        cutscene.play();

        const cutscene_text = this.add.text(
            this.scale.width / 2,
            this.scale.height - 50,
            "Click anywhere to skip",
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: 24,
                color: "#000000",
                align: "center",
            }
        );
        cutscene_text.setOrigin(0.5, 0.5);

        // Transition to the next scene when the video finishes
        cutscene.on("complete", () => {
            cutscene.destroy();
            this.scene.start("LevelSelect"); // Replace with your next scene
        });

        // Allow the user to skip the cutscene by clicking
        this.input.once("pointerdown", () => {
            cutscene.stop();
            cutscene.destroy();

            this.level.completed = true;

            this.scene.start("LevelSelect", { level: this.level });
        });
    }
}