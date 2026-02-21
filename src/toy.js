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

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.x, this.y);
    const threshold = 80;

    if (distance < threshold) {
      if (this.isPlayerLookingAtMe()) {
        this.setScale(1.1);

        // Si pulsa la tecla de interacción (C)
        if (Phaser.Input.Keyboard.JustDown(this.player.interactKey)) {
          this.interact();
        }
      } else {
        this.setScale(1);
      }
    } else {
      this.setScale(1);
    }
  }

  /**
   * Comprueba si el jugador está orientado hacia el objeto
   */
  isPlayerLookingAtMe() {
    const dx = this.x - this.player.x;
    const dy = this.y - this.player.y;
    const dir = this.player.lastDirection;

    // Margen de alineación para considerar que está "mirando" (no tiene que ser perfecto)
    const margin = 50;

    if (dir === 'right' && dx > 0 && Math.abs(dy) < margin) return true;
    if (dir === 'left' && dx < 0 && Math.abs(dy) < margin) return true;
    if (dir === 'up' && dy < 0 && Math.abs(dx) < margin) return true;
    if (dir === 'down' && dy > 0 && Math.abs(dx) < margin) return true;

    return false;
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
