import Player from './personajes/player.js';
import DialogueManager from './dialogueManager.js';
import NPCBattle from './personajes/npc_battle.js';
import Phaser from 'phaser';
import NPC from './personajes/npc.js';
import GameManager from './manager.js';
import Item from './item/item.js';


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
        // Recuperar posición guardada o usar la de defecto
        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();
        const startX = savedPos ? savedPos.x : 200;
        const startY = savedPos ? savedPos.y : 450;

        this.player = new Player(this, startX, startY, 'down', true);

        // Restaurar dirección si existía
        if (savedPos && savedPos.direction) {
            this.player.setDirection(savedPos.direction);
        }

        // Limpiamos la posición para que no se use de nuevo si cambiamos de nivel después
        if (savedPos) gm.clearPlayerPosition();


        // Canal de diálogo (Centralizado)
        this.dialogueManager = new DialogueManager(this);

        // --- ENEMIGOS (NPCBattle) ---
        // Añadimos varios enemigos con los que interactuar para batallar
        this.enemies = this.add.group();

        const enemy1 = new NPCBattle(this, this.player, 300, 450, 'toy', null, {
            name: 'Soldado de Juguete',
            hp: 50,
            maxHp: 50,
            damage: 8,
            speed: 5,
            defense: 5,
            mp: 20,
            maxMp: 20,
            habilidades: ['Ataque Potente']
        }, "¡No pasarás! ¡Prepárate para luchar!");

        const enemy2 = new NPCBattle(this, this.player, 700, 450, 'toy', null, {
            name: 'General de Madera',
            hp: 120,
            maxHp: 120,
            damage: 15,
            speed: 3,
            defense: 12,
            mp: 40,
            maxMp: 40,
            habilidades: ['Ataque Potente', 'Defensa UP']
        });

        const enemy3 = new NPCBattle(this, this.player, 500, 100, 'toy', null, {
            name: 'Espía Silencioso',
            hp: 70,
            maxHp: 70,
            damage: 12,
            speed: 10,
            defense: 4,
            mp: 30,
            maxMp: 30,
            habilidades: ['Golpe Triple']
        });

        // NPC que da un objeto al hablar
        const npc1 = new NPC(this, this.player, 600, 150, 'star', "Hola, toma este objeto para tu viaje.", null, 'eter', "Anciano");

        // Objeto en el suelo
        new Item(this, this.player, 400, 450, 'pocion', 1);

        // NPC de prueba para el callback onFinish
        const npc2 = new NPC(this, this.player, 800, 150, 'star', "Mírame bien... ¡voy a crecer!", () => {
            npc2.setScale(2);
        }, null, "Estatua");

        this.enemies.add(enemy1);
        this.enemies.add(enemy2);
        this.enemies.add(enemy3);
        this.enemies.add(npc1);
        this.enemies.add(npc2);

        // ── Abrir menú con ESPACIO ─────────────────────────────────────
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            // Al pulsar espacio se pausa este nivel y se lanza la escena del menú principal
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });
    }

    /**
     * Muestra un mensaje en pantalla a través del manager
     */
    showDialogue(message, nombre = '', onFinish = null) {
        this.dialogueManager.showDialogue(message, nombre, onFinish);
    }
}
