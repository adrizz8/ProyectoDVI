import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import Boton from '../gates/boton.js';
import Cable from '../gates/cable.js';
import AndGate from '../gates/and_gate.js';
import NotGate from '../gates/not_gate.js';
import OrGate from '../gates/or_gate.js';
import GameManager from '../manager.js';
import trigger from '../trigger.js';
import EventManager from '../eventManager.js';

export default class P1RightMazmorraScene extends Phaser.Scene {
    constructor() {
        super({ key: 'p1RightMazmorra' });
    }

    create(data) {
        const map = this.make.tilemap({ key: 'p1RightMazmorra' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelo = map.createLayer('Suelo', tileset, 0, 0);
        const paredes = map.createLayer('Paredes', tileset, 0, 0);
        const decoracion = map.createLayer('Decoracion', tileset, 0, 0);

        suelo.setDepth(0);
        decoracion.setDepth(0.3);
        paredes.setDepth(0.2);

        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });

        // Spawn
        const entradas = new Map();
        entradas.set('lobby', { x: 50, y: 1015, direccion: 'right' });

        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();
        const posi = entradas.get(data.entrada) || entradas.get('lobby');

        gm.addNivel('p1RightMazmorra');

        this.player = new Player(this, posi.x, posi.y, posi.direccion, true);
        this.player.setDirection(posi.direccion);
        if (savedPos) {
            gm.clearPlayerPosition();
            this.player.setDirection(savedPos.direction);
            this.player.setPosition(savedPos.x, savedPos.y);
        }

        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, decoracion);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        this.lobby = map.createFromObjects('triggers', { name: 'lobby', classType: trigger });
        this.physics.add.overlap(this.player, this.lobby, () => {
            this.scene.start('entradaMazmorra', { entrada: 'der' });
        });

        if (savedPos) gm.clearPlayerPosition();
        this.player.setDepth(1);
        this.puzleCompletadoLocal = false; // No se usa ya, pero lo dejamos por si acaso
        this.puzleTimer = 0;

        // ── Helpers ───────────────────────────────────────────────────────────────

