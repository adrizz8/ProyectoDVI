import Phaser from 'phaser'

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
  constructor(scene, player, x, y, message = "...") {
    super(scene, x, y, 'toy');
    this.player = player;
    this.message = message;
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
   * Acción que ocurre al interaccionar
   */
  interact() {

    // Llamamos al método de diálogo de la escena
    if (this.scene.showDialogue) {
      this.scene.showDialogue(this.message);
    }
  }

}
