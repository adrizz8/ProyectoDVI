import Phaser from 'phaser';
import NPCBattle from './npc_battle';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */



export default class miron extends NPCBattle {

    constructor(scene, player, x, y, texture, frame, stats = {}, message = null, onFinish = null, itemId = null, NpcId) {
        super(scene, player, x, y, texture, frame, stats, message, onFinish, itemId, NpcId);

        this.lastDirection = '';

        this.frozen = false;
        // 1. Ajustar el tamaño (Ancho, Alto)

        this.body.setSize(this.width, this.height);

        this.luchar = false;

        this.body.moves = true;
        this.speed = 225;


        // 2. Ajustar el desplazamiento (Offset) para centrar la caja en los pies
        this.body.setOffset(this.width * 0.25, this.height * 0.7);

        this.move_x = 0;

        // Definición de animaciones direccionales
        const animsConfig = [
            { key: 'down', start: 0, end: 3 },
            { key: 'left', start: 4, end: 7 },
            { key: 'right', start: 8, end: 11 },
            { key: 'up', start: 12, end: 15 }
        ];

        animsConfig.forEach(cfg => {
            // Animación de caminar
            if (!this.scene.anims.exists(`walk4-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `walk4-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('npc3', { start: cfg.start, end: cfg.end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            // Animación de reposo (solo el primer frame de esa dirección)
            if (!this.scene.anims.exists(`idle4-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `idle4-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('npc3', { start: cfg.start, end: cfg.start }),
                    frameRate: 1,
                    repeat: -1
                });
            }
        });

        this.body.setVelocityX(0);
        this.body.setVelocityY(0);
        this.setDirection('left');

    }

    setDirection(dir) {
        this.lastDirection = dir;
        this.play(`idle4-${dir}`);
    }
    preUpdate(t, dt) {
        super.preUpdate(t, dt);


        if (this.frozen) {
            this.body.setVelocity(0, 0);
            this.anims.stop();
            return;
        }
        let moving = false;

        if (!this.luchar) {

            if (this.lastDirection == 'right') {

                if (10 < this.player.x - this.x && this.player.x - this.x < 155 && Math.abs(this.y - this.player.y) <= 25) {
                    console.log('derecha');
                    this.pillado();
                }

                this.move_x -= 1;
                if (this.move_x <= 0) {
                    this.lastDirection = 'left';
                }

            }
            else if (this.lastDirection == 'left') {

                if (this.player.x - this.x < -10 && -155 < this.player.x - this.x && Math.abs(this.y - this.player.y) <= 25) {
                    console.log('izquierda');
                    this.pillado();
                }

                this.move_x += 1;
                if (this.move_x > 50) {
                    this.lastDirection = 'right';
                }

            }
            else {
                this.body.setVelocityX(0);
                this.body.setVelocityY(0);
            }

        } else {
            if (this.lastDirection == 'right') {
                moving = true;
                this.body.setVelocityX(this.speed);
                if (Math.abs(this.player.x - this.x) < 60) {
                    this.freeze();
                    this.interact();
                    this.player.setDirection('left');
                }
            }
            else {
                moving = true;
                this.body.setVelocityX(-this.speed);

                if (Math.abs(this.player.x - this.x) < 60) {
                    this.freeze();
                    this.interact();
                    this.player.setDirection('right');
                }
            }

        }

        // Reproducir la animación correspondiente: walk o idle según la última dirección
        const animState = moving ? 'walk4' : 'idle4';
        this.play(`${animState}-${this.lastDirection}`, true);

    }
    freeze() {
        this.play('idle4-' + this.lastDirection, true);
        this.frozen = true;
    }
    unfreeze() {
        this.frozen = false;
    }

    pillado() {
        this.player.freeze();

        this.luchar = true;
    }
}