export interface Dialogue {
    id: string;
    icon: string;
    text: string;
    name: string;
}

export default class DialogueManager {
    private scene: Phaser.Scene;
    private current_dialogue: Dialogue;

    private dialogueDimmer: Phaser.GameObjects.Rectangle;
    private dialogueBox: Phaser.GameObjects.Rectangle;
    private dialogueIcon: Phaser.GameObjects.Image;
    private dialogueText: Phaser.GameObjects.Text;
    private nameBox: Phaser.GameObjects.Rectangle;
    private nameText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public displayDialogue(dialogue: Dialogue) {
        this.current_dialogue = dialogue;

        this.scene.events.emit(`dialogue-${this.current_dialogue.id}-start`);

        console.log("Displaying dialogue");

        this.dialogueDimmer = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width,
            this.scene.scale.height,
            0x000000,
            0.3
        );
        this.dialogueDimmer.setOrigin(0, 0);

        this.dialogueIcon = this.scene.add.image(
            0,
            this.scene.scale.height,
            dialogue.icon
        );
        this.dialogueIcon.setOrigin(0, 1);
        this.dialogueIcon.setDisplaySize(300, 300);

        this.dialogueBox = this.scene.add.rectangle(
            this.dialogueIcon.x + this.dialogueIcon.width * 0.6,
            this.dialogueIcon.y - this.dialogueIcon.height / 2,
            this.scene.scale.width - this.dialogueIcon.width * 0.8,
            200,
            0xffffff
        );
        this.dialogueBox.setOrigin(0, 0);

        this.dialogueText = this.scene.add.text(
            this.dialogueBox.x + 25,
            this.dialogueBox.y + this.dialogueBox.height * 0.4,
            dialogue.text,
            {
                fontSize: "24px",
                fontFamily: "WorkSansRegular, Arial, sans-serif",
                color: "#000000",
                wordWrap: { width: this.dialogueBox.width - 50 },
            }
        );
        this.dialogueText.setOrigin(0, 0.5);

        this.nameBox = this.scene.add.rectangle(
            this.dialogueBox.x + 12.5,
            this.dialogueBox.y - 25,
            this.dialogueBox.width * 0.7,
            50,
            0x444444
        );
        this.nameBox.setOrigin(0, 0);

        this.nameText = this.scene.add.text(
            this.nameBox.x + 12.5,
            this.nameBox.y + this.nameBox.height / 2,
            dialogue.name,
            {
                fontSize: "24px",
                fontFamily: "WorkSansBold, Arial, sans-serif",
                color: "#ffffff",
            }
        );
        this.nameText.setOrigin(0, 0.5);

        console.log("Dialogue displayed with icon:", dialogue.icon);

        this.scene.input.once("pointerdown", this.closeDialogue, this);
    }

    private closeDialogue() {
        if (this.dialogueDimmer) this.dialogueDimmer.destroy();
        if (this.dialogueBox) this.dialogueBox.destroy();
        if (this.dialogueIcon) this.dialogueIcon.destroy();
        if (this.dialogueText) this.dialogueText.destroy();
        if (this.nameBox) this.nameBox.destroy();
        if (this.nameText) this.nameText.destroy();

        this.scene.events.emit(`dialogue-${this.current_dialogue.id}-end`);
    }
}
