import Player from '../../entities/player/player.js';
import DialogueManager from '../../core/dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../../core/manager.js';
import trigger from '../../objects/trigger.js';
import npcBattle from '../../entities/npcs/npc_battle.js'
import npc from '../../entities/npcs/npc.js'
import { ITEM_TYPES } from '../../items/item_types.js';
import amigo1 from '../../entities/npcs/amigo1.js'


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
                    this.showDialogue("¡Lo hemos conseguido, todo gracias a mi gestión! Aunque bueno, vuestra ayuda también ha sido clave.", "Angela", () => {
                        this.showDialogue("Sí, gracias chavales, os debo unas cervezas. Pero ahora debemos ir a por Lanchares y acabar con esta locura. Esa puerta debería poder abrirse cuando se activen los circuitos.", "Victor", null);
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


        const bossDefeated = gm.isDefeated('miniboss_');

        if (!gm.estadoNivel("salaMiniBoss")) {
            const p1Name = gm.ActualPlayers[0];
            const p1Level = gm.playerStats[p1Name].level;

            // Stats escalan con el nivel de P1 (base + (nivel-1)*crecimiento)
            const getScaledStat = (base, growth) => Math.floor(base + (p1Level - 1) * growth);

            this.miniboss = new npcBattle(this, this.player, 625, 250, 'miniboss', 0, {
                spriteKey: 'minibossbatalla',
                name: 'Miniboss',
                hp: 65, //getScaledStat(70, 1.5),
                maxHp: 65, //getScaledStat(70, 1.5),
                damage: 16, //16 //getScaledStat(16, 1.5),

                speed: 10, //getScaledStat(16, 1.5),
                defense: 24, //getScaledStat(18, 1.5),
                mp: 22,//getScaledStat(15, 1),
                maxMp: 22,//getScaledStat(15, 1),
                expReward: 80,
                moneyReward: 70,
                habilidades: ['Funciona en mi PC', 'Ir a la Academia']
            }, null, null, null, 'miniboss_', "salaMiniBoss");

            // Crear NPCs de Angela y Victor para el evento introductorio
            // Posicionados de espaldas a la puerta, mirando al miniboss (frame 12 = up)
            this.angela = new npc(this, this.player, 550, 310, 'angelaow', 12, 'a', null, 'angela_', 'Angela');
            this.victor = new npc(this, this.player, 700, 310, 'victorow', 12, 'a', null, 'victor_', 'Victor');

            // Mostrar diálogo inicial pidiendo ayuda
            this._showInitialEvent();
        } else {
            if (!bossDefeated) {
                this.miniboss = new npc(this, this.player, 625, 250, 'miniboss', 0, "b", null, 'miniboss_', "Miniboss");
            }
            if (bossDefeated) {
                this.angela = new amigo1(this, this.player, 550, 310, 'angelaow', 12, null, null, null, 'Angela', 'Jugador3', 'angelaow');
                this.victor = new amigo1(this, this.player, 700, 310, 'victorow', 12, null, null, null, 'Victor', 'Jugador4', 'victorow');

                this.physics.add.collider(this.angela, colisiones);
                this.physics.add.collider(this.angela, pared);
                this.physics.add.collider(this.angela, maquinas);
                this.physics.add.collider(this.victor, colisiones);
                this.physics.add.collider(this.victor, pared);
                this.physics.add.collider(this.victor, maquinas);
            }
        }

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });

        // Si P1 ya está en el grupo, lo spawneamos para que nos siga
        if (gm.ActualPlayers.includes('Jugador2')) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            this.physics.add.collider(this.amigo1, colisiones);
            this.physics.add.collider(this.amigo1, pared);
            this.physics.add.collider(this.amigo1, maquinas);
        }
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

            this.showDialogue("No podré aguantar mucho más, parece que es más fuerte de lo que pensábamos", "Angela", () => {
                this.showDialogue("Sí, si no podemos con este lo llevamos claro con Lanchares, necesitamos ayuda urgentemente", "Victor", () => {
                    this.showDialogue("¿Eso es todo lo que teneis chavales? ¡El balón de rugby es más duro que vosotros ja, ja, ja!", "Miniboss", () => {
                        this.showDialogue("Oye que yo soy la presidenta del consejo estudiantil, lo mio es el papeleo, ¿vale?", "Angela", () => {
                            this.showDialogue("Y yo soy metalero así que cuidado con lo que dices bro. No quieras tener problemas con mi banda.", "Victor", () => {
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

        // Asegurar que Angela y Victor estén al menos en nivel 3 antes del combate
        const ensureLevelAtLeast = (playerKey, targetLevel = 3) => {
            const p = gm.playerStats[playerKey];
            const prog = gm.progression[playerKey];
            if (!p || !prog) return;
            if (p.level >= targetLevel) return;
            const oldLevel = p.level;
            const delta = targetLevel - oldLevel;
            p.level = targetLevel;
            p.maxHp += (prog.hp || 0) * delta;
            p.hp = p.maxHp;
            p.maxMp += (prog.mp || 0) * delta;
            p.mp = p.maxMp;
            p.damage += (prog.damage || 0) * delta;
            p.speed += (prog.speed || 0) * delta;
            p.defense += (prog.defense || 0) * delta;
            p.luck += (prog.luck || 0) * delta;
            // Añadir habilidades desbloqueadas en esos niveles
            if (prog.skills) {
                for (let L = oldLevel + 1; L <= targetLevel; L++) {
                    const skill = prog.skills[L];
                    if (skill && !p.habilidades.includes(skill)) p.habilidades.push(skill);
                }
            }
        };

        ensureLevelAtLeast('Jugador3', 3);
        ensureLevelAtLeast('Jugador4', 3);

        // Pedir ayuda al jugador antes de iniciar la batalla
        this.showDialogue("¡Más gente! ¡Por favor! ¡Necesitamos que os unais a nosotros! ¡Juntos podemos derrotarle!", "Angela", () => {
            this.showDialogue("Sí colegas, no nos vendría mal una ayudita, si no vencemos a este, no podremos contra Lanchares. No me gustaría perder contra él, además se la tengo jurada desde que me suspendió FC1 por las prácticas ", "Victor", () => {
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
