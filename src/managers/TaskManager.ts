import Button from "../gameobjects/Button";
import Machine from "../gameobjects/Machine";
import Task from "../gameobjects/Task";
import TaskBar from "../gameobjects/TaskBar";
import { Level, PuzzleLevel, TutorialLevel } from "./LevelManager";
import { AlgoTask, greedy, complete_greedy } from "../algorithms/Algorithms";

interface MachineDimensions {
    width: number;
    height: number;
    x: number;
    y: number;
    capacity: number;
}

export interface MachineProps {
    name: string;
    icon_key: string;
    rate: number;
    task_keys?: string[];
}

type MachineDimsDictionary = {
    [numMachines: number]: {
        [machineNo: number]: MachineDimensions;
    };
};

export default class TaskManager {
    private level: Level;
    private tasks: Task[] = [];
    private machines: Machine[] = [];
    private task_bar: TaskBar;
    private scene: Phaser.Scene;
    private total_duration: number;

    private task_types: { key: string; name: string; duration: number }[];

    private task_med_dims = {
        width: 125,
        height: 80,
    };
    private task_small_dims: { width: number; height: number };

    private machine_dims: MachineDimsDictionary;
    private numMachines: number;
    private minNumMachines = 2;
    private maxNumMachines = 3;

    private paused: boolean = false;

    // Game Objects
    private objective_text!: Phaser.GameObjects.Text;
    private total_duration_text!: Phaser.GameObjects.Text;
    private submit_button!: Button;
    private greedy_button!: Button;
    private complete_greedy_button!: Button;

    constructor(
        scene: Phaser.Scene,
        task_types: { key: string; name: string; duration: number }[],
        level: PuzzleLevel | TutorialLevel
    ) {
        this.scene = scene;
        this.level = level;
        this.task_types = task_types;

        // Validate Tasks
        // TODO: A bit clunky, could be improved
        if (this.level.type === "puzzle") {
            this.level.task_keys.forEach((key) => {
                if (!this.task_types.find((task) => task.key === key)) {
                    throw new Error(`Invalid task key: ${key}`);
                }
            });
        }

        // Validate Machines
        this.numMachines = this.level.machine_props.length;
        if (
            this.numMachines < this.minNumMachines ||
            this.numMachines > this.maxNumMachines
        ) {
            throw new Error("Invalid number of machines");
        }

        // Define machine dimensions
        this.machine_dims = {
            2: {
                0: {
                    width: this.scene.scale.width * 0.45,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.25,
                    y: this.scene.scale.height * 0.42,
                    capacity: 7,
                },
                1: {
                    width: this.scene.scale.width * 0.45,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.75,
                    y: this.scene.scale.height * 0.42,
                    capacity: 7,
                },
            },
            3: {
                0: {
                    width: this.scene.scale.width * 0.3,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.175,
                    y: this.scene.scale.height * 0.42,
                    capacity: 7,
                },
                1: {
                    width: this.scene.scale.width * 0.3,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.5,
                    y: this.scene.scale.height * 0.42,
                    capacity: 7,
                },
                2: {
                    width: this.scene.scale.width * 0.3,
                    height: this.scene.scale.height * 0.75,
                    x: this.scene.scale.width * 0.825,
                    y: this.scene.scale.height * 0.42,
                    capacity: 7,
                },
            },
        };

        // Define task small dimensions
        this.task_small_dims = {
            width: this.machine_dims[this.numMachines][0].width * 0.9,
            height: 40,
        };

        this.objective_text = this.scene.add.text(
            10,
            10,
            `Objective: ${this.level.objective}`,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: "15px",
                color: "#000000",
            }
        )

        if (this.level.type === "puzzle") {
            this.setupPuzzle(this.level.task_keys, this.level.machine_props);
        } else if (this.level.type === "tutorial") {
            this.setupTutorial(this.level.machine_props);
        }

