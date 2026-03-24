import Phaser, { Physics } from 'phaser';

export default class bus extends Phaser.GameObjects.Sprite{

    /**
     * Constructor del jugador
     * @param {Phaser.Scene} scene Escena a la que pertenece el jugador
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     */
    constructor(scene, x, y) {
        super(scene, x, y,'parada');

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

    }

    destroy(fromScene) {
        // 1. Desactivar físicas (por seguridad)
        if (this.body) {
            this.body.enable = false;
        }

        // 2. Llamar al destroy original de Phaser
        super.destroy(fromScene);
    }


}