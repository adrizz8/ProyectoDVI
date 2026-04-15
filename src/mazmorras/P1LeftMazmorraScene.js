import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';
import Boton from '../gates/boton.js';
import Cable from '../gates/cable.js';
import AndGate from '../gates/and_gate.js';
import NotGate from '../gates/not_gate.js';
import trigger from '../trigger.js';

export default class P1LeftMazmorraScene extends Phaser.Scene {
    constructor() {
        super({ key: 'p1LeftMazmorra' });
    }

    create(data) {

        var entradas = new Map();
        entradas.set('lobby', { x: 290, y: 560, direccion: 'left' });
        entradas.set('salida_miniboss', { x: 375, y: 255, direccion: 'down' });

        const map = this.make.tilemap({ key: 'p1LeftMazmorra' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelo = map.createLayer('Suelo', tileset, 0, 0);
        const paredes = map.createLayer('Paredes', tileset, 0, 0);
        const decoracionypuerta = map.createLayer('Decoracionypuerta', tileset, 0, 0);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });

        // Jugador
        // Recuperar posición guardada o usar la de defecto
        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();
        const startX = savedPos ? savedPos.x : 100;
        const startY = savedPos ? savedPos.y : 400;

        // Restaurar dirección si existía
        if (savedPos && savedPos.direction) {
            this.player.setDirection(savedPos.direction);
        }

        // Spawn del jugador
        const posi = entradas.get(data.entrada) || entradas.get('desde_cafeteria');
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;

        this.player = new Player(this, spawnX, spawnY, direccion, true);
        this.player.setDirection(direccion);

        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, decoracionypuerta);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        this.lobby = map.createFromObjects('triggers', {
            name: 'lobby',
            classType: trigger
        });
        this.miniboss = map.createFromObjects('triggers', {
            name: 'miniboss',
            classType: trigger
        });
        this.physics.add.overlap(this.player, this.lobby, () => {
            this.scene.start('entradaMazmorra', { entrada: 'izq' });
        });
        this.physics.add.overlap(this.player, this.miniboss, () => {
            this.scene.start('salaMiniBoss');
        });


        // Limpiamos la posición para que no se use de nuevo si cambiamos de nivel después
        if (savedPos) gm.clearPlayerPosition();
        this.player.setDepth(1);
        this.dialogueManager = new DialogueManager(this);

        // 1. Entradas (Botones)
        this.boton1 = new Boton(this, this.player, 810, 450);
        this.boton1.setDepth(1);
        this.boton2 = new Boton(this, this.player, 870, 450);
        this.boton2.setDepth(1);
        this.boton3 = new Boton(this, this.player, 930, 450);
        this.boton3.setDepth(1);
        this.boton4 = new Boton(this, this.player, 990, 450);
        this.boton4.setDepth(1);

        // 2. Puertas Lógicas 
        this.and_gate1 = new AndGate(this, 840, 300, this.player);
        this.and_gate1.setDepth(1);
        this.and_gate2 = new AndGate(this, 960, 300, this.player);
        this.and_gate2.setDepth(1);
        this.not_gate1 = new NotGate(this, 810, 400, this.player);
        this.not_gate1.setDepth(1);
        this.and_gate3 = new AndGate(this, 900, 104, this.player);
        this.and_gate3.setDepth(1);

        // 3. Cables (Aquí corregimos los nombres de las propiedades de destino)
        this.cable1 = new Cable(this, 810, 425);
        this.cable1.setDisplaySize(50, 10);
        this.cable1.connectInput(this.boton1);
        this.cable1.connectOutput(this.not_gate1, 'signalIn'); // CAMBIADO: de 'input' a 'signalIn'

        this.cable2 = new Cable(this, 810, 375);
        this.cable2.setDisplaySize(50, 10);
        this.cable2.connectInput(this.not_gate1);
        this.cable2.connectOutput(this.and_gate1, 'inputA');

        this.cable3 = new Cable(this, 870, 400);
        this.cable3.connectInput(this.boton2);
        this.cable3.connectOutput(this.and_gate1, 'inputB');

        this.cable4 = new Cable(this, 930, 400);
        this.cable4.connectInput(this.boton3);
        this.cable4.connectOutput(this.and_gate2, 'inputA');

        this.cable5 = new Cable(this, 990, 400);
        this.cable5.connectInput(this.boton4);
        this.cable5.connectOutput(this.and_gate2, 'inputB');

        this.cable6 = new Cable(this, 840, 250);
        this.cable6.connectInput(this.and_gate1);
        this.cable6.connectOutput(this.and_gate3, 'inputA');

        this.cable_right6 = new Cable(this, 848, 190, 'cable_right_off');
        this.cable_right6.angle = 180;
        this.cable_right6.connectInput(this.and_gate1);

        this.cable_left6 = new Cable(this, 870, 174, 'cable_right_off');
        this.cable_left6.angle = 0;
        this.cable_left6.connectInput(this.and_gate1);

        this.cable7 = new Cable(this, 960, 250);
        this.cable7.connectInput(this.and_gate2);
        this.cable7.connectOutput(this.and_gate3, 'inputB');

        this.cable_left7 = new Cable(this, 952, 190, 'cable_right_off');
        this.cable_left7.angle = 270;
        this.cable_left7.connectInput(this.and_gate2);

        this.cable_right7 = new Cable(this, 930, 174, 'cable_right_off');
        this.cable_right7.angle = 90;
        this.cable_right7.connectInput(this.and_gate2);




        this.cableSalida_right = new Cable(this, 908, 40, 'cable_right_off');
        this.cableSalida_right.angle = 180;
        this.cableSalida_right.connectInput(this.and_gate3);

        this.cableSalida = new Cable(this, 1000, 32);
        this.cableSalida.setDisplaySize(182, 10)
        this.cableSalida.angle = 0;
        this.cableSalida.connectInput(this.and_gate3);
        this.cableSalida.setCompleted('puzleIzquierdaCompletado');

        this.circuitComponents = [
            this.cable1, this.cable2, this.cable3, this.cable4, this.cable5,
            this.cable6, this.cable7, this.cable_left6, this.cable_right6,
            this.cable_left7, this.cable_right7, this.and_gate1, this.and_gate2,
            this.and_gate3, this.not_gate1, this.boton1, this.boton2,
            this.boton3, this.boton4, this.cableSalida_right, this.cableSalida
        ];

        // Ajustes de profundidad y tamaño masivos (opcional, simplificado)
        this.circuitComponents.forEach(c => {
            if (c.body && c.body.updateFromGameObject) c.body.updateFromGameObject();
        });

        // Listener para abrir el menú principal con la tecla ESPACIO
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });
    }

    update(t, dt) {
        // sumar segundos jugados
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        this.circuitComponents.forEach(component => {
            if (component.updateLogic) component.updateLogic();
        });
    }
}
