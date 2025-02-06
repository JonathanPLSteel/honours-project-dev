export default class Answer extends Phaser.GameObjects.Sprite {
    scene: Phaser.Scene;
    correct: boolean;

    private answerText!: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        correct: boolean
    ) {
        super(scene, x, y, "task-med-bg");

        this.scene = scene;
        this.correct = correct;

        this.scene.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setDisplaySize(width, height);

        this.answerText = this.scene.add.text(this.x, this.y, text, {
            fontFamily: "WorkSansBold, Arial, sans-serif",
            fontSize: 22,
            color: "#000000",
            align: "center",
            wordWrap: { width: this.displayWidth * 0.9 },
        }).setOrigin(0.5);

        this.setInteractive();

        this.on("pointerdown", () => {
            
            if (this.correct) {
                this.scene.sound.play("success");
                this.scene.events.emit("correctAnswer");
            } else {
                this.scene.sound.play("switch");
                this.scene.events.emit("wrongAnswer");
                this.setInteractive(false);

                this.setTint(0xff0000);

                this.scene.tweens.add({
                    targets: this, // The sprite to animate
                    alpha: 0, // Fade out to an alpha value of 0
                    duration: 500, // Duration of the fade-out in milliseconds
                    ease: "Linear", // Linear easing for a smooth fade-out
                    onComplete: () => {
                        this.setVisible(false);
                    }
                });

                this.scene.tweens.add({
                    targets: this.answerText, // The sprite to animate
                    alpha: 0, // Fade out to an alpha value of 0
                    duration: 500, // Duration of the fade-out in milliseconds
                    ease: "Linear", // Linear easing for a smooth fade-out
                    onComplete: () => {
                        this.setVisible(false);
                    }
                });
            }
        });
    }

    destroy() {
        this.answerText.destroy();
        super.destroy();
    }
}
