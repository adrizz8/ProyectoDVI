import Player from '../../entities/player/player.js';
import Phaser from 'phaser';
import trigger from '../../objects/trigger.js';
import npc from '../../entities/npcs/npc.js';
import DialogueManager from '../../core/dialogueManager.js';
import GameManager from '../../core/manager.js';
import amigo1 from '../../entities/npcs/amigo1.js';
import pasillo_loco from '../../entities/npcs/pasillo_loco.js';

/**
 * Escena del Pasillo (Planta 1).
 * Accesible desde la cafetería por la puerta de la derecha.
 * Aquí caminan los NPCs del lore de la Planta 1.
 * @extends Phaser.Scene
 */
export default class Pasillo extends Phaser.Scene {
    constructor() {
        super({ key: 'pasillo' });
    }

    create(data = {}) {
        const map = this.make.tilemap({ key: 'pasillo' });


        // Puntos de entrada al pasillo
        var entradas = new Map();
        // Desde la puerta derecha de la cafetería: aparece en el lado izquierdo del pasillo
        entradas.set('desde_cafeteria', { x: 96, y: 300, direccion: 'right' });
        entradas.set('desde_cafeteria_izq', { x: 96, y: 300, direccion: 'right' });
        // Desde la puerta izquierda de la cafetería: aparece en el lado derecho del pasillo
        entradas.set('desde_cafeteria_der', { x: map.widthInPixels - 96, y: 300, direccion: 'left' });
        entradas.set('salida_mazmorra', { x: 620, y: 260, direccion: 'down' });

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        const tilesCafeteria = map.addTilesetImage('tilesetinteriordvifinal', 'tilesCafeteria');

        const suelo = map.createLayer('suelo', tilesCafeteria, 0, 0);
        const pared = map.createLayer('paredes', tilesCafeteria, 0, 0);
        const puertas = map.createLayer('puertas', tilesCafeteria, 0, 0);
        const ventanas = map.createLayer('ventanas', tilesCafeteria, 0, 0);
        const decoracion = map.createLayer('decoracion', tilesCafeteria, 0, 0);



        const colisiones = map.createLayer('colisiones', tilesCafeteria, 0, 0);

        // Colisiones
        colisiones.setCollisionByProperty({ collides: true });
        colisiones.setVisible(false);

        // Spawn del jugador
        const posi = entradas.get(data.entrada) || entradas.get('desde_cafeteria');
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;

        this.player = new Player(this, spawnX, spawnY);
        this.player.setDirection(direccion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Colisiones del jugador con la capa dedicada
        this.colisiones = colisiones;
        this.physics.add.collider(this.player, this.colisiones);

        // DialogueManager
        this.dialogueManager = new DialogueManager(this);
        this.gm = GameManager.getInstance();

        this.entrada_mazmorra = map.createFromObjects('triggers', {
            name: 'entrada_mazmorra',
            classType: trigger
        });

        this.salida_der = map.createFromObjects('triggers', {
            name: 'salida_der',
            classType: trigger
        });

        this.salida_izq = map.createFromObjects('triggers', {
            name: 'salida_izq',
            classType: trigger
        });

        this._transitioning = false;

        this._entrandoMazmorra = false;

        const entrarMazmorra = () => {
            if (this._entrandoMazmorra) return;
            this._entrandoMazmorra = true;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('entradaMazmorra', { entrada: 'pasillo' });
            });
        };

        this.physics.add.overlap(this.player, this.entrada_mazmorra, () => {
            if (this._entrandoMazmorra) return;
            if (this.gm.ActualPlayers.includes('Jugador2') && !this.gm.hasFlag('fernandoWarnedMazmorra')) {
                if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
                this.showDialogue(
                    'Bueno, parece que está es la puerta del aula 1. Dentro nos esperan peligrosos estudiantes a las órdenes de Lanchares y posibles trampas aunque podemos salir para recuperarnos y comprar recursos, recuérdalo. ¡Espero que sepas de puertas lógicas, chaval!',
                    'Fernando',
                    () => {
                        this.gm.markFlag('fernandoWarnedMazmorra');
                        entrarMazmorra();
                    }
                );
            } else {
                entrarMazmorra();
            }
        });

