import Phaser from 'phaser';
import NPC from './npc.js';
import GameManager from '../manager.js';



export default class amigo1 extends NPC {


    constructor(scene, player, x, y, texture, frame = 0, message = null, onFinish = null, itemId = null, name = '') {
        super(scene, player, x, y, texture, frame, message, onFinish, itemId, name);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.frozen = false;
        // 1. Ajustar el tamaño (Ancho, Alto)

        // Ajustar la caja de colisión para que sea solo en los pies y no se atasque
        this.body.setSize(20, 16);
        this.body.setOffset(6, 32);

        this.gm = GameManager.getInstance();

        // ¿Ya se unió P1 al grupo?
        this._unidoAlGrupo = this.gm.ActualPlayers.includes('Jugador2');

        if (this._unidoAlGrupo && this.body) {
            this.body.moves = true;
            this.body.setImmovable(false);
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
            if (!this.scene.anims.exists(`walk5-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `walk5-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('amigo1', { start: cfg.start, end: cfg.end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            // Animación de reposo (solo el primer frame de esa dirección)
            if (!this.scene.anims.exists(`idle5-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `idle5-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers('amigo1', { start: cfg.start, end: cfg.start }),
                    frameRate: 1,
                    repeat: -1
                });
            }
        });

        this.setDirection('down');
    }

    /**
     * Establece la dirección en la que mira el jugador
     * @param {string} dir 'up', 'down', 'left', 'right'
     */
    setDirection(dir) {
        this.lastDirection = dir;
        this.play(`idle5-${dir}`);
    }


    /**
     * Métodos preUpdate de Phaser. Gestiona el seguimiento del jugador si está en el grupo.
     * @override
     */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);

        if (this.frozen) {
            this.body.setVelocity(0, 0);
            return;
        }

        if (this._unidoAlGrupo) {
            // Eliminar definitivamente el colisionador con el jugador para evitar bloqueos
            if (this.collider) {
                this.scene.physics.world.removeCollider(this.collider);
                this.collider = null;
            }

            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            const stopDist = 50;
            const followDist = 70;

            if (dist > followDist) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
                const speed = 180;
                this.body.setVelocityX(Math.cos(angle) * speed);
                this.body.setVelocityY(Math.sin(angle) * speed);

                const deg = Phaser.Math.RadToDeg(angle);
                const absDeg = Math.abs(deg);
                if (absDeg < 45) this.lastDirection = 'right';
                else if (absDeg > 135) this.lastDirection = 'left';
                else if (deg > 0) this.lastDirection = 'down';
                else this.lastDirection = 'up';

                this.play(`walk5-${this.lastDirection}`, true);
            } else {
                this.body.setVelocity(0, 0);
                this.play(`idle5-${this.lastDirection}`, true);
            }
        } else {
            // No unido: estático
            this.body.setVelocity(0, 0);
            this.play(`idle5-${this.lastDirection}`, true);
        }
    }


    freeze() {
        this.play('idle5-' + this.lastDirection, true);
        this.frozen = true;
    }
    unfreeze() {
        this.frozen = false;
    }

    interact() {
        // Mira al jugador
        this.lastDirection = this.contrario_player();

        if (this._unidoAlGrupo) {
            // Ya está en el grupo, pero puede hablar
            this.scene.showDialogue(
                'Aguanta, novato. Cuando hayamos limpiado el Aula 1, descansamos.',
                'P1'
            );
            return;
        }

        // --- Diálogo de presentación y reclutamiento de P1 ---
        this.scene.showDialogue(
            '¡Oye! ¡La facultad se ha vuelto loca, hay que salir!',
            this.player.name || 'Tú',
            () => {
                this.scene.showDialogue(
                    'Chill bro, cómo se nota que eres novato.',
                    'P1',
                    () => {
                        this.scene.showDialogue(
                            'Soy de la rama de Computadores. No esperes que corra, pero si ese bicho quiere tocarte, tendrá que pasar por encima de mis 120 créditos aprobados en 6 años de carrera. ¿Hacemos grupo?',
                            'P1',
                            () => {
                                // Reclutamiento de P1
                                this.unirse();
                            }
                        );
                    }
                );
            }
        );
    }



    contrario_player() {
        const dir = this.player.lastDirection;
        if (dir === 'right') return 'left';
        if (dir === 'left') return 'right';
        if (dir === 'up') return 'down';
        if (dir === 'down') return 'up';
        return 'right';
    }

    unirse() {
        this._unidoAlGrupo = true;
        this.gm.AddCompañero('Jugador2');
        
        // Habilitar movimiento físico para que pueda seguir al jugador
        if (this.body) {
            this.body.moves = true;
            this.body.setImmovable(false);
        }
    }

}  
