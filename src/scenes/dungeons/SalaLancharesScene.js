import Player from '../../entities/player/player.js';
import DialogueManager from '../../core/dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../../core/manager.js';
import trigger from '../../objects/trigger.js';
import npcBattle from '../../entities/npcs/npc_battle.js'
import npc from '../../entities/npcs/npc.js'
import amigo1 from '../../entities/npcs/amigo1.js'

export default class SalaLancharesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'salaLanchares' });
    }

    create() {
        const map = this.make.tilemap({ key: 'salaLanchares' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');


        const gm = GameManager.getInstance();
        gm.addNivel("salaLanchares");

        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelos = map.createLayer('Suelos', tileset, 0, 0);
        const escaleras = map.createLayer('Escaleras', tileset, 0, 0);
        const paredes = map.createLayer('Paredes', tileset, 0, 0);
        const decoracion = map.createLayer('Decoracion', tileset, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });

        // Jugador
        this.player = new Player(this, 660, 515);
        this.player.setDirection('up');
        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, decoracion);




        const savedPos = gm.getPlayerPosition();

        // Si hay posición guardada, es que venimos de la batalla
        if (savedPos) {
            gm.clearPlayerPosition();
            this.player.setDirection(savedPos.direction);
            this.player.setPosition(savedPos.x, savedPos.y);
        }

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);


        this.lobby = map.createFromObjects('triggers', {
            name: 'lobby',
            classType: trigger
        });

        this.physics.add.overlap(this.player, this.lobby, () => {
            this.scene.start('entradaMazmorra', { entrada: 'jefe' });
        });


        gm.AddCompañero('Jugador4');


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

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });

        if (!gm.estadoNivel("salaLanchares")) {
            const p1Name = gm.ActualPlayers[0];
            const p1Level = gm.playerStats[p1Name].level;

            // Stats escalan con el nivel de P1 (base + (nivel-1)*crecimiento)
            const getScaledStat = (base, growth) => Math.floor(base + (p1Level - 1) * growth);

            this.lanchares = new npcBattle(this, this.player, 650, 150, 'lanchares', 0, {
                spriteKey: 'lancharesbatalla',
                scale: 0.85,
                name: 'Lanchares',
                hp: getScaledStat(88, 1.5),
                maxHp: getScaledStat(88, 1.5),
                damage: getScaledStat(21, 1.5),
                speed: getScaledStat(8, 1.5),
                defense: getScaledStat(20, 1.5),
                mp: getScaledStat(52, 1),
                maxMp: getScaledStat(52, 1),
                expReward: 100,
                moneyReward: 80,
                habilidades: ['Entrega Última Hora', '¡A pelar cables!', 'Ir a la Academia']
            }, '¡Silencio en clase! ¡Ahora el examen se corrige con fuego, gritos y destrucción!', null,null, 'lanchares_', "salaLanchares");
        } else {
            this.lanchares = new npc(this, this.player, 650, 150, 'lanchares', 0, "No entiendo qué ha pasado... Lo último que recuerdo es estar preparando la clase.", null, 'lanchares_', 'Lanchares');
        }
        // Si P1 ya está en el grupo, lo spawneamos para que nos siga
        if (gm.ActualPlayers.includes('Jugador2')) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            this.physics.add.collider(this.amigo1, colisiones);
            this.physics.add.collider(this.amigo1, paredes);
            this.physics.add.collider(this.amigo1, decoracion);
        }
        if (gm.ActualPlayers.includes('Jugador3')) {
            this.angela = new amigo1(this, this.player, this.player.x - 60, this.player.y, 'angelaow', 12, null, null, null, 'Angela', 'Jugador3', 'angelaow');
            this.physics.add.collider(this.angela, colisiones);
            this.physics.add.collider(this.angela, paredes);
            this.physics.add.collider(this.angela, decoracion);
        }
        if (gm.ActualPlayers.includes('Jugador4')) {
            this.victor = new amigo1(this, this.player, this.player.x + 30, this.player.y, 'victorow', 12, null, null, null, 'Victor', 'Jugador4', 'victorow');
            this.physics.add.collider(this.victor, colisiones);
            this.physics.add.collider(this.victor, paredes);
            this.physics.add.collider(this.victor, decoracion);
        }

        // Si acabamos de derrotar a Lanchares, mostramos la escena final
        if (gm.isJustDefeated && gm.isJustDefeated('lanchares_')) {
            gm.setJustDefeated('');
            if (this.music) this.music.stop();
            if (this.player && this.player.freeze) this.player.freeze();
            this.time.delayedCall(500, () => {
                const ismaelSprite = this.add.sprite(this.player.x + 80, this.player.y, 'ismael', 4).setDepth(50);
                const carlosSprite = this.add.sprite(this.player.x - 100, this.player.y, 'carlos', 8).setDepth(50);

                const diploma = () => {

                    gm.addItem({ id: 'diploma', name: 'Diploma', type: 'key', description: '' }, 1);

                    GameManager.getInstance().setPlayerPosition(this.player.x, this.player.y, this.player.lastDirection);
                    this.scene.start('DiplomaScene');

                };

                // Encolamos TODOS los diálogos de golpe.
                this.dialogueManager.showDialogue(
                    '¡Increible habéis conseguido transformar a Lanchares de vuelta! La facultad os lo agradece, de verdad, no sabéis el peligro que habéis evitado. Lanchares era un tío duro, pero vosotros habéis estado a la altura, sois unos cracks.',
                    'Carlos'
                );
                this.dialogueManager.showDialogue(
                    'Ya has terminado la carrera, vuelve al bus por el que viniste y disfruta tu libertad y oye, antes de irte, ¿te gustaría matricularte en el master de DVI? Sería un detalle por tu parte, en agradecimiento por la ayuda que prestada.',
                    'Ismael',
                );
                this.dialogueManager.showDialogue(
                    'Es broma, vete a celebrarlo con tus amigos, toma tu diploma, te lo has ganado.',
                    'Ismael',
                    diploma
                );
                //this.scene.start('end');
            });
            return;
        }
    }

    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
    }
}
