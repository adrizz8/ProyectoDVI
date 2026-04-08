import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';
import npc from './personajes/npc.js';
import DialogueManager from './dialogueManager.js';
import GameManager from './manager.js';
import amigo1 from './personajes/amigo1.js';

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
        entradas.set('desde_cafeteria_der', { x: 96, y: 300, direccion: 'right' });
        // Desde la puerta izquierda de la cafetería: aparece en el lado derecho del pasillo
        entradas.set('desde_cafeteria_izq', { x: map.widthInPixels - 96, y: 300, direccion: 'left' });

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        // Tileset utilizado en pasillo.json
        const tilesinterior = map.addTilesetImage('tilesinterior', 'tilesinterior');
        const allTilesets = [tilesinterior];

        // Capas del mapa (orden igual que en Tiled)
        // Nota: 'colisones' es el nombre exacto tal como está en el JSON (sin segunda 'i')
        const colisiones = map.createLayer('colisones', allTilesets, 0, 0);
        const fondo = map.createLayer('fondo', allTilesets, 0, 0);
        const pared = map.createLayer('pared', allTilesets, 0, 0);
        const ventana = map.createLayer('ventana', allTilesets, 0, 0);
        const puertasYBanco = map.createLayer('puertas y banco', allTilesets, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
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

        // --- NPCs del lore de la Planta 1 ---
        this._spawnNPCsPlanta1();

        // Si P1 ya está en el grupo, lo spawneamos para que nos siga
        if (this.gm.ActualPlayers.includes('Jugador2')) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            this.physics.add.collider(this.amigo1, this.colisiones);
        }

        // Zona de salida izquierda: volver a la cafetería (por la puerta der de cafetería)
        const salidaCafeteriaDer = this.add.zone(16, map.heightInPixels / 2, 32, map.heightInPixels);
        this.physics.world.enable(salidaCafeteriaDer, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, salidaCafeteriaDer, () => {
            this.scene.start('cafeteria', { entrada: 'desde_pasillo_der' });
        });

        // Zona de salida derecha: volver a la cafetería (por la puerta izq de cafetería)
        const salidaCafeteriaIzq = this.add.zone(map.widthInPixels - 16, map.heightInPixels / 2, 32, map.heightInPixels);
        this.physics.world.enable(salidaCafeteriaIzq, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, salidaCafeteriaIzq, () => {
            this.scene.start('cafeteria', { entrada: 'desde_pasillo_izq' });
        });

        // Tecla de menú (Espacio)
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.bringToTop('MenuPrincipal');
            this.scene.pause();
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
            200, 200,
            'npc1', 8,
            'Lanchares era nuestro mejor capitán. Ahora intenta hacernos placajes binarios cada vez que pasamos por su pasillo. ¡Dice que nuestra formación es un error de sintaxis!',
            null, null,
            'Estudiante de Rugby'
        );

        // NPC2 - Cálculo, da Regla de L'Hôpital
        new npc(
            this, this.player,
            400, 150,
            'npc2', 4,
            'He intentado calcular el límite de mi paciencia cuando tiende a infinito, pero me sale una indeterminación. Toma esto, lo necesitarás para derivar la atención del enemigo.',
            () => {
                if (!this.gm.isDefeated('npc_calculo_dio_item')) {
                    this.gm.addItem({
                        id: 'regla_lhopital',
                        name: "Regla de L'Hôpital",
                        type: 'consumable',
                        statusRecovery: true,
                        description: 'Cuando te aturden y pierdes un turno de ataque, úsala para quitarte el efecto.'
                    }, 1);
                    this.gm.markDefeated('npc_calculo_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue("¡Has recibido: Regla de L'Hôpital!", '');
                    });
                }
            },
            null,
            'Estudiante de Cálculo'
        );

        // NPC3 - MDL2, frases sobre lógica
        new npc(
            this, this.player,
            600, 250,
            'npc3', 0,
            'P implica Q... pero la IA dice que P es falso. Si la premisa es falsa, ¡todo este pasillo es una mentira lógica! ¡Socorro!',
            null, null,
            'Estudiante de MDL2'
        );

        // NPC4 - FP1, da Compilador Amigable
        new npc(
            this, this.player,
            800, 180,
            'npc4', 8,
            '¡Un punto y coma! ¡He perdido toda mi energía mental por un punto y coma! No entres ahí fuera, está lleno de errores de sintaxis salvajes.',
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

        // NPC5 - FP2, da Puntero a NULL
        new npc(
            this, this.player,
            500, 350,
            'npc1', 4,
            'La IA ha convertido a los profesores en punteros que apuntan a nuestra destrucción. Si no manejas bien la memoria dinámica, te borrarán el perfil.',
            () => {
                if (!this.gm.isDefeated('npc_fp2_dio_item')) {
                    this.gm.addItem({
                        id: 'puntero_null',
                        name: 'Puntero a NULL',
                        type: 'consumable',
                        disable_enemy: true,
                        description: 'Arma arrojadiza: desactiva las habilidades del enemigo un turno.'
                    }, 1);
                    this.gm.markDefeated('npc_fp2_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('¡Has recibido: Puntero a NULL!', '');
                    });
                }
            },
            null,
            'Estudiante de FP (2)'
        );

        // NPC Veterano - aviso sobre Lanchares
        new npc(
            this, this.player,
            300, 400,
            'npc2', 12,
            '¿Vais a por el Capitán? Tened cuidado. Lanchares dice que ganar un partido de Rugby contra unos novatos es un resultado trivial. Dice que ni siquiera necesita sudar la camiseta para transformaros en bits de baja prioridad.',
            null, null,
            'Veterano'
        );

        // NPC6 - MDL1, da puzzle y luego Apuntes de lo Trivial
        // Este NPC tiene un mensaje largo con el puzzle explicado
        const npc6msg = '¡No lo entiendo! La profesora de Discreta dice que la solución es trivial por inspección visual... ¡Pero cada vez que toco uno, la regla me electrocuta! La regla dice: "Cada pedestal DEBE tener exactamente un vecino encendido". Ni cero, ni dos... ¡UNO! Los pedestales están conectados: A con B y C, B con A y D, C con A y D, D con B y C. ¡PISTA! La solución es encender A y B. ¡Si lo descubres, te daré algo que lo vale!';
        new npc(
            this, this.player,
            700, 400,
            'npc3', 8,
            npc6msg,
            () => {
                if (!this.gm.isDefeated('npc_mdl1_dio_item')) {
                    this.gm.addItem({
                        id: 'apuntes_trivial',
                        name: 'Apuntes de lo Trivial',
                        type: 'consumable',
                        disable_enemy: true,
                        description: 'El enemigo se queda parado un turno intentando comprender por qué el ataque es "trivial".'
                    }, 1);
                    this.gm.markDefeated('npc_mdl1_dio_item');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('¿En serio era solo eso? ¡¿Solo tenía que admitir que soy un fracasado para que la puerta se abriera?! ¡Es tan trivial que me dan ganas de llorar otra vez! Tomad, espero que esto os sirva.', 'Estudiante de MDL', () => {
                            this.showDialogue('¡Has recibido: Apuntes de lo Trivial!', '');
                        });
                    });
                }
            },
            null,
            'Estudiante de MDL'
        );

        // --- Nuevos NPCs graciosos ---
        // Estudiante borracho
        new npc(
            this, this.player,
            150, 450,
            'npc4', 4,
            'Hip... colega... ¿tienes un... un "garbage collector"? Es que creo que mi memoria... hip... se está desbordando por el pasillo.',
            null, null,
            'Estudiante de Fiesta'
        );

        // Estudiante cansado/bucle
        new npc(
            this, this.player,
            900, 500,
            'npc2', 8,
            'for(let i=0; i<ganas_de_vivir; i++) { beber_cafe(); }. El problema es que ganas_de_vivir es una constante igual a cero.',
            null, null,
            'Estudiante en Bucle'
        );

        // Estudiante de salir a fumar
        new npc(
            this, this.player,
            1100, 300,
            'npc1', 0,
            'Salgo un segundo a por aire... o a por nicotina... lo que compile antes. La IA no me deja pasar de la puerta, dice que mi aliento es un riesgo de seguridad.',
            null, null,
            'Estudiante Estresado'
        );
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
