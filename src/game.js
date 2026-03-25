import Boot from './boot.js';
import End from './end.js';
import Level from './level.js';
import Level2 from './level2.js';
import Level3 from './level3.js';
import Phaser from 'phaser';
import TitleScene from './TitleScene.js';
import IntroScene from './IntroScene.js';
import MenuPrincipal from './menuScenes/menuprincipal.js';
import EstrategiaScene from './menuScenes/EstrategiaScene.js';
import BattleScene from './battleScene/battle_scene.js';
import MapaFuera from './MapaFuera.js'

/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
    type: Phaser.AUTO,
    width: 1216,
    height: 640,
    parent: 'juego',

    //Para poder usar elementos DOM en Phaser, como los inputs de texto o los select, es necesario incluir esta propiedad en la configuración del juego
    dom: {
        createContainer: true
    },

    scale: {
        //mode: Phaser.Scale.FIT,  
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    pixelArt: true,
    scene: [Boot, TitleScene, IntroScene, Level, Level2, Level3, MenuPrincipal, EstrategiaScene, End, BattleScene,MapaFuera],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }

    }
};

new Phaser.Game(config);
