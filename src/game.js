import Boot from './boot.js';
import End from './scenes/core/end.js';
import level3 from './scenes/maps/level3.js'
import Phaser from 'phaser';
import TitleScene from './scenes/core/TitleScene.js';
import IntroScene from './scenes/core/IntroScene.js';
import MenuPrincipal from './scenes/menus/menuprincipal.js';
import EstrategiaScene from './scenes/menus/EstrategiaScene.js';
import MochilaScene from './scenes/menus/mochilaScene.js';
import Configuracion from './scenes/menus/Configuracion.js';
import BattleScene from './battle/battle_scene.js';
import MapaFuera from './scenes/maps/MapaFuera.js'
import Cafeteria from './scenes/maps/Cafeteria.js'
import Prematricula from './scenes/core/prematricula_scene.js'
import Pasillo from './scenes/maps/Pasillo.js';
import EntradaMazmorra from './scenes/dungeons/EntradaMazmorraScene.js';
import P1RightMazmorra from './scenes/dungeons/P1RightMazmorraScene.js';
import P1LeftMazmorra from './scenes/dungeons/P1LeftMazmorraScene.js';
import SalaLanchares from './scenes/dungeons/SalaLancharesScene.js';
import SalaMiniBoss from './scenes/dungeons/SalaMiniBossScene.js';
import DiplomaScene from './scenes/core/DiplomaScene.js';

import TiendaScene from './scenes/menus/tienda.js';
import GameOverScene from './scenes/core/GameOverScene.js';

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
        mode: Phaser.Scale.FIT,  
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'juego'
    },
    pixelArt: true,

    scene: [Boot, TitleScene, Prematricula, IntroScene, level3, MenuPrincipal, EstrategiaScene, MochilaScene, Configuracion, End, BattleScene, MapaFuera, Cafeteria, Pasillo, EntradaMazmorra, P1RightMazmorra, P1LeftMazmorra, SalaLanchares, SalaMiniBoss, GameOverScene,DiplomaScene],

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }

    }
};

new Phaser.Game(config);
