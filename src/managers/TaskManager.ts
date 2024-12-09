import Button from "../gameobjects/Button";
import Machine from "../gameobjects/Machine";
import Task from "../gameobjects/Task";
import TaskBar from "../gameobjects/TaskBar";

interface MachineDimensions {
    width: number;
    height: number;
    x: number;
    y: number;
    capacity: number;
}

type MachineDimsDictionary = {
    [numMachines: number]: {
        [machineNo: number]: MachineDimensions;
    };
};

export default class TaskManager {
    private tasks: Task[] = [];
    private machines: Machine[] = [];
    private task_bar: TaskBar;
    private scene: Phaser.Scene;
    private total_duration: number;

    private task_types: { key: string; name: string; duration: number }[] = [
        { key: "carrots", name: "Carrots", duration: 25 },
        { key: "roast-chicken", name: "Roast Chicken", duration: 40 },
        { key: "roast-potatoes", name: "Roast Potatoes", duration: 30 },
        { key: "green-beans", name: "Green Beans", duration: 25 },
    ];

    private task_dims = {
        width: 150,
        height: 100,
    };

    private maxNumTasks = 5;

    private machine_dims: MachineDimsDictionary;
    private numMachines: number;
    private minNumMachines = 2;
    private maxNumMachines = 3;

    private total_duration_text!: Phaser.GameObjects.Text;
    private submit_button!: Button;

    constructor(scene: Phaser.Scene, task_keys: string[], machine_names: string[]) {
        this.scene = scene;

        // Validate Tasks
        if (task_keys.length > this.maxNumTasks) {
            throw new Error("Invalid number of tasks");
        }
        task_keys.forEach((key) => {
            if (!this.task_types.find((task) => task.key === key)) {
                throw new Error(`Invalid task key: ${key}`);
            }
        });

        // Validate Machines
        this.numMachines = machine_names.length;
        if (this.numMachines < this.minNumMachines || this.numMachines > this.maxNumMachines) {
            throw new Error("Invalid number of machines");
        }

        this.machine_dims = {
            2: {
                0: {
                    width: this.scene.scale.width * 0.45,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.25,
                    y: this.scene.scale.height * 0.4,
                    capacity: 6,
                },
                1: {
                    width: this.scene.scale.width * 0.45,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.75,
                    y: this.scene.scale.height * 0.4,
                    capacity: 6,
                },
            },
            3: {
                0: {
                    width: this.scene.scale.width * 0.3,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.175,
                    y: this.scene.scale.height * 0.4,
                    capacity: 6,
                },
                1: {
                    width: this.scene.scale.width * 0.3,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.5,
                    y: this.scene.scale.height * 0.4,
                    capacity: 6,
                },
                2: {
                    width: this.scene.scale.width * 0.3,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.825,
                    y: this.scene.scale.height * 0.4,
                    capacity: 6,
                },
            },
        };

        this.task_bar = new TaskBar(
            this.scene,
            this,
            "Task Bar",
            this.scene.scale.width / 2,
            this.scene.scale.height - this.task_dims.height * 0.6,
            this.scene.scale.width,
            this.task_dims.height * 1.2,
            0
        );

        // Adding all tasks onto the task bar
        for (let i = 0; i < task_keys.length; i++) {
            this.addTask(
                new Task(
                    this.scene,
                    this.task_types.find(
                        (task) => task.key === task_keys[i]
                    )!.name,
                    this.task_bar.getSlotCoords()[i].x,
                    this.task_bar.getSlotCoords()[i].y,
                    this.task_dims.width,
                    this.task_dims.height,
                    this.tasks.length,
                    this.task_types.find(
                        (task) => task.key === task_keys[i]
                    )!.duration,
                    task_keys[i]
                )
            );
        }

        // Adding all machines
        for (let i = 0; i < this.numMachines; i++) {
            this.addMachine(
                new Machine(
                    this.scene,
                    this,
                    machine_names[i],
                    this.machine_dims[this.numMachines][i].x,
                    this.machine_dims[this.numMachines][i].y,
                    this.machine_dims[this.numMachines][i].width,
                    this.machine_dims[this.numMachines][i].height,
                    this.machine_dims[this.numMachines][i].capacity,
                    i
                )
            );
        }

        this.total_duration = 0;

        this.total_duration_text = this.scene.add.text(
            this.scene.scale.width * 0.5,
            this.scene.scale.height - this.task_bar.displayHeight * 1.2,
            `${this.total_duration} minutes`,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: "18px",
                color: "#000000",
            }
        ).setOrigin(0.5, 0.5);

        this.submit_button = new Button(
            this.scene,
            this.total_duration_text.x,
            this.task_bar.y,
            0,
            "Submit",
            () => {
                this.scene.events.emit("submit");
            }
        ).setVisible(false).disableInteractive();
    }

    private addTask(task: Task) {
        this.tasks.push(task);
    }

    private addMachine(machine: Machine) {
        this.machines.push(machine);
    }

    private updateTotalDuration() {
        // Get max duration from all machines

        this.total_duration = this.machines.reduce((max, machine) => {
            return machine.getTotal() > max ? machine.getTotal() : max;
        }, 0);
        this.total_duration_text.setText(`${this.total_duration} minutes`);
    }

    private checkSubmittable(): boolean {
        return this.tasks.every((task) => task.isAttached());
    }

    private displaySubmitButton() {
        // console.log("Displaying submit button");
        this.submit_button.setVisible(true).setInteractive();
        this.task_bar.visible = false;
    }

    private hideSubmitButton() {
        // console.log("Hiding submit button");
        this.submit_button.setVisible(false).disableInteractive();
        this.task_bar.visible = true;
    }

    getTaskDims() {
        return this.task_dims;
    }

    getTotalDuration() {
        return this.total_duration;
    }

    update() {
        this.tasks.forEach((task) => task.update());

        this.machines.forEach((machine) => machine.update());
        this.updateTotalDuration();

        if (this.checkSubmittable()) {
            // TODO: Emitting events could be worth looking into.
            // this.scene.events.emit("submittable");

            this.displaySubmitButton();
        } else {
            this.hideSubmitButton();
        }
    }
}
