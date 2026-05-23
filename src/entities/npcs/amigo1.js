import Phaser from 'phaser';
import NPC from './npc.js';
import GameManager from '../../core/manager.js';



export default class amigo1 extends NPC {


    constructor(scene, player, x, y, texture, frame = 0, message = null, onFinish = null, itemId = null, name = '', groupId = 'Jugador2', animTexture = texture) {
        super(scene, player, x, y, texture, frame, message, onFinish, itemId, name);

        this.animTexture = animTexture;
        this.groupId = groupId;
        this.animKeyPrefix = `follow_${this.groupId}_${this.animTexture}`;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.frozen = false;
        
        // Hacemos que su hitbox sea MÁS PEQUEÑA que la del jugador.
        // Así nos aseguramos de que si el jugador cabe por un hueco, el amigo no se enganchará en las esquinas.
        this.body.setSize(this.width * 0.4, this.height * 0.2);
        this.body.setOffset(this.width * 0.3, this.height * 0.8);

        this.gm = GameManager.getInstance();

        // ¿Ya se unió este compañero al grupo?
        this._unidoAlGrupo = this.gm.ActualPlayers.includes(this.groupId);

        this.history = []; // Historial de posiciones del jugador
        this.followDelay = this._getFollowDelay(groupId);

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
            const walkKey = `${this.animKeyPrefix}_walk_${cfg.key}`;
            const idleKey = `${this.animKeyPrefix}_idle_${cfg.key}`;

            // Animación de caminar
            if (!this.scene.anims.exists(walkKey)) {
                this.scene.anims.create({
                    key: walkKey,
                    frames: this.scene.anims.generateFrameNumbers(this.animTexture, { start: cfg.start, end: cfg.end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            // Animación de reposo (solo el primer frame de esa dirección)
            if (!this.scene.anims.exists(idleKey)) {
                this.scene.anims.create({
                    key: idleKey,
                    frames: this.scene.anims.generateFrameNumbers(this.animTexture, { start: cfg.start, end: cfg.start }),
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
        this.play(this._getIdleKey(dir));
    }

    _getWalkKey(dir) {
        return `${this.animKeyPrefix}_walk_${dir}`;
    }

    _getIdleKey(dir) {
        return `${this.animKeyPrefix}_idle_${dir}`;
    }

    _getFollowDelay(groupId) {
        switch (groupId) {
            case 'Jugador3':
                return 14;
            case 'Jugador4':
                return 21;
            default:
                return 7;
        }
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

            // 1. Registrar la posición del jugador si se ha movido lo suficiente
            const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);

            // Snap directo si se separa demasiado (300 píxeles por ejemplo)
            if (distToPlayer > 300) {
                this.x = this.player.x;
                this.y = this.player.y;
                this.history = [];
                this.body.setVelocity(0, 0);
                return;
            }

            // Solo guardamos si el jugador se está moviendo
            if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
                const lastPos = this.history[this.history.length - 1];
                // Solo añadir si la distancia al último punto guardado es significativa (evita saturar el historial)
                if (!lastPos || Phaser.Math.Distance.Between(lastPos.x, lastPos.y, this.player.x, this.player.y) > 8) {
                    this.history.push({ x: this.player.x, y: this.player.y });
                }
            }

            // 2. Seguir el historial de posiciones
            // El seguidor se queda a una distancia de N puntos del historial
            if (this.history.length > this.followDelay) {
                const target = this.history[0];
                const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

                if (distToTarget > 5) {
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                    const speed = 250; // Velocidad del seguidor
                    this.body.setVelocityX(Math.cos(angle) * speed);
                    this.body.setVelocityY(Math.sin(angle) * speed);

                    // Determinar dirección de animación según el movimiento hacia el target
                    const deg = Phaser.Math.RadToDeg(angle);
                    const absDeg = Math.abs(deg);
                    if (absDeg < 45) this.lastDirection = 'right';
                    else if (absDeg > 135) this.lastDirection = 'left';
                    else if (deg > 0) this.lastDirection = 'down';
                    else this.lastDirection = 'up';

                    this.play(this._getWalkKey(this.lastDirection), true);
                } else {
                    this.x = target.x;
                    this.y = target.y;
                    this.history.shift();
                }
            } else {
                // Si no hay suficiente historial, se queda quieto
                this.body.setVelocity(0, 0);
                this.play(this._getIdleKey(this.lastDirection), true);
            }
        }
        else {
            // No unido: estático
            this.body.setVelocity(0, 0);
            this.play(this._getIdleKey(this.lastDirection), true);
        }
    }


    freeze() {
        this.play(this._getIdleKey(this.lastDirection), true);
        this.frozen = true;
    }
    unfreeze() {
        this.frozen = false;
    }

    interact() {
        // Mira al jugador
        this.lastDirection = this.contrario_player();

        const showDialogue = typeof this.scene.showDialogue === 'function'
            ? this.scene.showDialogue.bind(this.scene)
            : (message, name, cb) => { this.say(message, cb); };

        if (this._unidoAlGrupo) {
            // Ya está en el grupo, pero puede hablar
            showDialogue(
                'Aguanta, novato. Cuando hayamos limpiado el Aula 1, descansamos.',
                this.name || 'Compañero'
            );
            return;
        }

        // --- Diálogo de presentación y reclutamiento de P1 ---
        showDialogue(
            '¡Oye! ¡La facultad se ha vuelto loca, hay que salir!',
            this.player.name || 'Tú',
            () => {
                showDialogue(
                    'Chill bro, cómo se nota que eres novato.',
                    this.name || 'Compañero',
                    () => {
                        showDialogue(
                            'Me llamo Fernando, soy de la rama de Computadores. No esperes que corra, pero si ese bicho quiere tocarte, tendrá que pasar por encima de mis 120 créditos aprobados en 6 años de carrera. ¿Hacemos grupo?',
                            this.name || 'Compañero',
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

        this.x = this.player.x;
        this.y = this.player.y;
        this.history = [];
    }

}  
