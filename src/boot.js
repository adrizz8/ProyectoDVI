import Phaser from 'phaser'


import platform from '../assets/sprites/platform.png'
import base from '../assets/sprites/base.png'
import star from '../assets/sprites/star.png'
import player from '../assets/sprites/protaOW.png'
import logo from '../assets/images/logo.png'
import fondo from '../assets/images/fondo.png'
import toy from '../assets/sprites/player.png'
import battleUI from '../assets/images/battleui_vacio.png'
import fondoCombate from '../assets/images/fondoCombate.png'
import playerFace from '../assets/sprites/protanuevo.png'
import mainscene from '../assets/images/mapa1.json'
import outdoorMap from '../assets/images/mapaFuera.json'
import tileset from '../assets/images/tilesetexterior.png'
import tilesInterior from "../assets/images/tilesinterior.png"
import tilesCafeteria from "../assets/images/tilesCafeteria.png"
import boton_luchar from '../assets/images/boton_luchar.png'
import boton_habilidades from '../assets/images/boton_habilidades.png'
import boton_mochila from '../assets/images/boton_mochila.png'
import boton_huir from '../assets/images/boton_huir.png'
import boton_guardia from '../assets/images/boton_guardia.png'
import prota_battle from '../assets/sprites/prota_battle.png'
import player2_battle from '../assets/sprites/player2_battle.png'
import player3_battle from '../assets/sprites/player3_battle.png'
import player4_battle from '../assets/sprites/player4_battle.png'

import estrategiaUI from '../assets/images/estrategiaui.png'
import menuPrincipal from '../assets/images/menuprincipal.png'

import formulario from '../assets/images/formulario.png'
import bus from '../assets/sprites/bus_anim.png'
import arrancar from '../assets/music/arrancar.wav'
import parar from '../assets/music/parar.wav'
import carretera from '../assets/music/carretera.wav'
import carre_join from '../assets/music/carre_join.wav'

import music_battle from '../assets/music/batalla_normal_music.mp3'
import music_boss from '../assets/music/batalla_boss_music.mp3'
import music_exterior from '../assets/music/exterior_music.mp3'
import music_interior from '../assets/music/interior_music_acreditar.mp3'
//Puse 2 porque no me decidía
import music_mazmorra from '../assets/music/mazmorra_music_1.mp3'
import music_mazmorra2 from '../assets/music/mazmorra_music_2.mp3'


/**
 * Escena para la precarga de los assets que se usarán en el juego.
 * Esta escena se puede mejorar añadiendo una imagen del juego y una 
 * barra de progreso de carga de los assets
 * @see {@link https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/} como ejemplo
 * sobre cómo hacer una barra de progreso.
 */
export default class Boot extends Phaser.Scene {
  /**
   * Constructor de la escena
   */
  constructor() {
    super({ key: 'boot' });
  }

  /**
   * Carga de los assets del juego
   */
  preload() {
    // Con setPath podemos establecer el prefijo que se añadirá a todos los load que aparecen a continuación
    //this.load.setPath('assets/sprites/');
    this.load.image('platform', platform);
    this.load.image('base', base);
    this.load.image('star', star);
    this.load.spritesheet('player', player, { frameWidth: 68, frameHeight: 72 });
    this.load.image('toy', toy);
    this.load.image('logo', logo);
    this.load.image('fondo', fondo);
    this.load.image('or_gate', fondo);
    this.load.image('and_gate', fondo);
    this.load.image('not_gate', fondo);
    this.load.image('xor_gate', fondo);
    this.load.image('cable', base);
    this.load.image('boton', star);
    this.load.image('bombilla', toy);
    this.load.image('battleUI', battleUI);
    this.load.image('fondoCombate', fondoCombate);
    this.load.spritesheet('playerFace', playerFace, { frameWidth: 68, frameHeight: 72 });
    this.load.spritesheet('bus', bus, { frameWidth: 384, frameHeight: 384 });
    this.load.tilemapTiledJSON('mainscene', mainscene);
    this.load.tilemapTiledJSON('outdoorMap', outdoorMap);
    this.load.image('tilesinterior', tilesInterior);
    this.load.image('tilesCafeteria', tilesCafeteria);

    this.load.spritesheet('tileset', tileset, {
      frameWidth: 32,
      frameHeight: 32
    });
    // this.load.image('tileset', tileset);
    this.load.image('formulario', formulario);

    this.load.image('boton_luchar', boton_luchar);
    this.load.image('boton_habilidades', boton_habilidades);
    this.load.image('boton_mochila', boton_mochila);
    this.load.image('boton_huir', boton_huir);
    this.load.image('boton_guardia', boton_guardia);
    this.load.image('prota_battle', prota_battle);
    this.load.image('player2_battle', player2_battle);
    this.load.image('player3_battle', player3_battle);
    this.load.image('player4_battle', player4_battle);

    this.load.image('menuPrincipal', menuPrincipal);
    this.load.image('estrategiaUI', estrategiaUI);
    this.load.audio('arrancar', arrancar);
    this.load.audio('parar', parar);
    this.load.audio('carretera', carretera);
    this.load.audio('carre_join', carre_join);

    this.load.audio('music_battle', music_battle);
    this.load.audio('music_boss', music_boss);
    this.load.audio('music_exterior', music_exterior);
    this.load.audio('music_interior', music_interior);
    this.load.audio('music_mazmorra', music_mazmorra);
    this.load.audio('music_mazmorra2', music_mazmorra2);
  }

  /**
   * Creación de la escena. En este caso, solo cambiamos a la escena que representa el
   * nivel del juego
   */
  create() {
    // Inicializamos el contador de horas si todavía no existe
    if (this.registry.get('horasJuego') === undefined) {
      this.registry.set('horasJuego', 0);
    }

    this.scene.start('entradaMazmorra', { entrada: 'pasillo' });

  }
}