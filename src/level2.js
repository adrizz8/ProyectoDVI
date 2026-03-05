import Player from './player.js';
import Boton from './boton.js';
import Cable from './cable.js';
import AndGate from './and_gate.js';
import NotGate from './not_gate.js';
import Bombilla from './bombilla.js';
import XorGate from './xor_gate.js';
import OrGate from './or_gate.js';
import DialogueManager from './dialogueManager.js';
import Phaser from 'phaser';

export default class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'level2' });
    }

    preload() {

    }

    create() {
        /*var map = this.make.tilemap({ key: 'mainscene', tileHeight: 32, tileWidth: 32 });
        var tileset = map.addTilesetImage('tilesetexterior', 'tileset');
        var backgroundLayer = map.createLayer('Suelo', tileset, 0, 0);
        var groundLayer = map.createLayer('Arboles', tileset, 0, 0);
        var objectsLayer = map.createLayer('Resto', tileset, 0, 0);
        groundLayer.setCollisionByProperty({ collides: true });
        backgroundLayer.setCollisionByProperty({ collides: true });
        objectsLayer.setCollisionByProperty({ collides: true });*/
        this.player = new Player(this, 100, 400);
        this.player.setDepth(1);
        this.dialogueManager = new DialogueManager(this);

        // 1. Entradas (Botones)
        this.boton1 = new Boton(this, this.player, 300, 150);
        this.boton1.setDepth(1);
        this.boton2 = new Boton(this, this.player, 300, 250);
        this.boton2.setDepth(1);
        this.boton3 = new Boton(this, this.player, 300, 350);
        this.boton3.setDepth(1);
        this.boton4 = new Boton(this, this.player, 300, 450);
        this.boton4.setDepth(1);

        // 2. Puertas Lógicas 
        this.and_gate1 = new AndGate(this, 500, 200, this.player);
        this.and_gate1.setDisplaySize(120, 120);
        this.and_gate1.setDepth(1);
        this.and_gate2 = new AndGate(this, 500, 400, this.player);
        this.and_gate2.setDisplaySize(120, 120);
        this.and_gate2.setDepth(1);
        this.not_gate1 = new NotGate(this, 400, 150, this.player);
        this.not_gate1.setDisplaySize(50, 50);
        this.not_gate1.setDepth(1);
        this.and_gate3 = new AndGate(this, 650, 300, this.player);
        this.and_gate3.setDisplaySize(120, 120);
        this.and_gate3.setDepth(1);

        // 3. Cables (Aquí corregimos los nombres de las propiedades de destino)
        this.cable1 = new Cable(this, 350, 150);
        this.cable1.setDisplaySize(100, 8);
        this.cable1.setDepth(0);
        this.cable1.connectInput(this.boton1);
        this.cable1.connectOutput(this.not_gate1, 'signalIn'); // CAMBIADO: de 'input' a 'signalIn'

        this.cable2 = new Cable(this, 450, 150);
        this.cable2.setDisplaySize(100, 8);
        this.cable2.setDepth(0);
        this.cable2.connectInput(this.not_gate1);
        this.cable2.connectOutput(this.and_gate1, 'inputA');

        this.cable3 = new Cable(this, 400, 250);
        this.cable3.setDisplaySize(200, 8);
        this.cable3.setDepth(0);
        this.cable3.connectInput(this.boton2);
        this.cable3.connectOutput(this.and_gate1, 'inputB');

        this.cable4 = new Cable(this, 400, 350);
        this.cable4.setDisplaySize(200, 8);
        this.cable4.setDepth(0);
        this.cable4.connectInput(this.boton3);
        this.cable4.connectOutput(this.and_gate2, 'inputA');

        this.cable5 = new Cable(this, 400, 450);
        this.cable5.setDisplaySize(200, 8);
        this.cable5.setDepth(0);
        this.cable5.connectInput(this.boton4);
        this.cable5.connectOutput(this.and_gate2, 'inputB');

        this.cable6 = new Cable(this, 550, 250);
        this.cable6.setDisplaySize(100, 8);
        this.cable6.setDepth(0);
        this.cable6.connectInput(this.and_gate1);
        this.cable6.connectOutput(this.and_gate3, 'inputA');

        this.cable7 = new Cable(this, 550, 350);
        this.cable7.setDisplaySize(100, 8);
        this.cable7.setDepth(0);
        this.cable7.connectInput(this.and_gate2);
        this.cable7.connectOutput(this.and_gate3, 'inputB');

        // 4. Salida (Bombilla)
        this.bombilla = new Bombilla(this, this.player, 800, 300, "¡Prepárate para luchar!");
        this.bombilla.setDepth(1);

        this.cableSalida = new Cable(this, 725, 300);
        this.cableSalida.setDisplaySize(100, 8);
        this.cableSalida.setDepth(0);
        this.cableSalida.connectInput(this.and_gate3);
        this.cableSalida.connectOutput(this.bombilla, 'signalIn'); // CAMBIADO: de 'input' a 'signalIn'

        this.circuitComponents = [
            this.cable1, this.cable2, this.cable3, this.cable4, this.cable5,
            this.cable6, this.cable7, this.and_gate1, this.and_gate2,
            this.and_gate3, this.not_gate1, this.boton1, this.boton2,
            this.boton3, this.boton4, this.cableSalida, this.bombilla
        ];

        // Ajustes de profundidad y tamaño masivos (opcional, simplificado)
        this.circuitComponents.forEach(c => {
            if (c.body && c.body.updateFromGameObject) c.body.updateFromGameObject();
        });
    }

    update(t, dt) {
        this.circuitComponents.forEach(component => {
            if (component.updateLogic) component.updateLogic();
        });
    }
}