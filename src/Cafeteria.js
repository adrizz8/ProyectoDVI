import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';
import npc from './personajes/npc.js'
import NPCBattle from './personajes/npc_battle.js';
import DialogueManager from './dialogueManager.js';
import cafeteria_loco from './personajes/cafeteria_loco.js';
import miron from './personajes/miron.js';
import GameManager from './manager.js';
import amigo1 from './personajes/amigo1.js';
import conserje from './personajes/conserje.js'

/**
 * Escena de la Cafetería.
 * @extends Phaser.Scene
 */
export default class Cafeteria extends Phaser.Scene {
    constructor() {
        super({ key: 'cafeteria' });
    }

    create(data = {}) {
        // Carga del mapa y tilesets
        const map = this.make.tilemap({ key: 'cafeteria' });

        var entradas = new Map();
        entradas.set('salida_autobus', { x: 820, y: 980, direccion: 'up' });
        // Entrada desde exterior: x coincide con el trigger en mapaFuera.json
        entradas.set('puerta_izq', { x: 161, y: 580, direccion: 'up' });
        entradas.set('puerta_der', { x: 896, y: 580, direccion: 'up' });
        // Vuelta desde el pasillo
        entradas.set('desde_pasillo_izq', { x: 80, y: 160, direccion: 'down' });
        entradas.set('desde_pasillo_der', { x: 1145, y: 20, direccion: 'down' });

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );


        // Tilesets 
        const tilesInterior2 = map.addTilesetImage('tilesInterior2', 'tilesInterior2');
        const tilesInterior = map.addTilesetImage('tilesinterior', 'tilesinterior');
        const tilesCafeteria = map.addTilesetImage('tilesCafeteria', 'tilesCafeteria');
        const tilesExterior = map.addTilesetImage('tilesetexterior', 'tilesetexterior');

        const allTilesets = [tilesInterior2, tilesInterior, tilesCafeteria, tilesExterior];

        // Capas del mapa
        const fondo = map.createLayer('fondo', allTilesets, 0, 0);
        const pared = map.createLayer('pared', allTilesets, 0, 0);
        const puerta = map.createLayer('puerta', allTilesets, 0, 0);
        const barra = map.createLayer('barra', allTilesets, 0, 0);
        const sillas = map.createLayer('sillas', allTilesets, 0, 0);
        const mesas = map.createLayer('mesas', allTilesets, 0, 0);
        const decoracion = map.createLayer('decoracion', allTilesets, 0, 0);
        const sillas2 = map.createLayer('sillas2', allTilesets, 0, 0);

        const colisiones = map.createLayer('colisiones', allTilesets, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);

        const posi = entradas.get(data.entrada);
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;
        // Venimos del exterior si la entrada es por una puerta del outdoor
        const desdeExterior = (data.entrada === 'puerta_izq' || data.entrada === 'puerta_der');

        this.player = new Player(this, spawnX, spawnY);
        this.player.setDirection(direccion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.gm = GameManager.getInstance();
        this.savedPos = this.gm.getPlayerPosition();

        this.dialogueManager = new DialogueManager(this);

        if (this.savedPos) {
            this.player.x = this.savedPos.x;
            this.player.y = this.savedPos.y;
            this.player.setDirection(this.savedPos.direction);
            this.gm.clearPlayerPosition();
        }

        // Colisiones del jugador con la capa dedicada
        this.colisiones = colisiones;
        this.physics.add.collider(this.player, this.colisiones);

        // Comprobamos si la cafetería ya ha sido completada (boss derrotado)
        const cafeteriaCompletada = this.gm.estadoNivel('cafeteria');

        if (!cafeteriaCompletada) {
            // Cafetería en modo CAOS: NPC asustados, conserje boss en puerta
            this.enemies = this.add.group();
            this._generarCafeteriaConCaos();
        } else {
            // Cafetería liberada: NPCs normales andando tranquilos (menos, más relajados)
            this._generarCafeteriaLibeada();
        }

        // Si P1 ya está en el grupo, lo spawneamos para que nos siga (si no ha sido spawneado ya como NPC en caos)
        if (this.gm.ActualPlayers.includes('Jugador2') && !this.amigo1) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
        }

