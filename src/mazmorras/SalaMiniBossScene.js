import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';
import trigger from '../trigger.js';
import npcBattle from '../personajes/npc_battle.js'
import npc from '../personajes/npc.js'
import { ITEM_TYPES } from '../item/item_types.js';

export default class SalaMiniBossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'salaMiniBoss' });
    }

    create() {
        const map = this.make.tilemap({ key: 'salaMiniBoss' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelos = map.createLayer('Suelos', tileset, 0, 0);
        const pared = map.createLayer('Pared', tileset, 0, 0);
        const maquinas = map.createLayer('Maquinas', tileset, 0, 0);

        const gm = GameManager.getInstance();

        gm.addNivel("salaMiniBoss");

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        pared.setCollisionByProperty({ collides: true });

        // Jugador
        this.player = new Player(this, 625, 425);
        this.player.setDirection('up');
        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, pared);
        this.physics.add.collider(this.player, maquinas);

        const savedPos = gm.getPlayerPosition();

        // Si hay posición guardada, es que venimos de la batalla
        if (savedPos) {
            gm.clearPlayerPosition();
            this.player.setDirection(savedPos.direction);
            this.player.setPosition(savedPos.x, savedPos.y);

            // Si el miniboss fue derrotado, mostrar recompensa
            if (gm.isDefeated('miniboss_')) {
                this.time.delayedCall(500, () => {
                    const rewardItem = ITEM_TYPES['compilador_amigable'];
                    gm.addItem(rewardItem, 1);
                    this.showDialogue("¡Lo hicimos! ¡Derrotamos a este código monstruoso! ¡Incluso Lanchares estaría orgulloso!", "Angela", () => {
                        this.showDialogue("¡Y miranos! Sobrevivimos juntos. Este compilador amigable es perfecto para celebrarlo. ¡Aunque después tendremos que enfrentar a Lanchares en persona!", "Victor", null);
                    });
                });
            }
        }

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        this.salida = map.createFromObjects('triggers', {
            name: 'salida',
            classType: trigger
        });
        this.physics.add.overlap(this.player, this.salida, () => {
            this.scene.start('p1LeftMazmorra', { entrada: 'salida_miniboss' });
        });

        // Menu con espacio
        // ── Abrir menú con ESPACIO o CLICK DERECHO ─────────────────────────────
        const launchMenu = () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        };

        this.input.keyboard.on('keydown-SPACE', launchMenu);
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) launchMenu();
        });


        if (!gm.estadoNivel("salaMiniBoss")) {
            const p1Name = gm.ActualPlayers[0];
            const p1Level = gm.playerStats[p1Name].level;

            // Stats escalan con el nivel de P1 (base + (nivel-1)*crecimiento)
            const getScaledStat = (base, growth) => Math.floor(base + (p1Level - 1) * growth);

            this.miniboss = new npcBattle(this, this.player, 625, 250, 'miniboss', 0, {
                spriteKey: 'minibossbatalla',
                name: 'Miniboss',
                hp: getScaledStat(70, 1.5),
                maxHp: getScaledStat(70, 1.5),
                damage: getScaledStat(16, 1.5),
                speed: getScaledStat(16, 1.5),
                defense: getScaledStat(18, 1.5),
                mp: getScaledStat(15, 1),
                maxMp: getScaledStat(15, 1),
                expReward: 50,
                moneyReward: 70,
                habilidades: ['Funciona en mi PC', 'Ir a la academia']
            }, null, null, null, 'miniboss_', "salaMiniBoss");

            // Crear NPCs de Angela y Victor para el evento introductorio
            // Posicionados de espaldas a la puerta, mirando al miniboss (frame 12 = up)
            this.angela = new npc(this, this.player, 550, 310, 'angelaow', 12, 'a', null, 'angela_', 'Angela');
            
            this.victor = new npc(this, this.player, 700, 310, 'victorow', 12, 'a', null, 'victor_', 'Victor');

            // Mostrar diálogo inicial pidiendo ayuda
            this._showInitialEvent();
        } else {
            this.miniboss = new npc(this, this.player, 625, 250, 'miniboss', 0, "b", null, 'miniboss_', "Miniboss");
        }

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });


    }


    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }

    _showInitialEvent() {
        // Secuencia de diálogos: primero Angela y Victor hablan entre ellos, luego el miniboss, finalmente piden ayuda
        this.time.delayedCall(1000, () => {
            // Girar hacia el jugador (frame 0 = down)
            this.angela.setFrame(0);
            this.victor.setFrame(0);
            
            this.showDialogue("Este código es más complicado que los apuntes de Lanchares en octubre...", "Angela", () => {
                this.showDialogue("¡Y es mucho más agresivo! Recuerda cuando Lanchares se enfadó por el envío mal formateado. ¡Esto es mil veces peor!", "Victor", () => {
                    this.showDialogue("¿Creían que podrían derrotarme así como así? ¡Soy tan letal como un bug en el deploy a producción!", "Miniboss", () => {
                        this.showDialogue("¡Este miniboss habla como si fuera profesor de facultad! ¡Primero Lanchares, ahora esto!", "Angela", () => {
                            this.showDialogue("¡No nos quedan muchas opciones! Necesitamos ayuda URGENTE. ¿Dónde estabas cuando llegaste?", "Victor", () => {
                                this._addCompañerosAndStartBattle();
                            });
                        });
                    });
                });
            });
        });
    }

    _addCompañerosAndStartBattle() {
        const gm = GameManager.getInstance();

        // Agregar Angela y Victor al grupo si no estaban
        if (!gm.ActualPlayers.includes('Jugador3')) {
            gm.AddCompañero('Jugador3');
        }
        if (!gm.ActualPlayers.includes('Jugador4')) {
            gm.AddCompañero('Jugador4');
        }

        // Pedir ayuda al jugador antes de iniciar la batalla
        this.showDialogue("¡Por favor! ¡Necesitamos que te unas a nosotros! ¡Juntos podemos derrotar esto!", "Angela", () => {
            this.showDialogue("¡Tienes que entender la gravedad de esto! Es como si Lanchares nos hubiera asignado un proyecto imposible. ¡Pero esta vez de verdad es imposible sin ti!", "Victor", () => {
                // El jugador avanza dos pasos hacia el miniboss
                this.player.setDirection('up');
                this.tweens.add({
                    targets: this.player,
                    y: this.player.y - 80,
                    duration: 400,
                    ease: 'Linear',
                    onComplete: () => {
                        this.miniboss.startBattle();
                    }
                });
            });
        });
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
