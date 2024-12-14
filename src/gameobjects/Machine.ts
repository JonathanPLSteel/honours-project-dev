import Task from "./Task";
import TaskManager, { MachineProps } from "../managers/TaskManager";

export default class Machine extends Phaser.GameObjects.Container {
    scene: Phaser.Scene;
    taskManager: TaskManager;
    name: string;
    id: number;
    total: number;
    background: Phaser.GameObjects.Sprite;
    private tasks: Task[];
    private capacity: number;
    private icon_key: string;
    private rate: number;

    private rate_to_background_key: { [key: number]: string } = {
        1: "machine-bg-1",
        1.25: "machine-bg-2",
        1.5: "machine-bg-3",
        2: "machine-bg-4",
    };

    private dropZone: Phaser.GameObjects.Zone;

    private nameText!: Phaser.GameObjects.Text;
    private totalText!: Phaser.GameObjects.Text;
    private originalTotalText!: Phaser.GameObjects.Text;
    private icon!: Phaser.GameObjects.Image;

    private slot_coords: { x: number; y: number }[];
    private highlighted_slot: Phaser.GameObjects.Rectangle;

    constructor(
        scene: Phaser.Scene,
        taskManager: TaskManager,
        props: MachineProps,
        x: number,
        y: number,
        width: number,
        height: number,
        capacity: number,
        id: number
    ) {
        super(scene, x, y);

        this.scene = scene;
        this.taskManager = taskManager;
        this.name = props.name;
        this.capacity = capacity;
        this.id = id;
        this.total = 0;
        this.tasks = [];
        this.icon_key = props.icon_key;
        this.rate = props.rate;

        this.background = this.scene.add.sprite(0, 0, this.rate_to_background_key[this.rate]);
        this.background.setDisplaySize(width, height);
        this.add(this.background);

        this.setSize(width, height);

        this.dropZone = scene.add
            .zone(x, y, width, height)
            .setRectangleDropZone(width, height);

        this.addComponents();

        this.addDropZoneListeners();

        this.slot_coords = [];
        for (let i = 0; i < this.capacity; i++) {
            this.slot_coords.push({
                x: this.x,
                y: this.y - this.displayHeight * 0.2 + i * this.taskManager.getTaskSmallDims().height * 1.25,
            });
        }

        // Add the sprite to the scene
        this.scene.add.existing(this);
    }

    private addComponents() {
        this.nameText = this.scene.add.text(
            0,
            -(this.displayHeight * 0.435),
            this.name,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: "18px",
                color: "#000000",
            }
        );
        this.nameText.setOrigin(0.5, 0.5);
        this.add(this.nameText);

        console.log(this.icon_key);

        this.icon = this.scene.add.image(
            0,
            -(this.displayHeight * 0.33),
            this.icon_key
        );
        this.icon.setDisplaySize(70, 70);
        this.icon.setOrigin(0.5, 0.5);
        this.add(this.icon);

        this.totalText = this.scene.add.text(
            0,
            this.displayHeight * 0.425,
            `${this.getAdjustedTotal()} minutes`,
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: "16px",
                color: "#000000",
            }
        );
        this.totalText.setOrigin(0.5, 0.5);
        this.add(this.totalText);

        this.originalTotalText = this.scene.add.text(
            -this.totalText.displayWidth,
            this.displayHeight * 0.425,
            `${this.total}`,
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: "16px",
                color: "#000000",
            }
        );
        this.originalTotalText.setOrigin(0.5, 0.5);
        this.add(this.originalTotalText)

        if (this.rate === 1) {
            this.originalTotalText.setVisible(false);
        }
    }

    private addDropZoneListeners() {
        this.scene.input.on(
            "dragenter",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite,
                dropZone: Phaser.GameObjects.Zone
            ) => {
                if (dropZone === this.dropZone) {
                    if (gameObject instanceof Task) {
                        this.removeTask(gameObject.id);
                    }

                    if (this.tasks.length < this.capacity) {
                        this.highlightSlot(this.slot_coords[this.tasks.length]);
                    }
                }
            }
        );

        this.scene.input.on(
            "dragleave",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite,
                dropZone: Phaser.GameObjects.Zone
            ) => {
                if (dropZone === this.dropZone && this.tasks.length < this.capacity) {
                    this.unhighlightSlot();
                }
            }
        );

        this.scene.input.on(
            "drop",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite,
                dropZone: Phaser.GameObjects.Zone
            ) => {
                if (dropZone === this.dropZone && this.tasks.length < this.capacity) {

                    if (gameObject instanceof Task) {
                        this.addTask(gameObject);
                        this.unhighlightSlot();
                    } else {
                        console.error("Invalid object dropped into machine!");
                    }

                    // Snap the task to the center of the machine
                    gameObject.x = this.slot_coords[this.tasks.length - 1].x;
                    gameObject.y = this.slot_coords[this.tasks.length - 1].y;

                    this.background.clearTint();
                }
            }
        );
    }

    private addTask(task: Task) {
        task.attach();
        this.tasks.push(task);
        this.total += task.duration;
        this.updateTotalText();
    }

    private removeTask(task_index: number) {
        let index = this.tasks.findIndex((task) => task.id === task_index);
        if (index !== -1) {
            this.total -= this.tasks[index].duration;

            this.updateTotalText();

            this.tasks[index].detach();

            // Task Removed
            this.tasks.splice(index, 1);

            // Update the positions of the remaining tasks
            this.tasks.forEach((task, i) => {
                task.x = this.slot_coords[i].x;
                task.y = this.slot_coords[i].y;
            });
        }
    }

    private updateTotalText() {
        this.originalTotalText.setText(`${this.total}`);
        this.totalText.setText(`${this.getAdjustedTotal()} minutes`);
    }

    private highlightSlot(coord: { x: number; y: number }) {
        this.highlighted_slot = this.scene.add.rectangle(
            coord.x,
            coord.y,
            this.taskManager.getTaskSmallDims().width,
            this.taskManager.getTaskSmallDims().height,
            0xe5e5e5,
            0.5
        );
        this.highlighted_slot.setDepth(2);
    }

    private highlightAllSlots() {
        for (let i = 0; i < this.capacity; i++) {
            this.highlightSlot(this.slot_coords[i]);
        }
    }

    private unhighlightSlot() {
        this.highlighted_slot.destroy();
    }

    public getTotal(): number {
        return this.total;
    }

    public getAdjustedTotal(): number {
        return this.total / this.rate;
    }

    public update() {}
}
