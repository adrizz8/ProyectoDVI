import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';
import primerencuentro from './personajes/primerencuentro.js';
import DialogueManager from './dialogueManager.js';
import GameManager from './manager.js';

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
        //gm.CompleteNivel('outdoorMap');
        
        this.salida_bus= map.createFromObjects('triggers',{
            name:'salida_autobus',
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

        this.physics.add.overlap(this.salida_bus, this.player, () => {

            this.scene.start('level3');
        });
        this.physics.add.overlap(this.entrada_der, this.player, () => {

            this.scene.start('cafeteria', { entrada: 'puerta_izq' });
        });
        this.physics.add.overlap(this.entrada_izq, this.player, () => {

            this.scene.start('cafeteria', { entrada: 'puerta_der' });
        });


        // Colisiones del jugador con la capa dedicada
        this.physics.add.collider(this.player, colisiones);


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
                        this.dialogueManager.showDialogue("Comoo!!!! PASO DE TI", 'Enemigo', () => {
                            if (this.player2.x > 810) {
                                ir2.destroy();
                                this.player2.setDirection('left');
                            } else {
                                ir2.destroy();
                                this.player2.setDirection('right');
                            }
                            this.player2.unfreeze();
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

                this.player2 = new primerencuentro(this, this.player, spawnX2, spawnY2, 'estudianteprimero', 0, { hp: 1 }, " ¿Quien eres tu?, te vas a enterar.", null, null);
                this.player2.setVisible(false);

                this.physics.add.overlap(this.parar_jug, this.player, () => {
                    this.parar_jug[0].destroy();

                    this.player.freeze();
                    this.player2.setVisible(true);
                    this.player2.unfreeze();
                    this.player2.setDirection('right');
                    this.dialogueManager.showDialogue("¡No me carga el repositorio, no me cargaaaa!", 'Enemigo');

                });
                this.physics.add.overlap(this.mov_abajo, this.player2, () => {
                    this.player2.setDirection('down');
                });
                this.physics.add.overlap(this.recolocar, this.player2, () => {
                    this.player2.recolocar();
                });

                this.player2.collider.destroy();
                this.physics.add.collider(this.player, this.player2, () => {
                    this.player2.freeze();
                    this.player2.interact();
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

        // Música ambiente
        this.music = this.sound.add('music_ambiente', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });


        // Tecla de menú (Espacio)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
        if (this.player2 && this.player2.update) {
            this.player2.update(t, dt);
        }
    }

    showDialogue(message, nombre = '', onFinish = null) {
        if (this.dialogueManager) {
            this.dialogueManager.showDialogue(message, nombre, onFinish);
        }
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