        this.physics.add.overlap(this.player, this.salida_der, () => {

            if (this._transitioning) return;

                this._transitioning = true;

            if (this.player && this.player.freeze) {
                this.player.freeze();
            }

            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('cafeteria', { entrada: 'desde_pasillo_der' });
            });
        });

        this.physics.add.overlap(this.player, this.salida_izq, () => {

            if (this._transitioning) return;

                this._transitioning = true;

            if (this.player && this.player.freeze) {
                this.player.freeze();
            }

            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('cafeteria', { entrada: 'desde_pasillo_izq' });
            });
        });

        // --- NPCs del lore de la Planta 1 ---
        this._spawnNPCsPlanta1();

        // Si P1 ya está en el grupo, lo spawneamos para que nos siga
        if (this.gm.ActualPlayers.includes('Jugador2')) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            this.physics.add.collider(this.amigo1, this.colisiones);
        }
        if (this.gm.ActualPlayers.includes('Jugador3')) {
            this.angela = new amigo1(this, this.player, this.player.x - 60, this.player.y, 'angelaow', 12, null, null, null, 'Angela', 'Jugador3', 'angelaow');
            this.physics.add.collider(this.angela, this.colisiones);
        }
        if (this.gm.ActualPlayers.includes('Jugador4')) {
            this.victor = new amigo1(this, this.player, this.player.x + 30, this.player.y, 'victorow', 12, null, null, null, 'Victor', 'Jugador4', 'victorow');
            this.physics.add.collider(this.victor, this.colisiones);
        }

        
        // ── Abrir menú con ESPACIO o CLICK DERECHO ─────────────────────────────
        const launchMenu = () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.bringToTop('MenuPrincipal');
            this.scene.pause();
        };

        this.input.keyboard.on('keydown-SPACE', launchMenu);
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) launchMenu();
        });

        this.music = this.sound.add('music_ambiente', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });

        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    /**
     * Spawna los NPCs del pasillo de la Planta 1 con sus diálogos del lore.
     */
    _spawnNPCsPlanta1() {
        // NPC1 - general sobre Lanchares
        new npc(
            this, this.player,
            624, 344,
            'npc1', 12,
            'Lanchares era nuestro mejor capitán. Ahora intenta hacernos placajes binarios cada vez que pasamos por su pasillo. ¡Dice que nuestra formación es un error de sintaxis!',
            null, null,
            'Estudiante de Rugby'
        );

        // NPC2 - Cálculo, da Regla de L'Hôpital
        new npc(
            this, this.player,
            890, 260,
            'npc2', 8,
            'He intentado calcular el límite de mi paciencia cuando tiende a infinito, pero me sale una indeterminación. Toma esto, lo necesitarás para derivar la atención del enemigo.',
            () => {
                if (!this.gm.isDefeated('npc_calculo_dio_item')) {
                    this.gm.addItem({
                        id: 'regla_lhopital',
                        name: "Regla de L'Hôpital",
                        type: 'consumable',
                        statusRecovery: true,
                        description: 'Elimina estados de aturdimiento binario.'
                    }, 1);
                    this.gm.markDefeated('npc_calculo_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue("¡RECURSO OBTENIDO!\nHas recibido: [Regla de L'Hôpital]", 'Estudiante de Cálculo');
                    });
                }
            },
            null,
            'Estudiante de Cálculo'
        );

        // NPC3 - MDL2, frases sobre lógica
        new pasillo_loco(
            this, this.player,
            820, 440,
            'npc3', 0,
            'P implica Q... pero la IA dice que P es falso. Si la premisa es falsa, ¡todo este pasillo es una mentira lógica! ¡Socorro!',
            null, null,
            'Estudiante de MDL2'
        );

        // NPC4 - FP1, da Compilador Amigable
        new npc(
            this, this.player,
            678, 220,
            'npc4', 0,
            '¡Un punto y coma! ¡He perdido toda mi energía mental por un punto y coma! Ten cuidado si entras aqui, está lleno de errores de sintaxis salvajes.',
            () => {
                if (!this.gm.isDefeated('npc_fp1_dio_item')) {
                    this.gm.addItem({
                        id: 'compilador_amigable',
                        name: 'Compilador Amigable',
                        type: 'consumable',
                        recMp: 20,
                        description: 'Recupera 20 de Energía.'
                    }, 1);
                    this.gm.markDefeated('npc_fp1_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('¡Has recibido: Compilador Amigable!', '');
                    });
                }
            },
            null,
            'Estudiante de FP'
        );

        // NPC Veterano - da Apuntes de ansiedad
        new npc(
            this, this.player,
            300, 270,
            'npc2', 12,
            "Ten estos Apuntes. No se entiende la letra porque los escribí durante un ataque de ansiedad, pero la intención es lo que cuenta.",
            () => {
                if (!this.gm.isDefeated('npc_ansiedad_dio_item')) {
                    this.gm.addItem({
                        id: 'apuntes_ansi',
                        name: 'Apuntes de Ansiedad',
                        type: 'consumable',
                        recMp: 15,
                        description: 'Apuntes ilegibles. Restauran 15 Energía por el esfuerzo.'
                    }, 1);
                    this.gm.markDefeated('npc_ansiedad_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('¡RECURSO OBTENIDO!\nHas recibido: [Apuntes de Ansiedad]', 'Estudiante Agobiado');
                    });
                }
            },
            null,
            'Estudiante Agobiado'
        );
        // NPC Borracho - da Tinto
        new npc(
            this, this.player,
            940, 260,
            'npc4', 4,
            "Toma este Tinto. Si el código no compila estando sobrio, quizá borracho le veas la lógica.",
            () => {
                if (!this.gm.isDefeated('npc_tinto_dio_item')) {
                    this.gm.addItem({
                        id: 'tinto_verano',
                        name: 'Tinto de Verano',
                        type: 'consumable',
                        buffAtt: 15,
                        description: 'Aumenta el ataque temporalmente.'
                    }, 1);
                    this.gm.markDefeated('npc_tinto_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('¡RECURSO OBTENIDO!\nHas recibido: [Tinto de Verano]', 'Estudiante de Fiesta');
                    });
                }
            },
            null,
            'Estudiante de Fiesta'
        );

        // Estudiante cansado/bucle
        new npc(
            this, this.player,
            480, 428,
            'npc2', 4,
            "He intentado hacer un 'undo' en mi vida después de elegir esta carrera, pero el Ctrl+Z no funciona en la realidad.",
            null, null,
            'Estudiante en Bucle'
        );

        // Estudiante estresado
        new npc(
            this, this.player,
            200, 440,
            'npc1', 12,
            "Toma este Cigarro. Es para cuando el merge conflict en Git sea tan grande que prefieras borrar la carpeta y mudarte a otro país.",
            () => {
                if (!this.gm.isDefeated('npc_git_dio_item')) {
                    this.gm.addItem({
                        id: 'cigarro',
                        name: 'Cigarro',
                        type: 'consumable',
                        description: 'Reduce el estrés (Restaura 30 Energía).'
                    }, 1);
                    this.gm.markDefeated('npc_git_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('¡RECURSO OBTENIDO!\nHas recibido: [Cigarro]', 'Estudiante de Git');
                    });
                }
            },
            null,
            'Estudiante de Git'
        );
        // NPC Claude
        new npc(
            this, this.player,
            405, 428,
            'npc3', 8,
            "Claude me ha salvado la vida tantas veces que estoy pensando en ponerles en mi testamento.",
            null, null,
            'Fan de la IA'
        );

        // NPC Boeing
        new npc(
            this, this.player,
            443, 390,
            'npc4', 0,
            "Mi PC suena como una turbina de un Boeing 747. Creo que está intentando abrir el Chrome o viajar en el tiempo.",
            null, null,
            'Dueño de Tostadora'
        );
    }

    _spawnHealer(x, y) {
        new npc(this, this.player, x, y, 'npc4', 4, " ", () => {
            this.showDialogue('¿Te encuentras bien? Deja que te cure un poco, que se te ve mala cara...', 'Enfermera', () => {
                this.gm.ActualPlayers.forEach(name => {
                    this.gm.healPlayer(name, 999);
                    this.gm.healMP(name, 999);
                });
                this.time.delayedCall(500, () => {
                    this.showDialogue('¡Listo! ¡Como nuevo! Ten más cuidado la próxima vez.', 'Enfermera');
                });
            });
        }, null, 'Enfermera');
    }

    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }

    update(t, dt) {
        // Actualizar el contador global de tiempo
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
        if (this.amigo1 && this.amigo1.update) {
            this.amigo1.update(t, dt);
        }
    }
}
