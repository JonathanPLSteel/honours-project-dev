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

        this.answerText = this.scene.add
            .text(this.x, this.y, text, {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 22,
                color: "#000000",
                align: "center",
                wordWrap: { width: this.displayWidth * 0.9 },
            })
            .setOrigin(0.5);

        this.setInteractive();

        this.on("pointerdown", () => {
            if (this.correct) {
                this.scene.sound.play("success");

                const flash = this.scene.add
                    .rectangle(
                        this.scene.scale.width / 2,
                        this.scene.scale.height / 2,
                        this.scene.scale.width,
                        this.scene.scale.height,
                        0x00ff00 
                    )
                    .setOrigin(0.5)
                    .setAlpha(0);

                // Animate flash effect
                this.scene.tweens.add({
                    targets: flash,
                    alpha: { from: 0.8, to: 0 },
                    duration: 300,
                    ease: "Linear",
                    onComplete: () => {
                        flash.destroy();
                    },
                });

                this.scene.events.emit("correctAnswer");
            } else {
                this.scene.sound.play("switch");
                this.scene.events.emit("wrongAnswer");
                this.setInteractive(false);

                this.setTint(0xff0000);

                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 500,
                    ease: "Linear",
                    onComplete: () => {
                        this.setVisible(false);
                    },
                });

                this.scene.tweens.add({
                    targets: this.answerText, 
                    alpha: 0, 
                    duration: 500,
                    ease: "Linear",
                    onComplete: () => {
                        this.setVisible(false);
                    },
                });
            }
        });
    }

    destroy() {
        this.answerText.destroy();
        super.destroy();
    }
}
