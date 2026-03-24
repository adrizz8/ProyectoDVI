import Phaser, { Physics } from 'phaser';

export default class trigger_parada extends Phaser.GameObjects.Sprite{

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
        this.setDepth(-1);

    }



}