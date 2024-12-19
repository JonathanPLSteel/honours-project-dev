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

        // Add the sprite to the scene
        this.scene.add.existing(this);

        // Configure the sprite
        this.setOrigin(0.5, 0.5);
        this.setDisplaySize(this.med_width, this.med_height);

        if (this.dynamic) {
            this.setInteractive();
        }

        // Adding additional components
        this.addComponents();

        // Enable dragging
        if (this.dynamic) {
            this.enableDrag();
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
                fontSize: "18px",
                color: "#000000",
            }
        );
        this.nameText.setOrigin(0.5, 0.5);

        this.icon = this.scene.add.image(this.x, this.y, this.icon_key);
        this.icon.setDisplaySize(35, 35);
        this.icon.setOrigin(0.5, 0.5);

        this.durationText = this.scene.add.text(
            this.x,
            this.y + this.displayHeight * 0.3,
            `${this.duration} minutes`,
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: "14px",
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

        // FIXME: Works but creates a slight bug when overlapping with other tasks.
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

        this.nameText.setOrigin(0, 0.5);
        this.nameText.setPosition(
            this.icon.x + this.icon.displayWidth * 0.75,
            this.y
        );

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
        this.icon.setPosition(this.x, this.y);

        this.durationText.setText(`${this.duration} minutes`);
        this.durationText.setOrigin(0.5, 0.5);
        this.durationText.setPosition(
            this.x,
            this.y + this.displayHeight * 0.3
        );
    }

    public update() {
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
