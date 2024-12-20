import { Scene } from "phaser";
import { QuizLevel } from "../../managers/LevelManager";
import AnswersManager from "../../managers/AnswersManager";

export class Quiz extends Scene {
    private level: QuizLevel;
    private answersManager: AnswersManager;
    private currentQuestionIndex: number;

    private questionText!: Phaser.GameObjects.Text;

    constructor() {
        super("Quiz");
    }

    create(data: { level: QuizLevel }) {
        this.level = data.level;
        this.currentQuestionIndex = 0;

        console.log(this.level.questions);
        this.startQuiz();
    }

    private startQuiz() {
        this.startQuestion(this.currentQuestionIndex);
        this.events.on("correctAnswer", () => {
            this.currentQuestionIndex++;
            this.answersManager.destroy();
            this.questionText.destroy();
            if (this.currentQuestionIndex < this.level.questions.length) {
                this.startQuestion(this.currentQuestionIndex);
            } else {
                this.scene.start("LevelSelect", { grade: this.level.grade });
            }
        });
    }

    private startQuestion(index: number) {
        console.log(this.level.questions[index]);
        this.displayQuestion(this.level.questions[index]);
        this.answersManager = new AnswersManager(
            this,
            this.level.choices[index],
            this.level.correct[index]
        );
    }

    private displayQuestion(text: string) {
        this.questionText = this.add.text(
            this.scale.width / 2,
            100,
            text,
            {
                fontFamily: "WorkSansBold, Arial, sans-serif",
                fontSize: 28,
                color: "#000000",
                align: "center",
                wordWrap: { width: this.scale.width * 0.9 },
            }
        ).setOrigin(0.5);
    }
}