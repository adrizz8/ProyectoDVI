import Player from './personajes/player.js';
import Toy from './toy.js';
import DialogueManager from './dialogueManager.js';
import NPCBattle from './personajes/npc_battle.js';
import Phaser from 'phaser';


/**
 * Escena principal del juego. La escena se compone de una serie de plataformas 
 * sobre las que se sitúan las bases en las podrán aparecer las estrellas. 
 * El juego comienza generando aleatoriamente una base sobre la que generar una estrella. 
 * @abstract Cada vez que el jugador recoge la estrella, aparece una nueva en otra base.
 * El juego termina cuando el jugador ha recogido 10 estrellas.
 * @extends Phaser.Scene
 */
export default class Level extends Phaser.Scene {
    /**
     * Constructor de la escena
     */
    constructor() {
        super({ key: 'level' });
    }

    /**
     * Creación de los elementos de la escena principal de juego
     */
    create() {
        this.player = new Player(this, 200, 450);


        // Canal de diálogo (Centralizado)
        this.dialogueManager = new DialogueManager(this);

        // Creamos un juguete interactivo en una posición específica
        new Toy(this, this.player, 500, 400, "¡Hola! Soy un juguete y puedo hablar.");

        // --- ENEMIGOS (NPCBattle) ---
        // Añadimos varios enemigos con los que interactuar para batallar
        this.enemies = this.add.group();

        const enemy1 = new NPCBattle(this, this.player, 300, 450, 'toy', {
            name: 'Soldado de Juguete', hp: 50, maxHp: 50, damage: 8
        });
        const enemy2 = new NPCBattle(this, this.player, 700, 450, 'toy', {
            name: 'General de Madera', hp: 120, maxHp: 120, damage: 15
        });
        const enemy3 = new NPCBattle(this, this.player, 500, 100, 'toy', {
            name: 'Espía Silencioso', hp: 70, maxHp: 70, damage: 12
        });

        this.enemies.add(enemy1);
        this.enemies.add(enemy2);
        this.enemies.add(enemy3);

        // ── Abrir menú con ESPACIO ─────────────────────────────────────
        this.input.keyboard.on('keydown-SPACE', () => {
            // Al pulsar espacio se pausa este nivel y se lanza la escena del menú principal
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });
    }

    /**
     * Muestra un mensaje en pantalla a través del manager
     */
    showDialogue(message) {
        this.dialogueManager.showDialogue(message);
    }

    /**
     * Genera una estrella en una de las bases del escenario
     * @param {Array<Base>} from Lista de bases sobre las que se puede crear una estrella
     * Si es null, entonces se crea aleatoriamente sobre cualquiera de las bases existentes
     */
    spawn(from = null) {
        Phaser.Math.RND.pick(from || this.bases.children.entries).spawn();
    }

    /**
     * Actualiza el temporizador global de horas de juego
     * @param {number} dt Delta en ms
     */
    _updateTimer(dt) {
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);
    }

    update(time, dt) {
        // incrementa tiempo jugado
        this._updateTimer(dt);
    }

    /**
     * Método que se ejecuta al coger una estrella. 
     * Ahora, al coger una estrella, pasamos directamente al Nivel 2.
     * @param {Base} base La base sobre la que estaba la estrella que se ha cogido
     */
    starPickt(base) {
        // Al tocar la estrella, cambiamos al nuevo escenario
        this.scene.start('level2');
    }
}