        // Colisiones para los NPC que siguen al jugador (P1)
        if (this.amigo1) {
            this.physics.add.collider(this.amigo1, this.colisiones);
        }

        // El mapa es 38x20 tiles de 32px = 1216x640px

        // Flag global para evitar transiciones duplicadas
        this._transitioning = false;

        // Si el jugador spawea ENCIMA de zonaIzq (vuelta desde pasillo),
        // esperar a que salga de la zona antes de activar el trigger.
        this._zonaIzqMustExit = (data.entrada === 'desde_pasillo_izq');

        if (cafeteriaCompletada) {
            // puerta_der → pasillo (extremo derecho del mapa, filas 4-5)
            const zonaDer = this.add.zone(1200, 160, 48, 128);
            this.physics.world.enable(zonaDer, Phaser.Physics.Arcade.STATIC_BODY);

            this.physics.add.overlap(zonaDer, this.player, () => {
                if (this._transitioning) return;

                // Bloqueo de progresión: requiere derrotar al boss y a los otros dos npcs
                if (!this.gm.isDefeated('conserje_caf') || !this.gm.isDefeated('npc_loco_caf') || !this.gm.isDefeated('npc_miron_caf')) {
                    this.showDialogue("¡Espera! No puedes pasar al pasillo todavía. El conserje y esos dos tipos raros siguen dando problemas. ¡Encárgate de ellos primero!", "Veterano de Rugby");
                    return;
                }

                this._transitioning = true;
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('pasillo', { entrada: 'desde_cafeteria' });
                });
            });
        }

        // puerta_izq → pasillo
        const zonaIzq = this.add.zone(80, 160, 100, 60);
        this.physics.world.enable(zonaIzq, Phaser.Physics.Arcade.STATIC_BODY);

        // puerta exterior con color para que se note que hay una puerta
        this.add.rectangle(161, 635, 100, 32, 0xffd966, 0.35).setDepth(99);
        this.add.rectangle(896, 635, 100, 32, 0xffd966, 0.35).setDepth(99);

        // Zona de salida baja derecha → volver al exterior (x=896, coincide con trigger en mapaFuera)
        const zonaExitDer = this.add.zone(896, 635, 100, 32);
        this.physics.world.enable(zonaExitDer, Phaser.Physics.Arcade.STATIC_BODY);

        // Zona de salida baja izquierda → volver al exterior (x=161, coincide con trigger en mapaFuera)
        const zonaExitIzq = this.add.zone(161, 635, 100, 32);

        this.physics.add.overlap(zonaIzq, this.player, () => {
            // Solo activar si el jugador entró (no si spaweó encima)
            if (this._transitioning || this._zonaIzqMustExit) return;

            // Bloqueo de progresión: requiere derrotar al boss y a los otros dos npcs
            if (!this.gm.isDefeated('conserje_caf') || !this.gm.isDefeated('npc_loco_caf') || !this.gm.isDefeated('npc_miron_caf')) {
                // Crear al veterano solo si no existe ya
                if (!this.veteranoRugby) {
                    this.veteranoRugby = new npc(this, this.player, 100, 100, 'npc2', 2, "¡Eh! Ni se te ocurra intentar pasar al pasillo. Aquí aplicamos la ley de la melé: nadie avanza hasta que el campo esté despejado. ¡Lárgate y derrota a esos tres!", null, null, "Veterano de Rugby");
                }

                this._zonaIzqMustExit = true; // Forzamos a que el jugador salga de la zona antes de volver a activar el diálogo
                this.showDialogue("¿A dónde vas, novato? Nadie pasa al pasillo hasta que la cafetería esté limpia de bugs... y de porteros pesados. ¡Vuelve al lío!", "Veterano de Rugby");
                return;
            }

            this._transitioning = true;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('pasillo', { entrada: 'desde_cafeteria_izq' });
            });
        });
        this.physics.add.overlap(zonaExitDer, this.player, () => {
            if (this._transitioning) return;
            this._transitioning = true;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('outdoorMap', { entrada: 'entrada_der' });
            });
        });
        this.physics.add.overlap(zonaExitIzq, this.player, () => {
            if (this._transitioning) return;
            this._transitioning = true;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('outdoorMap', { entrada: 'entrada_izq' });
            });
        });

        // Tecla de menú (Espacio)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });

        // Fade-in al entrar en la escena
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Si venimos del exterior (y no es un retorno de batalla): freeze breve + diálogo de bienvenida una sola vez
        if (desdeExterior && !this.savedPos) {
            this.player.freeze();
            this.cameras.main.once('camerafadeincomplete', () => {
                this.player.unfreeze();

                // Diálogo automático al entrar (solo una vez, si el nivel está en caos)
                if (!cafeteriaCompletada && !this.gm.isDefeated('bienvenida_caf_once')) {
                    this.time.delayedCall(500, () => {
                        this.showDialogue(
                            'Bienvenido, esto parece un loquero. Yo mejor me quedo aqui quietita con una cerveza esperando a que se solucione solo, igual que hago con los códigos.',
                            'Estudiante'
                        );
                        this.gm.markDefeated('bienvenida_caf_once');
                    });
                }
            });
        }

        // Música ambiente
        this.music = this.sound.add('music_ambiente', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }
        if (this.amigo1 && this.amigo1.update) {
            this.amigo1.update(t, dt);
        }
        // NPCs del grupo enemies
        if (this._wanderingNpcs) {
            this._wanderingNpcs.forEach(n => { if (n && n.update) n.update(t, dt); });
        }

        // Cuando el jugador sale de zonaIzq (bounds: x[30-130], y[130-190]),
        // se desactiva el flag para que el trigger vuelva a funcionar al re-entrar
        if (this._zonaIzqMustExit && this.player) {
            const px = this.player.x;
            const py = this.player.y;
            if (px < 30 || px > 130 || py < 130 || py > 190) {
                this._zonaIzqMustExit = false;
            }
        }
    }

    /**
     * Genera el estado de la cafetería en CAOS (antes de derrotar al boss).
     * NPCs asustados moviéndose, Andrés en la barra, P1 sentado tranquilo.
     */
    _generarCafeteriaConCaos() {

        // --- Conserje BOSS en la salida (parte superior derecha, bloqueando el pasillo) ---
        this.conserj = new conserje(this, this.player, 1150, 155, 'toy', null, {}, 'OS HE DICHO QUE INICIÉIS SESIÓN EN EL ORDENADOR DEL LABORATORIO', null, null, 'conserje_caf');

        if (this.gm.isJustDefeated('conserje_caf')) {
            // Acabamos de derrotar al conserje boss → escena de victoria
            this.player.freeze();
            this.gm.CompleteNivel('cafeteria');

            this.showDialogue('¡No me toquéis más las narices ni imprimáis tonterías con las impresoras del labroatorio!', 'Conserje', () => {
                this.conserj.huir();
                // Carlos comenta el logro desde el menú
                this.time.delayedCall(800, () => {
                    this.showDialogue(
                        '¡Habéis desbloqueado el acceso a la Planta 1, pero para poder liberar esta planta completa tendréis que derrotar a Lanchares que ha sellado el aula 1. Para entrar, necesitáis una "Llave Maestra de Hardware" que él mismo ha fragmentado. Y un consejo: con vosotros dos no basta. Buscad a otros alumnos que no hayan sido asimilados por la IA; necesitaréis un equipo completo para el examen final.',
                        'Carlos'
                    );
                    this.showDialogue(
                        'Antes del Glitch, Lanchares era una leyenda en la facultad. No solo por sus clases de Computadores, sino por su pasión por el Rugby y sus famosas tertulias con sus "camaradas" en el bar de la esquina. La IA ha retorcido esa mentalidad. Ahora ve la Planta 1 como su propio campo de juego. Se ha blindado con una armadura de placas base y cables de cobre.',
                        'Ismael'
                    );
                    this.showDialogue(
                        'Lanchares ha cerrado el tercer tiempo. Se ha encerrado en su aula y dice que solo los que tengan "espíritu de melé" pueden pasar. Si no le derrotáis, la planta seguirá bloqueada por su muro de silicio.',
                        'Ismael', () => {
                            this.player.unfreeze();
                            // Spawnar NPCs normales tras la victoria en esta misma sala
                            this._generarNPCsPostVictoria();
                        }
                    );
                });
            });

            this.gm.markDefeated('npc_loco_caf');
            this.gm.markDefeated('npc_miron_caf');
        }

        // --- NPCs de fondo asustados (moviéndose nerviosos) ---
        const npcData = [
            { x: 150, y: 220, texture: 'npc1', frame: 8, message: '¡El conserje se ha vuelto loco! ¡Lleva una porra que suelta chispas!' },
            { x: 200, y: 320, texture: 'npc2', frame: 4, message: '¡He intentado salir pero hay una barrera... un Cortafuegos en la puerta!' },
            { x: 450, y: 320, texture: 'npc3', frame: 8, message: 'Cómo no puedo salir me voy a tomar un café y lo que surja' },
            { x: 550, y: 550, texture: 'npc1', frame: 4, message: 'Nos falta uno para un mus, ¿te vienes?.' },
            { x: 100, y: 580, texture: 'npc4', frame: 8, message: 'Bienvenido, esto parece un loquero. Yo mejor me quedo aqui quietita con una cerveza esperando a que se solucione solo, igual que hago con los códigos.' },
            { x: 780, y: 580, texture: 'npc2', frame: 8, message: 'Dicen que si gritas "¡No me compila!" tres veces en el baño, sale Ismael y te corrige los fallos.' },
            { x: 860, y: 200, texture: 'npc4', frame: 8, message: '¿Alguien tiene un cargador de tipo C? Me he quedado sin batería.' },
            { x: 850, y: 270, texture: 'npc3', frame: 8, message: '¡Mi código no funciona y no sé por qué! ¡Mi código funciona Y NO SÉ POR QUÉ!' },
            { x: 900, y: 240, texture: 'npc4', frame: 8, message: 'Para un día que vengo y la gente se ha vuelto loca.' },
            { x: 800, y: 320, texture: 'npc3', frame: 8, message: 'He visto al conserje cargarse a tres estudiantes que intentaron salir corriendo.' },
            { x: 970, y: 280, texture: 'npc4', frame: 8, message: '¡Quiero salir de aquí! ¡Incluso prefiero ir a clase de Ingeniería del Software!' },
            { x: 1050, y: 320, texture: 'npc2', frame: 12, message: '¿Y los profesores? ¡Han perdido la cabeza! ¡Creen que somos bugs que hay que debugear con fuego!' },
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
                'Estudiante Asustado'
            )
        );

        // NPCs moviéndose de forma errática (simulando pánico)
        this._wanderingNpcs = this.npcArray;

        this.npcArray.forEach(npc => this.enemies.add(npc));

        // --- NPC Loco (cafeteria_loco) --- 
        const loco = new cafeteria_loco(this, this.player, 450, 320, null, null, { name: 'Marcos' }, 'AHHHHHHHH HAS HECHO PUSH ANTES QUE PULL TE VAS A ENTERAR', null, null, 'npc_loco_caf');

        if (this.gm.isJustDefeated('npc_loco_caf')) {
            const posi = this.getPosiPostComb(this.savedPos);
            loco.x = posi.x;
            loco.y = posi.y;
            loco.setDirection(posi.direction);
            loco.freeze();
            this.gm.setJustDefeated('');
        } else {
            if (this.gm.isDefeated('npc_loco_caf')) {
                loco.freeze();
            }
        }

        this.enemies.add(loco);

        // --- NPC Mirón ---
        const per_miron = new miron(this, this.player, 707, 340, null, 0, {}, 'Te pille', null, null, 'npc_miron_caf');

        if (this.gm.isJustDefeated('npc_miron_caf')) {
            const posi = this.getPosiPostComb(this.savedPos);
            per_miron.x = posi.x;
            per_miron.y = posi.y;
            per_miron.setDirection(posi.direction);
            per_miron.freeze();
            this.gm.setJustDefeated('');
        } else {
            if (this.gm.isDefeated('npc_miron_caf')) {
                per_miron.freeze();
            }
        }
        this.enemies.add(per_miron);

        // --- Andrés en la barra (da el Pincho de Tortilla) ---
        this.andres = new npc(
            this,
            this.player,
            310, 140,   // cerca de la barra, fuera de la colisión de la fila 3
            'npc2',
            8,
            'Bienvenido, chaval. Primer día, ¿eh? Toma, un Pincho de Tortilla. En este caos hay que mantener las fuerzas.',
            () => {
                // Da el pincho de tortilla la primera vez
                if (!this.gm.isDefeated('andres_dio_pincho')) {
                    this.gm.addItem({
                        id: 'pincho_tortilla',
                        name: 'Pincho de Tortilla',
                        type: 'consumable',
                        heal: 30,
                        description: 'El combustible del héroe. Cura 30 HP.'
                    }, 1);
                    this.gm.markDefeated('andres_dio_pincho');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('¡Has recibido: Pincho de Tortilla!', '');
                    });
                }
            },
            null,
            'Andrés (Barra)'
        );

        // --- P1 (El Repetidor) sentado tranquilo en una mesa ---
        // P1 es amigo1 pero con los diálogos del lore del GDD
        this.amigo1 = new amigo1(this, this.player, 1040, 470, 'amigo1', 0, null, null, null, 'P1');

    }

    /**
     * Genera NPCs normales en la cafetería después de derrotar al boss (post-victoria inmediata).
     */
    _generarNPCsPostVictoria() {
        // Limpiamos los NPCs del estado de caos para que no se solapen con los nuevos
        if (this.enemies) {
            this.enemies.clear(true, true);
        }
        if (this.andres) {
            this.andres.destroy();
            this.andres = null;
        }
        if (this.amigo1) {
            this.amigo1.destroy();
            this.amigo1 = null;
        }
        this._wanderingNpcs = [];

        const postBossNpcs = [
            { x: 400, y: 300, texture: 'npc1', frame: 0, message: '¡Por fin! ¡El conserje ha caído! ¡Somos libres!' },
            { x: 600, y: 400, texture: 'npc3', frame: 0, message: '¡No me lo puedo creer! ¡Habéis tumbado al guarda!' },
            { x: 800, y: 250, texture: 'npc2', frame: 4, message: '¿Podemos salir? ¿Es seguro por fin?' },
        ];

        postBossNpcs.forEach(data => {
            new npc(this, this.player, data.x, data.y, data.texture, data.frame, data.message, null, null, 'Estudiante');
        });
    }

    /**
     * Genera el estado de la cafetería LIBERADA (boss ya derrotado antes).
     * Menos NPCs, andando normalmente, más tranquilos.
     */
    _generarCafeteriaLibeada() {
        const npcPostData = [
            { x: 150, y: 220, texture: 'npc1', frame: 0, message: 'Lanchares controla la planta entera. Dicen que si te pilla, te hace un backup del cerebro y te estalla la cabeza.' },
            { x: 550, y: 350, texture: 'npc2', frame: 4, message: '¿Has oído? Lanchares dice que ganar contra nosotros es "trivial". Pues en el parcial saqué un 1.' },
            { x: 750, y: 200, texture: 'npc4', frame: 8, message: 'La cafetería es segura gracias a vosotros. ¡Pero el resto de la facultad sigue infectada!' },
            { x: 900, y: 450, texture: 'npc3', frame: 0, message: 'Pues ahora que estamos aqui a salvo habrá que echarse una cerveza.' },
            { x: 500, y: 580, texture: 'npc1', frame: 8, message: 'A mi me da igual que haya enemigo o no, no iba a salir de la cafetería de todas formas.' },
            { x: 1000, y: 200, texture: 'npc2', frame: 0, message: '¿Borracha? No, no... es que tengo el horario tan partido que me esta volviendo loca.' },
            { x: 200, y: 400, texture: 'npc4', frame: 4, message: 'Relajate un poco, ¿quieres un piti?.' },
        ];

        this._wanderingNpcs = npcPostData.map(data =>
            new npc(this, this.player, data.x, data.y, data.texture, data.frame, data.message, null, null, 'Estudiante')
        );

        // Andrés en la barra, más tranquilo
        const andres = new npc(
            this,
            this.player,
            310, 120,
            'npc2',
            8,
            'Menos mal que habéis limpiado la planta baja. Otra de tortilla para celebrarlo.',
            null,
            null,
            'Andrés (Barra)'
        );
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

