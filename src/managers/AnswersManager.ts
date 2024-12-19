import Answer from "../gameobjects/Answer";

export default class AnswersManager {
    private scene: Phaser.Scene;
    private answers: Answer[];
    private correct_index: number;

    constructor(
        scene: Phaser.Scene,
        answer_strings: string[],
        correct_index: number
    ) {
        this.scene = scene;
        this.correct_index = correct_index;
        this.answers = this.createAnswers(answer_strings);
    }

    private createAnswers(answer_strings: string[]): Answer[] {
        let answers: Answer[] = [];

        let x_coords: number[] = [];

        // Layouts for even and odd number of answers
        if (answer_strings.length % 2 === 0) {
            for (let i = 1; i <= answer_strings.length / 2; i++) {
                x_coords.push(
                    this.scene.scale.width / 2 -
                        i * 200
                );
            }

            for (let i = 1; i <= answer_strings.length / 2; i++) {
                x_coords.push(
                    this.scene.scale.width / 2 +
                        i * 200
                );
            }

            x_coords.sort((a, b) => a - b);
        } else {
            x_coords.push(this.scene.scale.width / 2);
            for (let i = 1; i <= Math.floor(answer_strings.length / 2); i++) {
                x_coords.push(
                    this.scene.scale.width / 2 - i * 200
                );
            }
            for (let i = 1; i <= Math.floor(answer_strings.length / 2); i++) {
                x_coords.push(
                    this.scene.scale.width / 2 + i * 200
                );
            }
            x_coords.sort((a, b) => a - b);
        }

        let y = this.scene.scale.height - 75;

        answer_strings.forEach((answer_string, index) => {
            let answer = new Answer(
                this.scene,
                answer_string,
                x_coords[index],
                y,
                150,
                100,
                index === this.correct_index
            );
            answers.push(answer);
        });

        return answers;
    }

    destroy() {
        this.answers.forEach((answer) => {
            answer.destroy();
        });
    }
}
