import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/menus/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { SubmitScreen } from './scenes/splashes/SubmitScreen';
import { LevelSelect } from './scenes/menus/LevelSelect';
import { Cutscene } from './scenes/levels/Cutscene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.86.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        SubmitScreen,
        LevelSelect,
        Cutscene
    ]
};

export default new Game(config);
