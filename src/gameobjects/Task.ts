export default class Task extends Phaser.GameObjects.Sprite {
    scene: Phaser.Scene;
    name: string;
    id: number;
    duration: number;
    med_width: number;
    med_height: number;
    small_width: number;
    small_height: number;
    dynamic: boolean;

    private nameText!: Phaser.GameObjects.Text;
    private durationText!: Phaser.GameObjects.Text;

    private icon_key: string;
    private icon!: Phaser.GameObjects.Image;

    private attached: boolean;
    private original_coords: { x: number; y: number };

    private animating: boolean;

    constructor(
        scene: Phaser.Scene,
        name: string,
        x: number,
        y: number,
        med_width: number,
        med_height: number,
        small_width: number,
        small_height: number,
        id: number,
        duration: number,
        icon_key: string,
        dynamic: boolean
    ) {
        super(scene, x, y, "task-med-bg");

        this.scene = scene;
        this.name = name;
        this.med_width = med_width;
        this.med_height = med_height;
        this.small_width = small_width;
        this.small_height = small_height;
        this.id = id;
        this.duration = duration;
        this.icon_key = icon_key;
        this.dynamic = dynamic;
        this.attached = false;
        this.original_coords = { x, y };
        this.animating = false;

        this.scene.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setDisplaySize(this.med_width, this.med_height);

        if (this.dynamic) {
            this.setInteractive();
        }

        this.addComponents();

        // Enable dragging
        if (this.dynamic) {
            this.enableDrag();

            this.setAlpha(0);
            this.nameText.setAlpha(0);
            this.nameText.setVisible(false);
            this.icon.setAlpha(0);
            this.durationText.setAlpha(0);
        }

        if (!this.dynamic) {
            this.setSmallSize();
        }
    }

    private addComponents() {
        this.nameText = this.scene.add.text(
            this.x,
            this.y - this.displayHeight * 0.3,
            this.name,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: "20px",
                color: "#000000",
            }
        );
        this.nameText.setOrigin(0.5, 0.5);

        this.icon = this.scene.add.image(this.x, this.y - 10, this.icon_key);
        this.icon.setDisplaySize(50, 50);
        this.icon.setOrigin(0.5, 0.5);

        this.durationText = this.scene.add.text(
            this.x,
            this.y + this.displayHeight * 0.3,
            `${this.duration} minutes`,
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: "16px",
                color: "#000000",
            }
        );
        this.durationText.setOrigin(0.5, 0.5);
    }

    private enableDrag() {
        // Enable drag for the sprite
        this.scene.input.setDraggable(this);

        // Drag events
        this.on("dragstart", () => {
            this.setAlpha(0.8);
            this.setDepth(999);
        });

        this.on(
            "drag",
            (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                this.setPosition(dragX, dragY);
            }
        );

        this.on(
            "dragend",
            (pointer: Phaser.Input.Pointer, dropped: boolean) => {
                this.setAlpha(1);

                this.updateDepth();

                if (!this.attached) {
                    this.x = this.original_coords.x;
                    this.y = this.original_coords.y;
                }
            }
        );
    }

    public updateDepth() {
        this.setDepth(2);

        this.nameText.setDepth(3);
        this.icon.setDepth(3);
        this.durationText.setDepth(3);
    }

    public attach() {
        this.attached = true;

        let random = Math.floor(Math.random() * 6) + 1;

        if (this.dynamic) this.scene.sound.play(`card-place-${random}`);
    }

    public detach() {
        this.attached = false;
    }

    public isAttached(): boolean {
        return this.attached;
    }

    public pause() {
        this.disableInteractive();
    }

    public resume() {
        this.setInteractive();
    }

    private setSmallSize() {
        this.setTexture("task-small-bg");
        this.setDisplaySize(this.small_width, this.small_height);

        this.icon.setPosition(this.x - this.displayWidth * 0.425, this.y);
        this.icon.setDisplaySize(35, 35);

        this.nameText.setOrigin(0, 0.5);
        this.nameText.setPosition(
            this.icon.x + this.icon.displayWidth * 0.75,
            this.y
        );
        this.nameText.setVisible(true);

        this.durationText.setText(`${this.duration}`);
        this.durationText.setOrigin(1, 0.5);
        this.durationText.setPosition(
            this.x + this.displayWidth * 0.45,
            this.y
        );
    }

    private setMedSize() {
        this.setTexture("task-med-bg");
        this.setDisplaySize(this.med_width, this.med_height);

        this.nameText.setOrigin(0.5, 0.5);
        this.nameText.setPosition(this.x, this.y - this.displayHeight * 0.3);
        this.nameText.setVisible(false);

        this.icon.setPosition(this.x, this.y - 10);
        this.icon.setDisplaySize(50, 50);

        this.durationText.setText(`${this.duration} minutes`);
        this.durationText.setOrigin(0.5, 0.5);
        this.durationText.setPosition(
            this.x,
            this.y + this.displayHeight * 0.3
        );
    }

    public enterAnimation(duration: number) {
        this.animating = true;

        // Animate the sprite's size based on displayWidth and displayHeight
        const originalWidth = this.displayWidth;
        const originalHeight = this.displayHeight;

        this.scene.tweens.add({
            targets: this,
            displayWidth: originalWidth * 1.5,
            displayHeight: originalHeight * 1.5,
            ease: "Bounce.easeOut",
            yoyo: true,
            duration: duration,
            onComplete: () => {
                this.animating = false; // Reset animation flag
            },
        });

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            ease: "Bounce.easeOut",
            duration: duration,
        });

        this.scene.tweens.add({
            targets: this.nameText,
            alpha: 1,
            ease: "Bounce.easeOut",
            duration: duration,
        });

        // Animate the icon size using displayWidth and displayHeight
        const iconOriginalWidth = this.icon.displayWidth;
        const iconOriginalHeight = this.icon.displayHeight;

        this.scene.tweens.add({
            targets: this.icon,
            displayWidth: iconOriginalWidth * 1.5,
            displayHeight: iconOriginalHeight * 1.5,
            ease: "Bounce.easeOut",
            yoyo: true,
            duration: duration,
        });

        this.scene.tweens.add({
            targets: this.icon,
            alpha: 1,
            ease: "Bounce.easeOut",
            duration: duration,
        });

        // Animate the durationText size
        this.scene.tweens.add({
            targets: this.durationText,
            alpha: 1,
            ease: "Bounce.easeOut",
            duration: duration,
        });
    }

    public exitAnimation(duration: number) {
        this.animating = true;
        this.scene.tweens.add({
            targets: this,
            displayWidth: 0,
            displayHeight: 0,
            ease: "Power2",
            duration: duration,
        });
        this.scene.tweens.add({
            targets: this.nameText,
            scaleX: 0,
            scaleY: 0,
            ease: "Power2",
            duration: duration,
        });
        this.scene.tweens.add({
            targets: this.icon,
            scaleX: 0,
            scaleY: 0,
            ease: "Power2",
            duration: duration,
        });
        this.scene.tweens.add({
            targets: this.durationText,
            scaleX: 0,
            scaleY: 0,
            ease: "Power2",
            duration: duration,
        });
    }

    public update() {
        if (this.animating) return;

        if (this.isAttached()) {
            this.setSmallSize();
        } else {
            this.setMedSize();
        }
    }

    public destroy() {
        this.nameText.destroy();
        this.icon.destroy();
        this.durationText.destroy();

        super.destroy();
    }
}
