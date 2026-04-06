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
import cafeteria from '../assets/images/cafeteria.json'
import tileset from '../assets/images/tilesetexterior.png'
import tilesInterior from "../assets/images/tilesinterior.png"
import tilesInterior2 from "../assets/images/tilesInterior2.png"
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

import estrategiaUI from '../assets/images/estrategiaui4.png'
import menuPrincipal from '../assets/images/menuprincipal.png'

import formulario from '../assets/images/formulario.png'
import bus from '../assets/sprites/bus_anim.png'
import arrancar from '../assets/music/arrancar.wav'
import parar from '../assets/music/parar.wav'
import carretera from '../assets/music/carretera.wav'
import carre_join from '../assets/music/carre_join.wav'
import MapaFueraAux from '../assets/images/mapa_aux.json'
import pasillo from '../assets/images/pasillo.json'

import music_battle from '../assets/music/batalla_normal_music.mp3'
import music_boss from '../assets/music/batalla_boss_music.mp3'
import music_exterior from '../assets/music/exterior_music.mp3'
import music_interior from '../assets/music/interior_music_acreditar.mp3'
//Puse 2 porque no me decidía
import music_mazmorra from '../assets/music/mazmorra_music_1.mp3'
import music_mazmorra2 from '../assets/music/mazmorra_music_2.mp3'
import estudianteprimero from '../assets/sprites/estudianteprimero.png'
import npc1 from '../assets/sprites/npc1.png';
import npc2 from '../assets/sprites/npc2.png';
import npc3 from '../assets/sprites/npc3.png';
import npc4 from '../assets/sprites/npc4.png';

import or_gate from '../assets/images/or.png';
import and_gate from '../assets/images/and.png';
import not_gate from '../assets/images/not.png';
import xor_gate from '../assets/images/xor.png';
import cable_off from '../assets/images/cable_off.png';
import cable_on from '../assets/images/cable_on.png';


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
    this.load.spritesheet('estudianteprimero', estudianteprimero, { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet('npc1', npc1, { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet('npc2', npc2, { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet('npc3', npc3, { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet('npc4', npc4, { frameWidth: 68, frameHeight: 72 })
    this.load.image('toy', toy);
    this.load.image('logo', logo);
    this.load.image('fondo', fondo);
    this.load.image('or_gate', or_gate);
    this.load.image('and_gate', and_gate);
    this.load.image('not_gate', not_gate);
    this.load.image('xor_gate', xor_gate);
    this.load.image('cable_off', cable_off);
    this.load.image('cable_on', cable_on);
    this.load.image('boton', star);
    this.load.image('bombilla', toy);
    this.load.image('battleUI', battleUI);
    this.load.image('fondoCombate', fondoCombate);
    this.load.spritesheet('playerFace', playerFace, { frameWidth: 68, frameHeight: 72 });
    this.load.spritesheet('bus', bus, { frameWidth: 384, frameHeight: 384 });
    this.load.tilemapTiledJSON('mainscene', mainscene);
    this.load.tilemapTiledJSON('outdoorMap', outdoorMap);
    this.load.tilemapTiledJSON('cafeteria', cafeteria);
    this.load.image('tilesinterior', tilesInterior);
    this.load.image('tilesInterior2', tilesInterior2);
    this.load.image('tilesCafeteria', tilesCafeteria);

    this.load.spritesheet('tileset', tileset, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('tilesetexterior', tileset);
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

    this.load.tilemapTiledJSON('MapaFueraAuxt', MapaFueraAux);
    this.load.tilemapTiledJSON('pasillo', pasillo);

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


    this.scene.start('level2');

  }
}