        this.submit_button = new Button(
            this.scene,
            this.scene.scale.width / 2,
            this.machine_dims[this.numMachines][0].y +
                this.machine_dims[this.numMachines][0].height * 0.7,
            0,
            "Submit",
            () => {
                this.scene.events.emit("submit");
            }
        )
            .setVisible(false)
            .disableInteractive();
    }

    private setupPuzzle(task_keys: string[], machine_props: MachineProps[]) {
        // Adding task bar
        this.task_bar = new TaskBar(
            this.scene,
            this,
            "Task Bar",
            this.scene.scale.width / 2,
            this.scene.scale.height - this.task_med_dims.height * 0.6,
            this.scene.scale.width,
            this.task_med_dims.height * 1.2,
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
                    this.task_med_dims.width,
                    this.task_med_dims.height,
                    this.task_small_dims.width,
                    this.task_small_dims.height,
                    this.tasks.length,
                    this.task_types.find(
                        (task) => task.key === task_keys[i]
                    )!.duration,
                    task_keys[i],
                    true
                )
            );
        }

        // Adding all machines
        for (let i = 0; i < this.numMachines; i++) {
            this.addMachine(
                new Machine(
                    this.scene,
                    this,
                    machine_props[i],
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

        this.total_duration_text = this.scene.add
            .text(
                this.scene.scale.width * 0.5,
                this.scene.scale.height - this.task_bar.displayHeight * 1.3,
                `${this.total_duration} minutes`,
                {
                    fontFamily: "WorkSansBold, Arial, sans-serif",
                    fontSize: "18px",
                    color: "#000000",
                }
            )
            .setOrigin(0.5, 0.5);

        if (this.level.type === "puzzle") {
            if (this.level.greedy) {
                this.greedy_button = new Button(
                    this.scene,
                    this.machine_dims[this.numMachines][0].x,
                    this.total_duration_text.y,
                    0,
                    "Greedy Algorithm",
                    () => {
                        this.greedyAlgorithm();
                    },
                    0xF0AE4C
                )
                    .setVisible(true)
                    .setInteractive();
            }
            if (this.level.complete_greedy) {
                this.complete_greedy_button = new Button(
                    this.scene,
                    this.machine_dims[this.numMachines][this.numMachines - 1].x,
                    this.total_duration_text.y,
                    0,
                    "Complete Greedy Algorithm",
                    () => {
                        this.completeGreedyAlgorithm();
                    },
                    0xD69EFF
                )
                    .setVisible(true)
                    .setInteractive();
            }
        }
    }

    private setupTutorial(machine_props: MachineProps[]) {
        if (this.level.type != "tutorial") {
            throw new Error("Invalid level type");
        }

        // Adding all machines
        for (let i = 0; i < this.numMachines; i++) {
            const current_machine_props = machine_props[i];

            if (current_machine_props.task_keys) {
                let new_task_indices: number[] = [];
                for (let task_key of current_machine_props.task_keys) {
                    this.addTask(
                        new Task(
                            this.scene,
                            this.task_types.find(
                                (task) => task.key === task_key
                            )!.name,
                            0,
                            0,
                            this.task_med_dims.width,
                            this.task_med_dims.height,
                            this.task_small_dims.width,
                            this.task_small_dims.height,
                            this.tasks.length,
                            this.task_types.find(
                                (task) => task.key === task_key
                            )!.duration,
                            task_key,
                            false
                        )
                    );
                    new_task_indices.push(this.tasks.length - 1);
                }
                this.addMachine(
                    new Machine(
                        this.scene,
                        this,
                        machine_props[i],
                        this.machine_dims[this.numMachines][i].x,
                        this.machine_dims[this.numMachines][i].y,
                        this.machine_dims[this.numMachines][i].width,
                        this.machine_dims[this.numMachines][i].height,
                        this.machine_dims[this.numMachines][i].capacity,
                        i
                    )
                );
                for (let task_index of new_task_indices) {
                    this.machines[i].addTask(this.tasks[task_index]);
                }
            }
        }

        this.total_duration = 0;

        this.total_duration_text = this.scene.add
            .text(
                this.scene.scale.width * 0.5,
                this.machine_dims[this.numMachines][0].y +
                    this.machine_dims[this.numMachines][0].height * 0.6,
                `${this.total_duration} minutes`,
                {
                    fontFamily: "WorkSansBold, Arial, sans-serif",
                    fontSize: "18px",
                    color: "#000000",
                }
            )
            .setOrigin(0.5, 0.5);

        if (this.level.hidden_elements.includes("total_duration")) {
            this.total_duration_text.setVisible(false);
        }
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
            return machine.getAdjustedTotal() > max
                ? machine.getAdjustedTotal()
                : max;
        }, 0);
        if (this.total_duration_text && this.total_duration_text.active) {
            this.total_duration_text.setText(`${this.total_duration} minutes`);
        }
    }

    private checkSubmittable(): boolean {
        return this.tasks.every((task) => task.isAttached());
    }

    private displaySubmitButton() {
        this.submit_button.setVisible(true).setInteractive();
        this.task_bar.visible = false;
    }

    private hideSubmitButton() {
        // console.log("Hiding submit button");
        this.submit_button.setVisible(false).disableInteractive();
        this.task_bar.visible = true;
    }

    getTaskMedDims() {
        return this.task_med_dims;
    }

    getTaskSmallDims() {
        return this.task_small_dims;
    }

    getTotalDuration() {
        return this.total_duration;
    }

    public pause() {
        this.paused = true;
        this.tasks.forEach((task) => task.pause());

        if (this.level.type === "puzzle") this.submit_button.disableInteractive();
    }

    public resume() {
        this.paused = false;
        this.tasks.forEach((task) => task.resume());

        if (this.level.type === "puzzle") this.submit_button.setInteractive();
    }

    public triggerEntrances(total_duration: number) {
        this.tasks.forEach((task, index) => {
            this.scene.time.delayedCall((total_duration / this.tasks.length) * index, () => {
                task.enterAnimation(total_duration / this.tasks.length);
            });
        });
    }

    public triggerExits(total_duration: number) {
        this.tasks.forEach((task, index) => {
            console.log()
            this.scene.time.delayedCall((total_duration / this.tasks.length) * index, () => {
                task.exitAnimation(total_duration / this.tasks.length);
            });
        });
    }

    private tasksToAlgoTasks(): AlgoTask[] {
        return this.tasks.map((task) => {
            return {
                id: task.id,
                duration: task.duration,
            };
        });
    }

    private partitionTasks(partition: AlgoTask[][]) {
        partition.forEach((machine, i) => {
            machine.forEach((task) => {
                this.machines[i].addTask(this.tasks[task.id]);
            });
        });
    }

    private greedyAlgorithm() {
        let algoTasks = this.tasksToAlgoTasks();

        let greedyResult = greedy(algoTasks, this.numMachines);

        let partition = greedyResult.partition;

        console.log(partition);

        this.partitionTasks(partition);
    }

    private completeGreedyAlgorithm() {
        let algoTasks = this.tasksToAlgoTasks();

        let greedyResult = complete_greedy(algoTasks, this.numMachines);

        let partition = greedyResult.partition;

        console.log(partition);

        this.partitionTasks(partition);
    }

    public update() {
        if (this.paused) {
            return;
        }

        this.tasks.forEach((task) => task.update());

        this.machines.forEach((machine) => machine.update());

        this.updateTotalDuration();

        if (this.level.type === "puzzle") {

            if (this.submit_button && this.submit_button.active) {
                if (this.checkSubmittable()) {
                    // TODO: Emitting events could be worth looking into.
                    this.displaySubmitButton();
                } else {
                    this.hideSubmitButton();
                }
            }

            if (this.level.greedy && this.greedy_button.active) {
                if (this.machines.every((machine) => machine.tasksCount === 0)) {
                    this.greedy_button.setVisible(true).setInteractive();
                } else {
                    this.greedy_button.setVisible(false).disableInteractive();
                }
            }

            if (this.level.complete_greedy && this.complete_greedy_button.active) {
                if (this.machines.every((machine) => machine.tasksCount === 0)) {
                    this.complete_greedy_button.setVisible(true).setInteractive();
                } else {
                    this.complete_greedy_button.setVisible(false).disableInteractive();
                }
            }
        }
    }

    public destroy() {
        this.objective_text.destroy();

        this.tasks.forEach((task) => task.destroy());
        this.tasks = [];
        this.machines.forEach((machine) => machine.destroy());
        this.machines = [];

        // Destroy text
        if (this.total_duration_text) {
            this.total_duration_text.destroy();
        }

        if (this.level.type === "puzzle") {
            // Destroy task bar
            if (this.task_bar) {
                this.task_bar.destroy();
            }
            // Destroy submit button
            if (this.submit_button) {
                this.submit_button.destroy();
            }
        }
    }
}
