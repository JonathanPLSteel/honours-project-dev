export default class Button extends Phaser.GameObjects.Container {
    scene: Phaser.Scene;
    id: number;
    text: string;
    callback: Function;
    width: number;
    height: number;

    private background: Phaser.GameObjects.Rectangle;
    private textObject: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        id: number,
        text: string,
        callback: Function
    ) {
        super(scene, x, y);

        this.scene = scene;
        this.id = id;
        this.text = text;
        this.callback = callback;

        // Text
        this.textObject = this.scene.add.text(0, 0, this.text, {
            fontFamily: 'WorkSansBold, Arial, sans-serif',
            fontSize: '20px',
            color: '#000000',
        }).setOrigin(0.5);

        this.background = this.scene.add.rectangle(0, 0, this.textObject.width * 1.5, this.textObject.height * 1.5, 0xffffff);
        this.background.setStrokeStyle(2, 0x000000);

        // Add background and text to container
        this.add([this.background, this.textObject]);

        // Make interactive
        this.width = this.background.width;
        this.height = this.background.height;
        this.setSize(this.width, this.height);

        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => this.background.setFillStyle(0x44ff44))
            .on('pointerout', () => this.background.setFillStyle(0xffffff))
            .on('pointerdown', () => this.background.setFillStyle(0x999999))
            .on('pointerup', () => {
                this.background.setFillStyle(0x44ff44);
                this.callback();
            });

        // Add this container to the scene
        this.scene.add.existing(this);
    }
}