import Phaser from 'phaser';
import NPCBattle from './npc_battle.js';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */



export default class primerencuentro extends NPCBattle {

    constructor(scene, player, x, y, texture, frame, stats = {}, message = null, onFinish = null, itemId = null, NpcId = 'primerencuentro', Tutorial = false) {
        super(scene, player, x, y, texture, frame, stats, message, onFinish, itemId, NpcId, null, Tutorial);


        this.lastDirection = '';
        this.recolocando = false;


        this.frozen = true;


        this.body.moves = true;
        this.speed = 300;

        // Quitamos la colisión sólida de la clase padre NPC para que no empuje al jugador al embestir
        if (this.collider) {
            this.collider.destroy();
        }

        // Definición de animaciones direccionales
        const animsConfig = [
            { key: 'down', start: 0, end: 3 },
            { key: 'left', start: 4, end: 7 },
            { key: 'right', start: 8, end: 11 },
            { key: 'up', start: 12, end: 15 }
        ];

        animsConfig.forEach(cfg => {
            // Animación de caminar
            if (!this.scene.anims.exists(`walk2-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `walk2-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('estudianteprimero', { start: cfg.start, end: cfg.end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            // Animación de reposo (solo el primer frame de esa dirección)
            if (!this.scene.anims.exists(`idle2-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `idle2-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('estudianteprimero', { start: cfg.start, end: cfg.start }),
                    frameRate: 1,
                    repeat: -1
                });
            }
        });

        this.setDirection('down');
    }

    setDirection(dir) {
        this.lastDirection = dir;
        this.play(`idle2-${dir}`);
    }

    preUpdate(t, dt) {
        super.preUpdate(t, dt);


        if (this.y - this.height > this.scene.physics.world.bounds.height) {
            this.scene.unfreeze();
            this.destroy();
        } else {

            if (this.frozen) {
                this.body.setVelocity(0, 0);
                this.anims.stop();
                return;
            }

            let moving = false;

            if (this.lastDirection == 'up') {
                this.body.setVelocityY(-this.speed);
                this.body.setVelocityX(0);
                moving = true;
            }
            else if (this.lastDirection == 'left') {
                this.body.setVelocityX(-this.speed);
                this.body.setVelocityY(0);
                moving = true;
            }
            else if (this.lastDirection == 'right') {

                this.body.setVelocityX(this.speed);
                this.body.setVelocityY(0);
                if (this.recolocando) {
                    if (this.x >= this.player.x) {
                        this.lastDirection = 'down';
                        this.recolocando = false;
                    }
                }
                moving = true;
            }
            else if (this.lastDirection == 'down') {

                this.body.setVelocityY(this.speed);
                this.body.setVelocityX(0);

                moving = true;
            } else {
                this.body.setVelocityX(0);
                this.body.setVelocityY(0);
            }

            // Reproducir la animación correspondiente: walk o idle según la última dirección
            const animState = moving ? 'walk2' : 'idle2';
            this.play(`${animState}-${this.lastDirection}`, true);
        }
    }
    freeze() {
        this.play('idle2-' + this.lastDirection, true);
        this.frozen = true;
    }
    unfreeze() {
        this.frozen = false;
    }

    recolocar() {
        this.recolocando = true;
        this.lastDirection = 'right'
    }


}