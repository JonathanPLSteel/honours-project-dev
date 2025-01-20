import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.preloadImages();
        this.preloadAudio();
        this.preloadFonts();
        this.preloadData();  
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }

    private preloadImages() {
        this.load.setPath('assets/images');

        // this.load.image('logo', 'logo.png');
        this.load.image('task-med-bg', 'backgrounds/task-med-bg.png');
        this.load.image('task-small-bg', 'backgrounds/task-small-bg.png');
        this.load.image('machine-bg-1', 'backgrounds/machine-bg-1.png')
        this.load.image('machine-bg-2', 'backgrounds/machine-bg-2.png')
        this.load.image('machine-bg-3', 'backgrounds/machine-bg-3.png')
        this.load.image('machine-bg-4', 'backgrounds/machine-bg-4.png')

        this.load.image('chef', 'chefs/chef.png')
        this.load.image('chef-jonathan', 'chefs/chef-jonathan.png')
        this.load.image('chef-julian', 'chefs/chef-julian.png')
        this.load.image('chef-jacob', 'chefs/chef-jacob.png')
        this.load.image('chef-simar', 'chefs/chef-simar.png')
        this.load.image('head-chef-george', 'chefs/head-chef-george.png')

        this.load.image('carrots', 'food/carrots.png');
        this.load.image('roast-chicken', 'food/roast-chicken.png')
        this.load.image('roast-potatoes', 'food/roast-potatoes.png')
        this.load.image('green-beans', 'food/green-beans.png')
        this.load.image('leg-of-lamb', 'food/leg-of-lamb.png')
        this.load.image('yorkshire-puddings', 'food/yorkshire-puddings.png')

        this.load.image('completed', 'levels/completed.png')
        this.load.image('locked', 'levels/locked.png')
        this.load.image('cutscene', 'levels/cutscene.png')
        this.load.image('puzzle', 'levels/puzzle.png')
        this.load.image('tutorial', 'levels/tutorial.png')
        this.load.image('quiz', 'levels/quiz.png')

        this.load.image('star', 'star.png')
    }

    private preloadAudio() {
        this.load.setPath('assets/audio');

        this.load.audio('card-fan-1', 'card-fan-1.ogg');
        this.load.audio('card-fan-2', 'card-fan-2.ogg');
        this.load.audio('card-place-1', 'card-place-1.ogg');
        this.load.audio('card-place-2', 'card-place-2.ogg');
        this.load.audio('card-place-3', 'card-place-3.ogg');
        this.load.audio('card-place-4', 'card-place-4.ogg');
        this.load.audio('card-place-5', 'card-place-5.ogg');
        this.load.audio('card-place-6', 'card-place-6.ogg');
        this.load.audio('switch', 'switch.ogg');
        this.load.audio('success', 'success.ogg');
    }

    private preloadFonts() {
        this.add.text(0, 0, 'Loading...', { fontFamily: 'WorkSansRegular', fontSize: '1px' }).setVisible(false);
        this.add.text(0, 0, 'Loading...', { fontFamily: 'WorkSansBold', fontSize: '1px' }).setVisible(false);
        this.add.text(0, 0, 'Loading...', { fontFamily: 'WorkSansSemiBold', fontSize: '1px' }).setVisible(false);
    }

    private preloadData() {
        this.load.setPath('assets/data');

        this.load.json("levels", "levels.json");
        this.load.json("cutscenes", "cutscenes.json");
        this.load.json("tutorials", "tutorials.json");
        this.load.json("puzzles", "puzzles.json");
        this.load.json("quizzes", "quizzes.json");
        this.load.json("worlds", "worlds.json");
        this.load.json("task_types", "task_types.json");
    }
}
