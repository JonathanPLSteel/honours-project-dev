import { Scene } from "phaser";
import { SlidesLevel } from "../../managers/LevelManager";

export class Slides extends Scene {
    private level: SlidesLevel;
    private startTime: number;

    private slide_number: number;
    private slide: Phaser.GameObjects.Image;
    private slide_text: Phaser.GameObjects.Text;
    private slide_number_text: Phaser.GameObjects.Text;

    constructor() {
        super("Slides");
    }

    create(data: { level: SlidesLevel }) {
        this.startTime = Date.now();

        this.level = data.level;

        this.slide_number = 1;

        console.log(this.level);

        this.slide = this.add
            .image(
                this.scale.width / 2,
                this.scale.height / 2 - 75,
                `${this.level.world_path}-slide-${this.slide_number}`
            )
            .setOrigin(0.5);

        console.log(this.level.subtitles);

        this.slide_text = this.add
            .text(
                this.scale.width / 2,
                this.scale.height - 150,
                this.level.subtitles?.[this.slide_number - 1] ?? "...",
                {
                    fontFamily: "WorkSansRegular, Arial, sans-serif",
                    fontSize: 24,
                    color: "#000000",
                    align: "center",
                    wordWrap: {
                        width: this.scale.width * 0.6,
                        useAdvancedWrap: true,
                    },
                }
            )
            .setOrigin(0.5);

        this.slide_number_text = this.add
            .text(
                this.scale.width / 2,
                this.scale.height - 50,
                `Slide ${this.slide_number} / ${this.level.number_of_slides}`,
                {
                    fontFamily: "WorkSansRegular, Arial, sans-serif",
                    fontSize: 18,
                    color: "#000000",
                    align: "center",
                }
            )
            .setOrigin(0.5);

        this.input.on("pointerdown", () => {
            this.nextSlide();
        });
    }

    private nextSlide() {
        this.slide_number++;

        if (
            this.textures.exists(
                `${this.level.world_path}-slide-${this.slide_number}`
            )
        ) {
            this.slide.destroy();

            this.slide = this.add
                .image(
                    this.scale.width / 2,
                    this.scale.height / 2 - 75,
                    `${this.level.world_path}-slide-${this.slide_number}`
                )
                .setOrigin(0.5);
            this.slide_text.text =
                this.level.subtitles?.[this.slide_number - 1] ?? "...";
            this.slide_number_text.text = `Slide ${this.slide_number} / ${this.level.number_of_slides}`;
        } else {
            let endTime = Date.now();
            this.level.time_taken = endTime - this.startTime;
            this.level.completed = true;

            this.slide.destroy();
            this.slide_text.destroy();

            this.scene.start("LevelSelect", { level: this.level });
        }
    }
}
