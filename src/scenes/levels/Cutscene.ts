import { Scene } from "phaser";
import { CutsceneLevel } from "../../managers/LevelManager";

export class Cutscene extends Scene {
    private level: CutsceneLevel;

    constructor() {
        super("Cutscene");
    }

    create(data: { level: CutsceneLevel }) {

        let startTime = Date.now();

        this.level = data.level;

        const cutscene = this.add.video(this.scale.width / 2, this.scale.height / 2);
        cutscene.setDisplaySize(cutscene.displayWidth * 0.5, cutscene.displayHeight * 0.5);
        cutscene.setOrigin(0.5, 0.5);

        cutscene.loadURL(`assets/videos/${this.level.cutscene_key}.webm`, true);
        cutscene.setMute(false);
        cutscene.play();

        cutscene.setPlaybackRate(1.25);

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

            let endTime = Date.now();
            this.level.time_taken = endTime - startTime;

            cutscene.destroy();
            this.scene.start("LevelSelect", { level: this.level });
        });

        // Allow the user to skip the cutscene by clicking
        this.input.once("pointerdown", () => {

            let endTime = Date.now();
            this.level.time_taken = endTime - startTime;

            cutscene.stop();
            cutscene.destroy();

            this.level.completed = true;

            this.scene.start("LevelSelect", { level: this.level });
        });
    }
}