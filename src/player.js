import Phaser from 'phaser';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */
export default class Player extends Phaser.GameObjects.Sprite {

    /**
     * Constructor del jugador
     * @param {Phaser.Scene} scene Escena a la que pertenece el jugador
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     */
    constructor(scene, x, y) {
        super(scene, x, y);	
        this.score = 0;
	
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        // Queremos que el jugador no se salga de los límites del mundo
        this.body.setCollideWorldBounds();
        this.speed = 300;
        this.jumpSpeed = 700;
        // Esta label es la UI en la que pondremos la puntuación del jugador
        this.label = this.scene.add.text(10, 10, "", {fontSize: 20});
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.updateScore();

        this.scene.anims.create({
                key:'walk',
                frames:this.scene.anims.generateFrameNames('player',{start:0,ends:20}),
                frameRate:10,
                repeat:-1
           }
        )

        this.play('walk');
    }

    /**
     * El jugador ha recogido una estrella por lo que este método añade un punto y
     * actualiza la UI con la puntuación actual.
     */
    point() {
        this.score++;
        this.updateScore();
    }

    /**
     * Actualiza la UI con la puntuación actual
     */
    updateScore() {
        this.label.text = 'Score: ' + this.score;
    }

    /**
     * Métodos preUpdate de Phaser. En este caso solo se encarga del movimiento del jugador.
     * Como se puede ver, no se tratan las colisiones con las estrellas, ya que estas colisiones 
     * ya son gestionadas por la estrella (no gestionar las colisiones dos veces)
     * @override
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);
        if (this.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
            this.body.setVelocityX(0);
        }
        else if (this.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.body.setVelocityY(0);
        }
        else if (this.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.body.setVelocityY(0);
        }
        else if (this.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
            this.body.setVelocityX(0);
        } else {
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
        }
    }

}
