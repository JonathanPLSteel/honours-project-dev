import { Scene } from "phaser";
import { QuizLevel } from "../../managers/LevelManager";
import AnswersManager from "../../managers/AnswersManager";

export class Quiz extends Scene {
    private level: QuizLevel;
    private answersManager: AnswersManager;
    private currentQuestionIndex: number;
    private number_of_questions: number;
    private question_scores: number[];
    private start_time: number;

    private questionText!: Phaser.GameObjects.Text;

    constructor() {
        super("Quiz");
    }

    create(data: { level: QuizLevel }) {
        this.level = data.level;
        this.currentQuestionIndex = 0;
        this.number_of_questions = this.level.questions.length;
        this.question_scores = Array(this.number_of_questions).fill(1);

        this.start_time = Date.now();

        this.startQuiz();
    }

    private startQuiz() {

        this.displayQuestion(this.level.questions[this.currentQuestionIndex]);
        this.answersManager = new AnswersManager(
            this,
            this.level.choices[this.currentQuestionIndex],
            this.level.correct[this.currentQuestionIndex]
        );

        this.events.on("wrongAnswer", () => {
            // console.log("Received Wrong answer");
            this.question_scores[this.currentQuestionIndex] = 0;
            // console.log(`Index: ${this.currentQuestionIndex}, Scores: ${this.question_scores}`);
        });

        this.events.on("correctAnswer", () => {
            this.events.off("correctAnswer");
            this.currentQuestionIndex++;
            this.answersManager.destroy();
            this.questionText.destroy();
            if (this.currentQuestionIndex < this.level.questions.length) {
                this.startQuiz();
            } else {
                this.currentQuestionIndex = 0;

                let end_time = Date.now();
                this.level.time_taken = end_time - this.start_time;

                let score = this.question_scores.reduce((a, b) => a + b, 0);
                let scaled_score = score / this.number_of_questions;

                if (scaled_score < 0.5) {
                    this.level.latest_grade = 1;
                } else if (scaled_score < 1) {
                    this.level.latest_grade = 2;
                } else {
                    this.level.latest_grade = 3;
                }

                console.log(`Score: ${score} / ${this.number_of_questions} = ${scaled_score} -> ${this.level.latest_grade}`);

                this.scene.start("LevelSelect", { level: this.level });
            }
        });
    }

    private displayQuestion(text: string) {
        this.questionText = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.4,
            text,
            {
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                fontSize: "36px",
                color: "#000000",
                align: "center",
                wordWrap: { width: this.scale.width * 0.85 },
            }
        ).setOrigin(0.5);
    }
}