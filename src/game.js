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
import MochilaScene from './menuScenes/mochilaScene.js';
import BattleScene from './battleScene/battle_scene.js';
import MapaFuera from './MapaFuera.js'
import Cafeteria from './Cafeteria.js'
import Prematricula from './prematricula_scene.js'
import MapaFueraAux from './MapaFueraAux.js';
import Pasillo from './Pasillo.js';
import EntradaMazmorra from './mazmorras/EntradaMazmorraScene.js';
import P1RightMazmorra from './mazmorras/P1RightMazmorraScene.js';
import P1LeftMazmorra from './mazmorras/P1LeftMazmorraScene.js';
import SalaLanchares from './mazmorras/SalaLancharesScene.js';
import SalaMiniBoss from './mazmorras/SalaMiniBossScene.js';

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

    scene: [Boot, TitleScene, Prematricula, IntroScene, Level, Level2, Level3, MenuPrincipal, EstrategiaScene, MochilaScene, End, BattleScene, MapaFuera, Cafeteria, MapaFueraAux, Pasillo, EntradaMazmorra, P1RightMazmorra, P1LeftMazmorra, SalaLanchares, SalaMiniBoss],

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }

    }
};

new Phaser.Game(config);
