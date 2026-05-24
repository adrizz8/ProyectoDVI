import Player from '../../entities/player/player.js';
import Phaser from 'phaser';
import trigger from '../../objects/trigger.js';
import primerencuentro from '../../entities/npcs/primerencuentro.js';
import DialogueManager from '../../core/dialogueManager.js';
import GameManager from '../../core/manager.js';
import npc from '../../entities/npcs/npc.js';
import amigo1 from '../../entities/npcs/amigo1.js';

/**
 * Escena del mapa exterior.
 * @extends Phaser.Scene
 */
export default class MapaFuera extends Phaser.Scene {
    constructor() {
        super({ key: 'outdoorMap' });
    }

    create(data) {

        var entradas = new Map();
        entradas.set('salida_autobus', { x: 820, y: 980, direccion: 'up' });
        entradas.set('entrada_izq', { x: 160, y: 260, direccion: 'down' });
        entradas.set('entrada_der', { x: 895, y: 260, direccion: 'down' });

        // Carga del mapa y tilesets
        const map = this.make.tilemap({ key: 'outdoorMap' });
        const tileset1 = map.addTilesetImage('tilesetexterior', 'tileset');
        // El JSON de mapaFuera tiene dos entradas para el mismo tileset con diferentes GIDs
        const tilesets = [tileset1];

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        // Capas del mapa
        const fondo = map.createLayer('fondo', tilesets, 0, 0);
        const facultad = map.createLayer('facultad', tilesets, 0, 0);
        const Cornisas = map.createLayer('Cornisas', tilesets, 0, 0);
        const decoracion = map.createLayer('decoracion', tilesets, 0, 0);
        const bebidas = map.createLayer('bebidas', tilesets, 0, 0);
        const bebidas2 = map.createLayer('bebidas2', tilesets, 0, 0);
        const colisiones = map.createLayer('colisiones', tilesets, 0, 0);

        // Colisiones
        colisiones.setCollisionByProperty({ collides: true });
        colisiones.setVisible(false);

        // Posición de spawn (por defecto abajo a la derecha si no viene en data)

        const posi = entradas.get(data.entrada);
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;

        this.player = new Player(this, spawnX, spawnY);
        this.player.setDirection(direccion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();


        gm.addNivel('outdoorMap');
        gm.addNivel('entroCaf');

        this.salida_bus = map.createFromObjects('triggers', {
            name: 'salida_autobus',
            classType: trigger
        });
        this.entrada_der = map.createFromObjects('triggers', {
            name: 'entrada_der',
            classType: trigger
        });

        this.entrada_izq = map.createFromObjects('triggers', {
            name: 'entrada_izq',
            classType: trigger
        });

        this._transitioning = false;

        this.physics.add.overlap(this.salida_bus, this.player, () => {
            
            if (this._transitioning) return;

                this._transitioning = true;

            if (this.player && this.player.freeze) {
                this.player.freeze();
            }

            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('level3');
            });
        });
        this.physics.add.overlap(this.entrada_der, this.player, () => {

            
            if (this._transitioning) return;

                this._transitioning = true;

            if (this.player && this.player.freeze) {
                this.player.freeze();
            }

            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('cafeteria', { entrada: 'puerta_der' });
            });
        });
        this.physics.add.overlap(this.entrada_izq, this.player, () => {
            
            if (this._transitioning) return;

                this._transitioning = true;

            if (this.player && this.player.freeze) {
                this.player.freeze();
            }

            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('cafeteria', { entrada: 'puerta_izq' });
                gm.CompleteNivel('entroCaf')
            });
        });

        if (!gm.estadoNivel('entroCaf')) {
            const npcData = [
                { x: 875, y: 254, texture: 'npc2', frame: 8, message: 'Creo que visto como el profe se transformaba!!! QUE MIEDO' },
                { x: 920, y: 254, texture: 'npc1', frame: 4, message: 'Ya te decia que dormir 3 horas al dia te pasaria factura' },
            ];

            this.npcArray = npcData.map(data =>
                new npc(
                    this,
                    this.player,
                    data.x,
                    data.y,
                    data.texture,
                    data.frame,
                    data.message,
                    null,
                    null,
                    'Estudiante'
                )
            );

        }

        // Colisiones del jugador con la capa dedicada
        this.colisiones = colisiones;
        this.physics.add.collider(this.player, this.colisiones);

        // Si P1 ya está en el grupo, lo spawneamos para que nos siga
        if (gm.ActualPlayers.includes('Jugador2')) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            this.physics.add.collider(this.amigo1, this.colisiones);
        }
        if (gm.ActualPlayers.includes('Jugador3')) {
            this.angela = new amigo1(this, this.player, this.player.x - 60, this.player.y, 'angelaow', 12, null, null, null, 'Angela', 'Jugador3', 'angelaow');
            this.physics.add.collider(this.angela, this.colisiones);
        }
        if (gm.ActualPlayers.includes('Jugador4')) {
            this.victor = new amigo1(this, this.player, this.player.x + 30, this.player.y, 'victorow', 12, null, null, null, 'Victor', 'Jugador4', 'victorow');
            this.physics.add.collider(this.victor, this.colisiones);
        }


        //entra en if si nivel no ha sido completado
        if (!gm.estadoNivel('outdoorMap')) {

            // Si hay posición guardada, es que venimos de la batalla
            if (savedPos) {

                gm.CompleteNivel('outdoorMap');
                gm.clearPlayerPosition();
                this.player.setDirection(savedPos.direction);
                this.player.setPosition(savedPos.x, savedPos.y);
                this.player.freeze();

                const posi = this.getPosiPostComb(savedPos);

                this.player2 = new primerencuentro(this, null, posi.x, posi.y, 'estudianteprimero', 0, {}, null, null, null);
                this.player2.setVisible(true);
                this.player2.setDirection(posi.direction);


                this.irse1 = map.createFromObjects('triggers', {
                    name: 'irse1',
                    classType: trigger
                });
                this.irse2 = map.createFromObjects('triggers', {
                    name: 'irse2',
                    classType: trigger
                });
                const ir1 = this.physics.add.overlap(this.irse1, this.player2, () => {
                    this.player2.setDirection('down');
                });
                const ir2 = this.physics.add.overlap(this.irse2, this.player2, () => {
                    this.player2.setDirection('down');
                });

                this.time.addEvent({
                    delay: 300, // ms
                    callback: () => {
                        // Diálogo del enemigo derrotado
                        this.dialogueManager.showDialogue("Comoo!!!! PASO DE TI", 'Enemigo', () => {
                            if (this.player2.x > 810) {
                                ir2.destroy();
                                this.player2.setDirection('left');
                            } else {
                                ir2.destroy();
                                this.player2.setDirection('right');
                            }
                            this.player2.unfreeze();

                            // --- Aparecen Carlos e Ismael, los profesores de DVI ---
                            this.time.delayedCall(800, () => {
                                this._mostrarDialogosProfs();
                            });
                        })
                    }
                });

            }
            else {

                this.parar_jug = map.createFromObjects('triggers', {
                    name: 'parar_jug',
                    classType: trigger
                });
                this.mov_abajo = map.createFromObjects('triggers', {
                    name: 'mov_abajo',
                    classType: trigger
                });
                this.recolocar = map.createFromObjects('triggers', {
                    name: 'recolocar',
                    classType: trigger
                });

                const posi2 = entradas.get('entrada_izq');
                const spawnX2 = posi2.x;
                const spawnY2 = posi2.y;
                //const direccion2=posi2.direccion;

                this.player2 = new primerencuentro(this, this.player, spawnX2, spawnY2, 'estudianteprimero', 0, {
                    spriteKey: 'estudiantebattle',
                    name: 'Estudiante con prisa',
                    hp: 22,
                    maxHp: 22,
                    damage: 6,
                    speed: 3,
                    defense: 8,
                    mp: 10,
                    maxMp: 10,
                    expReward: 100,
                    moneyReward: 50,
                    habilidades: []
                }, " ¿Quien eres tu?, te vas a enterar.", null, null, 'primerencuentro', true);
                this.player2.setVisible(false);

                this.physics.add.overlap(this.parar_jug, this.player, () => {
                    this.parar_jug[0].destroy();

                    this.player.freeze();
                    this.player2.setVisible(true);
                    this.player2.unfreeze();
                    this.player2.setDirection('right');
                    this.dialogueManager.showDialogue("¡Apartate yo me voy de aquí, hay dentro la cosa se ha puesto fea!", 'Estudiante con prisa');

                });
                this.physics.add.overlap(this.mov_abajo, this.player2, () => {
                    this.player2.setDirection('down');
                });
                this.physics.add.overlap(this.recolocar, this.player2, () => {
                    this.player2.recolocar();
                });

                const encuentroTrig = this.physics.add.overlap(this.player, this.player2, () => {
                    encuentroTrig.destroy(); // Consumir el trigger para no spammear el combate
                    this.player2.freeze();
                    this.player2.interact(); // Iniciar el combate real
                });
            }
        }

        /*
        // Zonas de transición a Cafetería
        // La facultad está en la parte superior. Puerta aproximada en X=350, Y=220
        const doorZone = this.add.zone(350, 220, 100, 60);

        this.physics.world.enable(doorZone, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, doorZone, () => {
            // Spawn en la cafetería (cerca de la puerta)
            this.scene.start('cafeteria', { spawnX: 300, spawnY: 200 });
        });
        */// Fade-in al entrar al mapa exterior
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // NPCs si el boss de cafeteria ya ha sido derrotado
        if (gm.estadoNivel('cafeteria')) {
            this._spawnNPCsPostBoss();
        }

        // Música ambiente
        this.music = this.sound.add('music_ambiente', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });


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
        if (this.player2 && this.player2.update) {
            this.player2.update(t, dt);
        }
        // Actualizar NPCs exteriores post-boss
        if (this._outdoorNpcs) {
            this._outdoorNpcs.forEach(n => { if (n && n.update) n.update(t, dt); });
        }
    }

    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
    }

    /**
     * Muestra los diálogos de los profesores Carlos e Ismael
     * tras el primer combate del repositorio.
     */
    _mostrarDialogosProfs() {
        this.player.freeze();

        // Los profesores te curan tras el primer combate
        const gm = GameManager.getInstance();
        gm.ActualPlayers.forEach(name => {
            gm.healPlayer(name, 999);
            gm.healMP(name, 999);
        });

        // Aparecen los profesores tiesos directamente en su posición final
        const ismaelSprite = this.add.sprite(this.player.x + 60, this.player.y, 'ismael', 4).setDepth(50);
        const carlosSprite = this.add.sprite(this.player.x - 60, this.player.y, 'carlos', 8).setDepth(50);

        const limpiarProfs = () => {
            carlosSprite.destroy();
            ismaelSprite.destroy();
            this.player.unfreeze();

        };

        // Encolamos TODOS los diálogos de golpe.
        this.dialogueManager.showDialogue(
            '¡Eh, tú! La facultad ha sido infectada por una IA y los profes se han vuelto locos. Menos mal que encontramos a alguien sano.',
            'Carlos'
        );
        this.dialogueManager.showDialogue(
            'Te hemos instalado un módulo de combate en la mochila. Te diría que eres el elegido y todas esas cosas, pero sinceramente eres el primero que ha pasado, así que supongo que te toca salvar el día, chaval.',
            'Ismael'
        );
        this.dialogueManager.showDialogue(
            'Pero no te preocupes, hemos visto tu pelea con ese chico y tienes madera de héroe. Por cierto, te vamos a curar para que estes a tope y puedas realizar esta misión tan importante.',
            'Carlos'
        );
        this.dialogueManager.showDialogue(
            '¡Y no olvides el Pincho de Tortilla! Es el combustible del héroe en esta facultad. ¡Suerte, Chaval!',
            'Ismael',
            limpiarProfs
        );
    }

    /**
     * Spawnea NPCs en el mapa exterior cuando la cafetería ya ha sido completada.
     */
    _spawnNPCsPostBoss() {
        const npcData = [
            { x: 780, y: 500, texture: 'npc2', frame: 12, message: '¡Por fin se puede respirar sin que el conserje te persiga por el pasillo!.' },
            { x: 210, y: 600, texture: 'npc3', frame: 4, message: 'Si vas para dentro, pídeme otro cubo de tercios.' },
            { x: 780, y: 450, texture: 'npc1', frame: 0, message: 'Esto sigue siendo una locura, pero al menos puedo salir a fumar.' },
            { x: 105, y: 290, texture: 'npc4', frame: 8, message: 'La IA controla las aulas. He oído que si entras sin el carnet de la Complu, te formatea la RAM directamente.' },
            { x: 129, y: 550, texture: 'npc2', frame: 0, message: 'Llevo 4 horas intentando salir del campus, pero parece que hay un bucle infinito en seguir pidiendo botellines.' },
            { x: 129, y: 635, texture: 'npc3', frame: 12, message: 'Esta tarde, sangriada.' },
        ];

        this._outdoorNpcs = npcData.map(data =>
            new npc(this, this.player, data.x, data.y, data.texture, data.frame, data.message, null, null, 'Estudiante')
        );
    }

    getPosiPostComb(savedPos, paso = 60) {
        const { x, y, direction } = savedPos;

        switch (direction) {
            case "up":
                return {
                    x: x,
                    y: y - paso,
                    direction: "down"
                };

            case "down":
                return {
                    x: x,
                    y: y + paso,
                    direction: "up"
                };

            case "left":
                return {
                    x: x - paso,
                    y: y,
                    direction: "right"
                };

            case "right":
                return {
                    x: x + paso,
                    y: y,
                    direction: "left"
                };

            default:
                throw new Error(`Dirección no válida: ${direction}`);
        }
    }

    unfreeze() {
        this.player.unfreeze();
    }
}