        /**
         * Centro de un tile object de Tiled con rotación.
         * Tiled rota alrededor de la esquina inferior-izquierda (x,y).
         * Phaser rota alrededor del centro (origin 0.5).
         * Fórmula: proyecta el vector local (hw, -hh) con la rotación del objeto.
         */
        const tc = obj => {
            const hw = obj.width / 2;
            const hh = obj.height / 2;
            if (!obj.rotation) return { x: obj.x + hw, y: obj.y - hh };
            const rad = (obj.rotation * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            return {
                x: obj.x + cos * hw + sin * hh,
                y: obj.y + sin * hw - cos * hh
            };
        };

        const byName = (layer, name) => layer.find(o => o.name === name);

        // ── Capas de objetos ──────────────────────────────────────────────────────
        const botonLayer = map.getObjectLayer('boton').objects;
        const andLayer = map.getObjectLayer('and').objects;
        const notLayer = map.getObjectLayer('not').objects;
        const orLayer = map.getObjectLayer('or').objects;
        const cableLayer = map.getObjectLayer('cable').objects;

        // ── 1. Botones ────────────────────────────────────────────────────────────
        const mkBoton = name => {
            const obj = byName(botonLayer, name);
            const p = tc(obj);
            const b = new Boton(this, this.player, p.x, p.y, name);
            b.output = GameManager.getInstance().getButtonState(this.scene.key, name);
            b.updateVisuals();
            b.setDisplaySize(obj.width, obj.height);
            b.setDepth(1);
            return b;
        };
        this.boton1 = mkBoton('boton1');
        this.boton2 = mkBoton('boton2');
        this.boton3 = mkBoton('boton3');
        this.boton4 = mkBoton('boton4');

        // ── 2. Puertas NOT ────────────────────────────────────────────────────────
        const mkNot = name => {
            const obj = byName(notLayer, name);
            const p = tc(obj);
            const g = new NotGate(this, p.x, p.y, this.player);
            g.setDisplaySize(obj.width, obj.height);
            g.setDepth(1);
            return g;
        };
        this.not_gate1 = mkNot('not_gate1');
        this.not_gate2 = mkNot('not_gate2');

        // ── 3. Puertas OR ─────────────────────────────────────────────────────────
        const mkOr = name => {
            const obj = byName(orLayer, name);
            const p = tc(obj);
            const g = new OrGate(this, p.x, p.y, this.player);
            g.setDisplaySize(obj.width, obj.height);
            g.setDepth(1);
            return g;
        };
        this.or_gate1 = mkOr('or_gate1');
        this.or_gate2 = mkOr('or_gate2');
        this.or_gate3 = mkOr('or_gate3');

        // ── 4. Puertas AND ────────────────────────────────────────────────────────
        const mkAnd = name => {
            const obj = byName(andLayer, name);
            const p = tc(obj);
            const g = new AndGate(this, p.x, p.y, this.player);
            g.setDisplaySize(obj.width, obj.height);
            g.setDepth(1);
            return g;
        };
        this.and_gate1 = mkAnd('and_gate1');
        this.and_gate2 = mkAnd('and_gate2');
        this.and_gate3 = mkAnd('and_gate3');

        // ── 5. Cables desde el JSON (posición, tamaño y ángulo automáticos) ───────────
        /**
         * Mapea el GID de Tiled a la clave de textura Phaser.
         * Tiled usa los 3 bits más significativos para flips:
         * bit 31: horizontal, bit 30: vertical, bit 29: diagonal (rotación 90)
         */
        const F_H = 0x80000000;
        const F_V = 0x40000000;
        const F_D = 0x20000000;

        const gidToKey = gid => {
            const base = gid & ~(F_H | F_V | F_D);
            return base === 1646 ? 'cable_right_off' : 'cable_off';
        };

        this.cables = {};
        cableLayer.forEach(obj => {
            const p = tc(obj);                      // centro corregido con rotación
            const key = gidToKey(obj.gid);          // tipo de cable
            const cab = new Cable(this, p.x, p.y, key);

            const flipX = (obj.gid & F_H) !== 0;
            const flipY = (obj.gid & F_V) !== 0;
            const flipD = (obj.gid & F_D) !== 0;

            let angle = obj.rotation || 0;
            let fX = flipX;
            let fY = flipY;

            // En Tiled el flip diagonal equivale a intercambiar X e Y
            // Visualmente en Phaser equivale a rotar 90 grados y flipear X
            if (flipD) {
                angle += 90;
                fX = !flipX;
            }

            cab.angle = angle;
            cab.setFlip(fX, fY);
            cab.setDisplaySize(obj.width, obj.height);
            cab.setDepth(0.1);
            this.cables[obj.name] = cab;
        });

        // Alias corto
        const c = name => this.cables[name];

        // ── 6. Conexiones lógicas del circuito ───────────────────────────────────
        // cable1
        c('cable1').connectInput(this.boton1);
        c('cable1').connectOutput(this.or_gate1, 'inputA');

        // cable2
        c('cable2_ini').connectInput(this.boton2);
        c('cable2_izq_g').connectInput(this.boton2);
        c('cable2_izq').connectInput(this.boton2);
        c('cable2_izq_up').connectInput(this.boton2);
        c('cable2_izq_up').connectOutput(this.or_gate1, 'inputB');
        c('cable2_der_g').connectInput(this.boton2);
        c('cable2_der_up').connectInput(this.boton2);
        c('cable2_der_up').connectOutput(this.or_gate2, 'inputA');

        // cable3
        c('cable3_ini').connectInput(this.boton3);
        c('cable3_izq_g').connectInput(this.boton3);
        c('cable3_izq_up').connectInput(this.boton3);
        c('cable3_izq_up').connectOutput(this.or_gate2, 'inputB');
        c('cable3_der').connectInput(this.boton3);
        c('cable3_der_g').connectInput(this.boton3);
        c('cable3_der_up').connectInput(this.boton3);
        c('cable3_der_up').connectOutput(this.and_gate1, 'inputA');


        // cable4
        c('cable4').connectInput(this.boton4);
        c('cable4').connectOutput(this.and_gate1, 'inputB');

        // cable5
        c('cable5').connectInput(this.or_gate1);
        c('cable5').connectOutput(this.not_gate1, 'signalIn');

        // cable6
        c('cable6_ini').connectInput(this.not_gate1);
        c('cable6_der_g').connectInput(this.not_gate1);
        c('cable6_der').connectInput(this.not_gate1);
        c('cable6_der').connectOutput(this.and_gate2, 'inputA');

        // cable7
        c('cable7_izq_g').connectInput(this.or_gate2);
        c('cable7_izq').connectInput(this.or_gate2);
        c('cable7_ini').connectInput(this.or_gate2);
        c('cable7_izq_up').connectInput(this.or_gate2);
        c('cable7_izq_up').connectOutput(this.and_gate2, 'inputB');
        c('cable7_der').connectInput(this.or_gate2);
        c('cable7_der_g').connectInput(this.or_gate2);
        c('cable7_der_g').connectOutput(this.not_gate2, 'signalIn');

        // cable8
        c('cable8').connectInput(this.not_gate2);
        c('cable8').connectOutput(this.or_gate3, 'inputA');

        // cable9
        c('cable9_izq').connectInput(this.and_gate1);
        c('cable9_ini').connectInput(this.and_gate1);
        c('cable9_g').connectInput(this.and_gate1);
        c('cable9_up').connectInput(this.and_gate1);
        c('cable9_up').connectOutput(this.or_gate3, 'inputB');

        // cable10
        c('cable10_ini').connectInput(this.and_gate2);
        c('cable10_g').connectInput(this.and_gate2);
        c('cable10_der').connectInput(this.and_gate2);
        c('cable10_der').connectOutput(this.and_gate3, 'inputA');

        // cable11
        c('cable11_ini').connectInput(this.or_gate3);
        c('cable11_g').connectInput(this.or_gate3);
        c('cable11_izq').connectInput(this.or_gate3);
        c('cable11_izq').connectOutput(this.and_gate3, 'inputB');

        // cable12 (Salida final)
        c('cable12_ini').connectInput(this.and_gate3);
        c('cable12_izq').connectInput(this.and_gate3);

        // ── 7. Lista de componentes ───────────────────────────────────────────────
        this.circuitComponents = [
            this.boton1, this.boton2, this.boton3, this.boton4,
            this.not_gate1, this.not_gate2,
            this.or_gate1, this.or_gate2, this.or_gate3,
            this.and_gate1, this.and_gate2, this.and_gate3,
            ...Object.values(this.cables)
        ];

        this.circuitComponents.forEach(comp => {
            if (comp.body && comp.body.updateFromGameObject) comp.body.updateFromGameObject();
        });

        // ── Menú ──────────────────────────────────────────────────────────────────
        const launchMenu = () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        };
        this.input.keyboard.on('keydown-SPACE', launchMenu);
        this.input.on('pointerdown', pointer => {
            if (pointer.rightButtonDown()) launchMenu();
        });

        // Música
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });
    }

    update(t, dt) {
        if (this.player && this.player.update) this.player.update(t, dt);
        this.circuitComponents.forEach(comp => {
            if (comp.updateLogic) comp.updateLogic();
        });

        // Feedback de puzzle completado con retardo para evitar glitches
        const em = EventManager.getInstance();
        const cableFinal = this.cables['cable12_izq'];
        
        if (cableFinal && cableFinal.signal) {
            this.puzleTimer += dt;
            if (this.puzleTimer > 200) {
                em.puzleDerechaCompletado = true;
            }
        } else {
            this.puzleTimer = 0;
            em.puzleDerechaCompletado = false;
        }

        if (!em.puzleDerechaFeedbackMostrado && em.puzleDerechaCompletado) {
            em.puzleDerechaFeedbackMostrado = true;
            this.sound.play('completed');
            this.dialogueManager.showDialogue("Se ha desbloqueado un cerrojo.");
        }
    }
}
