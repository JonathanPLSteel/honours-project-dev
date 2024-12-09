import Task from "./Task";
import TaskManager from "../managers/TaskManager";

export default class Machine extends Phaser.GameObjects.Container {
    scene: Phaser.Scene;
    taskManager: TaskManager;
    name: string;
    id: number;
    total: number;
    background: Phaser.GameObjects.Sprite;

    private dropZone: Phaser.GameObjects.Zone;

    private nameText!: Phaser.GameObjects.Text;
    private totalText!: Phaser.GameObjects.Text;
    private icon!: Phaser.GameObjects.Image;

    private tasks: Task[];

    private slot_coords: { x: number; y: number }[];
    private highlighted_slot: Phaser.GameObjects.Rectangle;
    private capacity: number;

    constructor(
        scene: Phaser.Scene,
        taskManager: TaskManager,
        name: string,
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
        this.name = name;
        this.capacity = capacity;
        this.id = id;
        this.total = 0;
        this.tasks = [];

        this.background = this.scene.add.sprite(0, 0, "machine-bg");
        this.background.setDisplaySize(width, height);
        this.add(this.background);

        this.setSize(width, height);

        this.dropZone = scene.add
            .zone(x, y, width, height)
            .setRectangleDropZone(width, height);

        this.addComponents();

        this.addDropZoneListeners();

        this.slot_coords = [
            {
                x: this.x - (this.taskManager.getTaskDims().width * 0.6),
                y: this.y - this.displayHeight * 0.15,
            },
            {
                x: this.x + (this.taskManager.getTaskDims().width * 0.6),
                y: this.y - this.displayHeight * 0.15,
            },
            {
                x: this.x - (this.taskManager.getTaskDims().width * 0.6),
                y: this.y + this.displayHeight * 0.075,
            },
            {
                x: this.x + (this.taskManager.getTaskDims().width * 0.6),
                y: this.y + this.displayHeight * 0.075,
            },
            {
                x: this.x - (this.taskManager.getTaskDims().width * 0.6),
                y: this.y + this.displayHeight * 0.3,
            },
            {
                x: this.x + (this.taskManager.getTaskDims().width * 0.6),
                y: this.y + this.displayHeight * 0.3,
            },
        ];

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

        this.icon = this.scene.add.image(
            0,
            -(this.displayHeight * 0.33),
            "chef"
        );
        this.icon.setDisplaySize(70, 70);
        this.icon.setOrigin(0.5, 0.5);
        this.add(this.icon);

        this.totalText = this.scene.add.text(
            0,
            this.displayHeight * 0.425,
            `${this.total} minutes`,
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: "16px",
                color: "#000000",
            }
        );
        this.totalText.setOrigin(0.5, 0.5);
        this.add(this.totalText);
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
        this.totalText.setText(`${this.total} minutes`);
    }

    private highlightSlot(coord: { x: number; y: number }) {
        this.highlighted_slot = this.scene.add.rectangle(
            coord.x,
            coord.y,
            this.taskManager.getTaskDims().width,
            this.taskManager.getTaskDims().height,
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

    public update() {}
}
