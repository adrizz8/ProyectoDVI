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

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.frozen = false;
        // 1. Ajustar el tamaño (Ancho, Alto)
// Prueba con valores pequeños, como el 50% del ancho y el 30% del alto del sprite
    this.body.setSize(this.width, this.height);

// 2. Ajustar el desplazamiento (Offset) para centrar la caja en los pies
// Tienes que mover la caja manualmente para que quede abajo
    this.body.setOffset(this.width * 0.25, this.height * 0.7);
        // Queremos que el jugador no se salga de los límites del mundo
        this.body.setCollideWorldBounds();
        this.speed = 300;

        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.interactKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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
     * Métodos preUpdate de Phaser. En este caso solo se encarga del movimiento del jugador.
     * Como se puede ver, no se tratan las colisiones con las estrellas, ya que estas colisiones 
     * ya son gestionadas por la estrella (no gestionar las colisiones dos veces)
     * @override
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);

         if (this.frozen) {
            this.body.setVelocity(0, 0);
            this.anims.stop();
            return;
        }

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

    isinteractuable(object) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, object.x, object.y);
        const threshold = 80;
        if (distance < threshold) {
           if (this.iamlookingat(object)) {
                object.setScale(1.1);

                // Si pulsa la tecla de interacción (E)
                if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                object.interact();
                }
            } else {
                object.setScale(1);
            }
            } else {
            object.setScale(1); 
        }
    }

    iamlookingat(object) {
        const dx = object.x - this.x;
        const dy = object.y - this.y;
        const dir = this.lastDirection;

        // Margen de alineación para considerar que está "mirando" (no tiene que ser perfecto)
        const margin = 50;

        if (dir === 'right' && dx > 0 && Math.abs(dy) < margin) return true;
        if (dir === 'left' && dx < 0 && Math.abs(dy) < margin) return true;
        if (dir === 'up' && dy < 0 && Math.abs(dx) < margin) return true;
        if (dir === 'down' && dy > 0 && Math.abs(dx) < margin) return true;

        return false;
    }

    freeze(){
        this.frozen=true;
    }
    unfreeze(){
        this.frozen=false;
    }
}  
