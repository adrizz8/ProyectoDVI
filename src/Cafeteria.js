import Player from './personajes/player.js';
import Phaser from 'phaser';
import trigger from './trigger.js';
import npc from './personajes/npc.js'
import NPCBattle from './personajes/npc_battle.js';
import DialogueManager from './dialogueManager.js';
import cafeteria_loco from './personajes/cafeteria_loco.js';

import GameManager from './manager.js';
import amigo1 from './personajes/amigo1.js';
import conserje from './personajes/conserje.js'
import TiendaUI from './menuScenes/tienda.js';

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
        this.map = this.make.tilemap({ key: 'cafeteria' });

        var entradas = new Map();
        entradas.set('salida_autobus', { x: 820, y: 980, direccion: 'up' });
        // Entrada desde exterior: x coincide con el trigger en mapaFuera.json
        entradas.set('puerta_izq', { x: 161, y: 580, direccion: 'up' });
        entradas.set('puerta_der', { x: 896, y: 580, direccion: 'up' });
        // Vuelta desde el pasillo
        entradas.set('desde_pasillo_izq', { x: 80, y: 160, direccion: 'down' });
        entradas.set('desde_pasillo_der', { x: 1145, y: 160, direccion: 'down' });

        this.physics.world.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );


        // Tilesets 

        const tilesCafeteria = this.map.addTilesetImage('tilesetinteriordvifinal', 'tilesCafeteria');

        const suelo = this.map.createLayer('suelo', tilesCafeteria, 0, 0);
        const pared = this.map.createLayer('pared', tilesCafeteria, 0, 0);
        const puertas = this.map.createLayer('puertas', tilesCafeteria, 0, 0);
        const decoracion = this.map.createLayer('decoracion', tilesCafeteria, 0, 0);
        const decoracion2 = this.map.createLayer('decoracion2', tilesCafeteria, 0, 0);




        const colisiones = this.map.createLayer('colisiones', tilesCafeteria, 0, 0);

        // Colisiones
        colisiones.setCollisionByProperty({ collides: true });
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
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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
            this.enemies = this.add.group();
            this._generarCafeteriaConCaos();
        } else {
            this._generarCafeteriaLibeada();
        }


        // --- Lógica de Compañero (P1) ---
        // Se asegura de que P1 aparezca si ya está en el equipo, evitando duplicados
        if (this.gm.ActualPlayers.includes('Jugador2') && !this.amigo1) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            this.physics.add.collider(this.amigo1, this.colisiones);
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
        this._zonaDerMustExit = (data.entrada === 'desde_pasillo_der');

        if (cafeteriaCompletada) {
            // puerta_der → pasillo (extremo derecho del mapa, filas 4-5)
            const zonaDer = this.add.zone(1200, 160, 48, 128);
            this._zonaDer = zonaDer;
            this.physics.world.enable(zonaDer, Phaser.Physics.Arcade.STATIC_BODY);

            this.physics.add.overlap(zonaDer, this.player, () => {
                if (this._transitioning || this._zonaDerMustExit) return;

                // Bloqueo de progresión: requiere derrotar al boss y a los otros dos npcs
                if (!this.gm.isDefeated('conserje_caf') || !this.gm.isDefeated('npc_loco_caf')) {
                    this._zonaDerMustExit = true;
                    this.showDialogue("¡Espera! No puedes pasar al pasillo todavía. El conserje y ese tipo raro siguen dando problemas. ¡Encárgate de ellos primero!", "Veterano de Rugby");
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
        const zonaIzq = this.add.zone(95, 160, 100, 20);
        this._zonaIzq = zonaIzq;
        this.physics.world.enable(zonaIzq, Phaser.Physics.Arcade.STATIC_BODY);

        // puerta exterior con color para que se note que hay una puerta
        this.add.rectangle(161, 635, 100, 32, 0xffd966, 0.35).setDepth(99);
        this.add.rectangle(896, 635, 100, 32, 0xffd966, 0.35).setDepth(99);

        // Zona de salida baja derecha → volver al exterior (x=896, coincide con trigger en mapaFuera)
        const zonaExitDer = this.add.zone(896, 635, 100, 32);
        this.physics.world.enable(zonaExitDer, Phaser.Physics.Arcade.STATIC_BODY);

        // Zona de salida baja izquierda → volver al exterior (x=161, coincide con trigger en mapaFuera)
        const zonaExitIzq = this.add.zone(161, 635, 100, 32);
        this.physics.world.enable(zonaExitIzq, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(zonaIzq, this.player, () => {
            // Solo activar si el jugador entró (no si spaweó encima)
            if (this._transitioning || this._zonaIzqMustExit) return;

            // Bloqueo de progresión: requiere derrotar al boss y a los otros dos npcs
            if (!this.gm.isDefeated('conserje_caf') || !this.gm.isDefeated('npc_loco_caf')) {
                // Crear al veterano solo si no existe ya
                if (!this.veteranoRugby) {
                    this.veteranoRugby = new npc(this, this.player, 100, 100, 'npc2', 2, "¡Eh! Ni se te ocurra intentar pasar al pasillo. Aquí aplicamos la ley de la melé: nadie avanza hasta que el campo esté despejado. ¡Lárgate y derrota a esos dos!", null, null, "Veterano de Rugby");
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
        // Actualizar el contador global de tiempo
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

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

        // Cuando el jugador sale de las zonas de puerta, se desactivan los flags
        // para que los triggers vuelvan a funcionar al re-entrar
        if (this._zonaIzqMustExit && this.player) {
            // Comprobamos si el cuerpo del jugador sigue tocando la zona
            const stillOverlapping = this.physics.overlap(this.player, this._zonaIzq);
            if (!stillOverlapping) {
                this._zonaIzqMustExit = false;
            }
        }
        if (this._zonaDerMustExit && this.player) {
            const stillOverlapping = this.physics.overlap(this.player, this._zonaDer);
            if (!stillOverlapping) {
                this._zonaDerMustExit = false;
            }
        }
    }

    /**
     * Genera el estado de la cafetería en CAOS (antes de derrotar al boss).
     * NPCs asustados moviéndose, Andrés en la barra, P1 sentado tranquilo.
     */
    _generarCafeteriaConCaos() {

        // --- Conserje BOSS en la salida ---
        this.conserj = new conserje(this, this.player, 1125, 140, 'conserje', null, {
            name: 'Conserje',
            hp: 40,
            maxHp: 40,
            damage: 11,
            speed: 8,
            defense: 16,
            mp: 11,
            maxMp: 11,
            expReward: 60,
            habilidades: ['Ir a la Academia', 'Código Fácil'],
            spriteKey: 'conserjebatalla',
            scale: 0.45
        }, 'OS HE DICHO QUE INICIÉIS SESIÓN EN EL ORDENADOR DEL LABORATORIO', null, null, 'conserje_caf');

        if (this.gm.isJustDefeated('conserje_caf')) {
            // Acabamos de derrotar al conserje boss → escena de victoria
            this.player.freeze();
            this.gm.CompleteNivel('cafeteria');

            this.showDialogue('¡No me toquéis más las narices ni imprimáis tonterías con las impresoras del labroatorio!', 'Conserje', () => {
                this.conserj.huir();
                // Carlos comenta el logro desde el menú
                this.time.delayedCall(800, () => {
                    this.showDialogue(
                        '¡Acceso a la Planta 1 desbloqueado! Pero cuidado: Lanchares ha sellado el aula 1. Necesitaréis la "Llave Maestra de Hardware" y un equipo completo para derrotarle.',
                        'Carlos'
                    );
                    this.showDialogue(
                        'Lanchares se ha blindado con una armadura de placas base y solo deja pasar a los que tengan "espíritu de melé". Si no le vencéis, la planta seguirá bloqueada.',
                        'Ismael', () => {
                            this.player.unfreeze();
                            this._generarNPCsPostVictoria();
                        }
                    );
                });
            });

            this.gm.markDefeated('npc_loco_caf');
        }

        // --- NPCs de fondo asustados (moviéndose nerviosos) ---
        const npcData = [
            { x: 1180, y: 410, texture: 'npc1', frame: 12, message: '¡El de la puerta esta loco, dice que nadie sale de aqui con comida o bebida para ir a los laboratorios!' },
            { x: 250, y: 180, texture: 'npc2', frame: 4, message: 'No puedo salir para ir a clase, pero tampoco tenia pensado hacerlo' },
            { x: 450, y: 325, texture: 'npc3', frame: 4, message: 'Cómo no puedo salir me voy a tomar un café y lo que surja' },
            { x: 170, y: 360, texture: 'npc1', frame: 0, message: 'Nos falta uno para un mus, ¿te vienes?.' },
            { x: 100, y: 580, texture: 'npc4', frame: 8, message: 'Bienvenido, esto parece un loquero. Yo mejor me quedo aqui quietita con una cerveza esperando a que se solucione solo, igual que hago con los códigos.' },
            { x: 800, y: 300, texture: 'npc2', frame: 8, message: 'Dicen que si gritas "¡No me compila!" tres veces en el baño, sale Ismael y te corrige los fallos.' },
            { x: 560, y: 560, texture: 'npc4', frame: 4, message: 'Mírale que conento  en su primer día de carrera, me recuerda a mi cuando la empecé hace ocho años' },
            { x: 850, y: 300, texture: 'npc3', frame: 4, message: 'Para un día que vengo y la gente se ha vuelto loca.' },
            //  { x: 900, y: 240, texture: 'npc4', frame: 8, message: 'Para un día que vengo y la gente se ha vuelto loca.' },
            //{ x: 800, y: 320, texture: 'npc3', frame: 8, message: 'He visto al conserje cargarse a tres estudiantes que intentaron salir corriendo.' },
            { x: 940, y: 220, texture: 'npc4', frame: 8, message: '¡Quiero salir de aquí! ¡Incluso prefiero ir a clase de Ingeniería del Software!' },
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
                'Estudiante Agobiado'
            )
        );

        // NPCs moviéndose de forma errática (simulando pánico)
        this._wanderingNpcs = this.npcArray;

        this.npcArray.forEach(npc => this.enemies.add(npc));

        // --- NPC Loco (cafeteria_loco) --- 
        const loco = new cafeteria_loco(this, this.player, 550, 310, null, null, {
            spriteKey: 'estudiantebattle',
            name: 'Marcos',
            hp: 30,
            maxHp: 30,
            damage: 7,
            speed: 16,
            defense: 11,
            mp: 8,
            maxMp: 8,
            expReward: 50,
            habilidades: ['Entrega Última Hora'],
        }, 'AHHHHHHHH HAS HECHO PUSH ANTES QUE PULL TE VAS A ENTERAR', null, null, 'npc_loco_caf');

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



        // --- Andrés en la barra (da el Pincho de Tortilla) ---
        this._spawnAndres(133);

        // --- Enfermera Joy (cura al equipo) ---
        this.enfermeraJoy = new npc(this, this.player, 976, 144, 'enfermera_joy', 0, null, () => {
            this.showDialogue("¿Qué hago aquí? Esto no es un Centro Pokémon... Pero bueno, veo que necesitas ayuda. ¡Déjame curar a todo tu equipo!", "Enfermera Joy", () => {
                // Curar a todo el equipo
                this.gm.healAllTeam();
                this.showDialogue("¡Listo! Todo tu equipo está completamente curado. ¡Hasta la próxima!", "Enfermera Joy");
            });
        }, null, 'Enfermera Joy');

        // --- P1 (El Repetidor) sentado tranquilo en una mesa ---
        // P1 es amigo1 pero con los diálogos del lore del GDD
        this.amigo1 = new amigo1(this, this.player, 1040, 450, 'amigo1', 0, null, null, null, 'P1');

    }

    /**
     * Genera NPCs normales en la cafetería después de derrotar al boss (post-victoria inmediata).
     */
    _generarNPCsPostVictoria() {

        this.pasillo_der = this.map.createFromObjects('triggers', {
            name: 'pasillo_der',
            classType: trigger
        });


        this.physics.add.overlap(this.pasillo_der, this.player, () => {

            this.scene.start('pasillo', { entrada: 'desde_cafeteria_der' });
        });


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
            { x: 400, y: 300, texture: 'npc1', frame: 0, message: '¡Por fin! ¡El conserje ha caído! ¡Pero aún nos queda el examen de Redes!' },
            { x: 600, y: 390, texture: 'npc3', frame: 0, message: '¿Examen? ¿Qué examen? Yo solo vine por la oferta del tinto y las salchipapas. Si el mundo se acaba, que me pille con el estómago lleno.' },
            { x: 830, y: 250, texture: 'npc2', frame: 4, message: '¡Somos libres! Ahora a celebrarlo con un pincho.' },
        ];

        postBossNpcs.forEach(data => {
            new npc(this, this.player, data.x, data.y, data.texture, data.frame, data.message, null, null, 'Estudiante');
        });

        // RECREAR ANDRÉS (vendedor)
        this._spawnAndres();

        // RECREAR COMPAÑERO (si está en el grupo)
        if (this.gm.ActualPlayers.includes('Jugador2')) {
            this.amigo1 = new amigo1(this, this.player, this.player.x, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            this.physics.add.collider(this.amigo1, this.colisiones);
        }
    }

    _spawnAndres() {
        this.andres = new npc(this, this.player, 710, 133, 'tiendacafe', 0, " ", () => {
            const msg = this.gm.isDefeated('andres_dio_pincho')
                ? '¿Qué te pongo chaval?.'
                : '¡Qué pasa niño! Primer día, ¿eh? Toma, un Pincho de Tortilla para que cojas energías.';

            this.showDialogue(msg, 'Andrés (Barra)', () => {
                if (!this.gm.isDefeated('andres_dio_pincho')) {
                    this.gm.addItem({ id: 'pincho_tortilla', name: 'Pincho de Tortilla', type: 'consumable', heal: 50, description: 'Recupera 50 HP.' }, 1);
                    this.gm.markDefeated('andres_dio_pincho');
                    this.time.delayedCall(300, () => {
                        this.showDialogue('Has recibido: [Pincho de Tortilla]', 'Andrés (Barra)', () => {
                            this.player.freeze();
                            new TiendaUI(this, () => {
                                this.player.unfreeze();
                            });
                        });
                    });
                } else {
                    this.player.freeze();
                    new TiendaUI(this, () => {
                        this.player.unfreeze();
                    });
                }
            });
        }, null, 'Andrés (Barra)');

        this.andres.interactionThreshold = 140; // Rango más grande
        this.andres.interactionMargin = 100;    // Ángulo de visión más amplio
    }


    /**
     * Genera el estado de la cafetería LIBERADA (boss ya derrotado antes).
     * Menos NPCs, andando normalmente, más tranquilos.
     */
    _generarCafeteriaLibeada() {

        this.pasillo_der = this.map.createFromObjects('triggers', {
            name: 'pasillo_der',
            classType: trigger
        });


        this.physics.add.overlap(this.pasillo_der, this.player, () => {

            this.scene.start('pasillo', { entrada: 'desde_cafeteria_der' });
        });

        const npcPostData = [
            { x: 600, y: 350, texture: 'npc1', frame: 4, message: 'Secretaría es el Boss final secreto. Tiene una habilidad pasiva que hace que siempre te falte un papel, no importa cuántos lleves.' },
            { x: 550, y: 350, texture: 'npc2', frame: 8, message: '¿Has oído? Lanchares dice que ganar contra nosotros es "trivial". Pues en el parcial saqué un 1.' },
            { x: 1036, y: 337, texture: 'npc4', frame: 4, message: 'La cafetería es segura gracias a vosotros. Pero tened cuidado, los camaradas de Lanchares siguen por ahí' },
            { x: 225, y: 545, texture: 'npc3', frame: 12, message: 'Pues ahora que estamos aqui a salvo habrá que echarse una cerveza.' },
            { x: 846, y: 522, texture: 'npc1', frame: 8, message: 'A mi me da igual que haya enemigo o no, no iba a salir de la cafetería de todas formas.' },
            { x: 178, y: 495, texture: 'npc2', frame: 8, message: '¿Borracha? No, no... es que tengo el horario tan partido que me esta volviendo loca.' },
            { x: 215, y: 136, texture: 'npc4', frame: 0, message: 'Relajate un poco, ¿quieres un piti?.' },
        ];

        this._wanderingNpcs = [];

        npcPostData.forEach(data => {
            let onInteract = null;
            let name = 'Estudiante';

            // NPC de la Cerveza
            if (data.x === 178 && data.y === 495) {
                onInteract = () => {
                    if (!this.gm.isDefeated('npc_cerveza_caf_dio')) {
                        this.gm.addItem({ id: 'cerveza', name: 'Cerveza', type: 'consumable', heal: 20, recMp: 10, description: 'Una Mahou bien fría. Recupera 20 HP y 10 MP.' }, 1);
                        this.gm.markDefeated('npc_cerveza_caf_dio');
                        this.time.delayedCall(300, () => {
                            this.showDialogue('¡RECURSO OBTENIDO!\nHas recibido: [Cerveza]', 'Estudiante de Fiesta');
                        });
                    }
                };
                name = 'Estudiante de Fiesta';
            }

            // NPC del Cigarro
            if (data.x === 215 && data.y === 136) {
                onInteract = () => {
                    if (!this.gm.isDefeated('npc_cigarro_caf_dio')) {
                        this.gm.addItem({ id: 'cigarro', name: 'Cigarro', type: 'consumable', description: 'Reduce el estrés.' }, 1);
                        this.gm.markDefeated('npc_cigarro_caf_dio');
                        this.time.delayedCall(300, () => {
                            this.showDialogue('¡RECURSO OBTENIDO!\nHas recibido: [Cigarro]', 'Estudiante Relajado');
                        });
                    }
                };
                name = 'Estudiante Relajado';
            }

            this._wanderingNpcs.push(
                new npc(this, this.player, data.x, data.y, data.texture, data.frame, data.message, onInteract, null, name)
            );
        });


        this._spawnAndres(133);

        // --- Enfermera Joy (cura al equipo) ---
        this.enfermeraJoy = new npc(this, this.player, 976, 144, 'enfermera_joy', 0, null, () => {
            this.showDialogue("¿Qué hago aquí? Esto no es un Centro Pokémon... Pero bueno, veo que necesitas ayuda. ¡Déjame curar a todo tu equipo!", "Enfermera Joy", () => {
                // Curar a todo el equipo
                this.gm.healAllTeam();
                this.showDialogue("¡Listo! Todo tu equipo está completamente curado. ¡Hasta la próxima!", "Enfermera Joy");
            });
        }, null, 'Enfermera Joy');
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

