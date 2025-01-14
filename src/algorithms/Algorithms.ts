export interface AlgoTask {
    id: number;
    duration: number;
}

// Greedy Algorithm

export function greedy(
    tasks: AlgoTask[],
    machines_num: number
): { partition: AlgoTask[][]; sums: number[] } {
    // Sort the numbers in descending order
    tasks.sort(function (a, b) {
        return b.duration - a.duration;
    });

    // Create a list of sums of each partition.
    const sums: number[] = Array.from({ length: machines_num }, () => 0);

    // Create a list of partitions.
    const partition: AlgoTask[][] = Array.from({ length: machines_num }, () => []);

    // Greedily add numbers to partitions.
    for (let i = 0; i < tasks.length; i++) {
        // Find the partition with the smallest sum.
        let smallest_index = sums.indexOf(Math.min(...sums));

        // Insert this number into that partition (adding it to the sums list)
        sums[smallest_index] += tasks[i].duration;
        partition[smallest_index].push(tasks[i]);
    }

    return { partition, sums };
}

// Complete Greedy Algorithm

function partition_to_string(partition: AlgoTask[][] | null) {
    if (partition === null) {
        return "null"
    }
    let partition_string: string = "["
    for (const machine of partition) {
        partition_string += "[ "
        for (const task of machine) {
            partition_string += `${task.duration} `
        }
        partition_string += " ]"
    }
    return partition_string + "]"
}

function get_partition_sums(partition: AlgoTask[][] | null): number[] {
    if (partition === null) {
        throw new Error("Partition is null");
    }
    const subset_sums: number[] = partition.map((subset) =>
        subset.reduce((total, task) => total + task.duration, 0)
    );
    return subset_sums;
}

// Function to calculate the sum of subsets and return the maximum sum difference
function partition_difference(partition: AlgoTask[][] | null): number {
    return (
        Math.max(...get_partition_sums(partition)) -
        Math.min(...get_partition_sums(partition))
    );
}

// Recursive DFS search to explore all partitions
function dfs_partition(
    tasks: AlgoTask[],
    machines_num: number,
    current_partition: AlgoTask[][] | null = null,
    index: number = 0
): { diff: number; partition: AlgoTask[][] | null } {
    // Setup: Create partition array
    if (current_partition === null) {
        current_partition = Array.from({ length: machines_num }, () => []);
    }

    // console.log(`Index: ${index} Current: ${partition_to_string(current_partition)}`)

    // Base Case: If we have assigned all the numbers, compute the partition difference
    if (index == tasks.length) {
        return {
            diff: partition_difference(current_partition),
            partition: current_partition,
        };
    }

    // Recursive Case: Try assigning the current task to each machine and recurse
    let best_diff = Infinity;
    let best_partition: AlgoTask[][] | null = null;

    for (let i = 0; i < machines_num; i++) {
        // Assign the task to the i-th machine
        current_partition[i].push(tasks[index]);

        // Recur to the next number
        const { diff, partition } = dfs_partition(
            tasks,
            machines_num,
            current_partition,
            index + 1
        );

        // Check if this partition has a better (lower) difference
        if (diff < best_diff && partition !== null) {
            best_diff = diff;
            best_partition = partition.map(group => [...group]); // Deep copy to avoid mutation issues;
        }

        // Backtrack: remove the number from the current subset
        current_partition[i].pop();
    }

    return { diff: best_diff, partition: best_partition };
}

export function complete_greedy(
    tasks: AlgoTask[],
    machines_num: number = 2
): { partition: AlgoTask[][]; sums: number[] } {
    const { diff: best_diff, partition: best_partition } = dfs_partition(
        tasks,
        machines_num
    );

    if (best_partition === null) {
        throw new Error("Best partition is null.");
    }

    return {
        partition: best_partition,
        sums: get_partition_sums(best_partition),
    };
}
