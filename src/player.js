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
        this.label = this.scene.add.text(10, 10, "", { fontSize: 20 });
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.interactKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.updateScore();

        // Definición de animaciones direccionales
        const animsConfig = [
            { key: 'down', start: 0, end: 3 },
            { key: 'left', start: 4, end: 7 },
            { key: 'right', start: 8, end: 11 },
            { key: 'up', start: 12, end: 15 }
        ];

        animsConfig.forEach(cfg => {
            // Animación de caminar
            if (!this.scene.anims.exists(`walk-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `walk-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('player', { start: cfg.start, end: cfg.end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            // Animación de reposo (solo el primer frame de esa dirección)
            if (!this.scene.anims.exists(`idle-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `idle-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('player', { start: cfg.start, end: cfg.start }),
                    frameRate: 1,
                    repeat: -1
                });
            }
        });

        this.lastDirection = 'down';
        this.play('idle-down');
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

        let moving = false;

        if (this.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
            this.body.setVelocityX(0);
            this.lastDirection = 'up';
            moving = true;
        }
        else if (this.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.body.setVelocityY(0);
            this.lastDirection = 'left';
            moving = true;
        }
        else if (this.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.body.setVelocityY(0);
            this.lastDirection = 'right';
            moving = true;
        }
        else if (this.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
            this.body.setVelocityX(0);
            this.lastDirection = 'down';
            moving = true;
        } else {
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
        }

        // Reproducir la animación correspondiente: walk o idle según la última dirección
        const animState = moving ? 'walk' : 'idle';
        this.play(`${animState}-${this.lastDirection}`, true);
    }

}
