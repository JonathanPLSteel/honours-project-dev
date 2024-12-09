export interface Level {
    id: number;
    name: string;
    task_keys: string[];
    machine_names: string[];
    scoreChart: { [key: number]: number };
}

export default class LevelManager {
    private levels: Level[];

    constructor() {
        this.levels = [
            {
                id: 1,
                name: "Level 1",
                task_keys: ["carrots", "roast-chicken", "roast-potatoes"],
                machine_names: ["Chef Jonathan", "Chef Julian"],
                scoreChart: {
                    70: 1,
                    65: 2,
                    55: 3,
                }
            },
            {
                id: 2,
                name: "Level 2",
                task_keys: ["carrots", "roast-chicken", "roast-potatoes", "green-beans"],
                machine_names: ["Chef Jonathan", "Chef Julian"],
                scoreChart: {
                    80: 1,
                    70: 2,
                    65: 3,
                }
            },
            {
                id: 3,
                name: "Level 3",
                task_keys: ["carrots", "roast-chicken", "roast-potatoes", "green-beans", "green-beans"],
                machine_names: ["Chef Jonathan", "Chef Julian"],
                scoreChart: {
                    90: 1,
                    80: 2,
                    75: 3,
                }
            },
            {
                id: 4,
                name: "Level 4",
                task_keys: ["carrots", "roast-chicken", "roast-potatoes", "green-beans", "green-beans"],
                machine_names: ["Chef Jonathan", "Chef Julian", "Chef Jacob"],
                scoreChart: {
                    75: 1,
                    65: 2,
                    55: 3,
                }
            },
        ];
    }

    public getAllLevels(): Level[] {
        return this.levels;
    }

    public loadLevel(level: number): Level {
        if (level < 1 || level > this.levels.length) {
            throw new Error("Invalid level");
        }
        return this.levels[level - 1];
    }
}
    