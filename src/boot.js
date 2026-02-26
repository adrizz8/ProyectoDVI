import Phaser from 'phaser'


import platform from '../assets/sprites/platform.png'
import base from '../assets/sprites/base.png'
import star from '../assets/sprites/star.png'
import player from '../assets/sprites/protaOW.png'
import logo from '../assets/images/logo.png'
import fondo from '../assets/images/fondo.png'
import toy from '../assets/sprites/player.png'



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
  }

  /**
   * Creación de la escena. En este caso, solo cambiamos a la escena que representa el
   * nivel del juego
   */
  create() {
    this.scene.start('TitleScene');
  }
}