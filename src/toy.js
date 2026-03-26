import Phaser from 'phaser'
import Player from './personajes/player.js';

/**
 * Clase que representa un objeto interactivo en el escenario.
 */
export default class Toy extends Phaser.GameObjects.Sprite {

  /**
   * Constructor del Objeto Toy
   * @param {Phaser.Scene} scene Escena a la que pertenece
   * @param {Player} player Jugador del juego
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {string} message Mensaje que dirá el objeto
   */
  /**
   * @param {object} [enemyStats] Stats del enemigo para el combate
   *   { name, hp, maxHp, damage } — si no se pasan, se usan valores por defecto
   */
  constructor(scene, player, x, y, message = "...", enemyStats = {}) {
    super(scene, x, y, 'toy');
    this.player = player;
    this.message = message;
    this.enemyStats = {
      name: enemyStats.name ?? 'Toy',
      hp: enemyStats.hp ?? 80,
      maxHp: enemyStats.maxHp ?? 80,
      damage: enemyStats.damage ?? 15,
    };
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this, true);
    this.scene.physics.add.collider(this, player);
  }

  /**
   * Lógica de actualización para detectar si el jugador mira el objeto y quiere interaccionar
   */
  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    this.player.isinteractuable(this);

  }



  /**
   * Al interactuar, lanza la escena de combate por turnos.
   * Pasa los stats del jugador y del enemigo (este Toy).
   */
  interact() {
    this.scene.scene.start('battle_scene', {
      // Stats del enemigo (cada Toy configura los suyos)
      enemyName: this.enemyStats.name,
      enemyHP: this.enemyStats.hp,
      enemyMaxHp: this.enemyStats.maxHp,
      enemyDamage: this.enemyStats.damage,
      enemySpriteKey: 'toy',
      // Escena a la que volver al terminar el combate
      originScene: this.scene.scene.key,
    });
    // Los stats del jugador los lee BattleScene directamente del GameManager
  }

}
