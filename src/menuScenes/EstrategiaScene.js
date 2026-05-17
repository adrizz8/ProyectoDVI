import Phaser from 'phaser';
import GameManager from '../manager.js';
import { HABILITIES } from '../battleScene/habilities.js';

/**
 * EstrategiaScene
 * ---------------
 * Pantalla donde se visualizan los personajes con sus stats, habilidades,
 * PS (HP), PM (MP), estado y nivel.
 */
export default class EstrategiaScene extends Phaser.Scene {
    constructor() {
        super('EstrategiaScene');
        this.panelActivo = null;
    }

    create() {
        this.scene.bringToTop('EstrategiaScene');
        const gm = GameManager.getInstance();

        // Asegurar que no hay panel abierto al inicializar
        this.closePanel();
        this.panelActivo = null;

        // Seleccionar fondo según el número de jugadores reales
        const numPlayers = Math.min(4, Math.max(1, gm.ActualPlayers.length));
        const bgKey = `estrategiaUI${numPlayers}`;
        this.add.image(608, 320, bgKey).setDisplaySize(1216, 640);

        // Iterar solo sobre los jugadores que tenemos realmente
        gm.ActualPlayers.forEach((nombrePers) => {
            const stats = gm.playerStats[nombrePers];
            if (!stats) return;

            // Las coordenadas ya están definidas por el nombre del jugador en crearCardPersonaje
            this.crearCardPersonaje(0, 0, nombrePers, stats);
        });

        // Instrucciones
        this.add.text(608, 620, 'Presiona ESPACIO para volver', {
            fontSize: '14px',
            fill: '#aaaaaa',
            fontFamily: 'Outfit',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controles
        this.input.keyboard.on('keydown-SPACE', () => {
            this.closeScene();
        });
    }

    closeScene() {
        this.closePanel();
        this.scene.stop();
        this.scene.start('MenuPrincipal');
        this.scene.bringToTop('MenuPrincipal');
    }

    crearCardPersonaje(xIgnored, yIgnored, nombre, stats) {
        // x e y se ignoran porque usamos las coordenadas absolutas definidas abajo para cada jugador

        const gm = GameManager.getInstance();
        // Usar el identificador real del personaje para posicionarlo en la UI
        const playerKey = nombre;

        const coordenadasNombres = {
            Jugador1: { x: 211, y: 15 },
            Jugador3: { x: 700, y: 15 },
            Jugador2: { x: 150, y: 345 },
            Jugador4: { x: 700, y: 345 }
        };
        const posNombre = coordenadasNombres[playerKey] || { x: 170, y: 112 };

        const displayName = stats.displayName || `${nombre.replace(/Jugador/, 'P').toUpperCase()}`;
        this.add.text(posNombre.x, posNombre.y, displayName, {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Outfit',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, stroke: true, fill: true }
        });

        // Nivel y experiencia restante
        const xpRestante = Math.max(0, stats.expNext - stats.exp);
        

        // Coordinación con las barras de PS/PM dentro de estrategiaUI, bajo cada retrato
        const coordenadasBarra = {
            Jugador1: { x: 117.50, y:  227}, // arriba izquierda
            Jugador3: { x: 675, y: 227 }, // arriba derecha
            Jugador2: { x: 117.50, y: 558 }, // abajo izquierda
            Jugador4: { x: 675, y: 558 }
        };

        const baseBar = coordenadasBarra[playerKey] || { x: 117.50, y: 227 };
        const barraX = baseBar.x;
        const barraY = baseBar.y;
        const barraWidth = 190;
        const barraHeight = 11;

        // Barra de HP colocada exactamente bajo la barra PS del UI
        this.add.rectangle(barraX, barraY, barraWidth, barraHeight, 0x333333).setOrigin(0, 0);
        this.add.rectangle(barraX, barraY, Math.max(0.1, (stats.hp / stats.maxHp) * barraWidth), barraHeight, 0x1e7b1e).setOrigin(0, 0);
        this.add.text(barraX - 40, barraY - 1, '', { fontSize: '11px', fill: '#86efac', fontFamily: 'Outfit', fontStyle: 'bold' });
        this.add.text(barraX + barraWidth / 2, barraY + barraHeight + 2, `${stats.hp}/${stats.maxHp}`, { fontSize: '20px', fill: '#ffffff', fontFamily: 'Outfit', fontStyle: 'bold', justify: 'center' , stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5, 0);

        // Barra de MP colocada exactamente bajo la barra PM del UI
        const mpY = barraY + barraHeight + 34;
        this.add.rectangle(barraX, mpY, barraWidth, barraHeight, 0x333333).setOrigin(0, 0);
        this.add.rectangle(barraX, mpY, Math.max(0.1, (stats.mp / stats.maxMp) * barraWidth), barraHeight, 0x1e4fbf).setOrigin(0, 0);
        this.add.text(barraX - 40, mpY - 1, '', { fontSize: '11px', fill: '#93c5fd', fontFamily: 'Outfit', fontStyle: 'bold' });
        this.add.text(barraX + barraWidth / 2, mpY + barraHeight + 2, `${stats.mp}/${stats.maxMp}`, { fontSize: '20px', fill: '#ffffff', fontFamily: 'Outfit', fontStyle: 'bold', justify: 'center', stroke: '#000000', strokeThickness: 5  }).setOrigin(0.5, 0);

        const coordenadasStats = {
    Jugador1: {
        damage: { x: 414, y: 95 },
        defense: { x: 414, y: 125 },
        speed: { x: 414, y: 155 },
        luck: { x: 505, y: 95 }
    },
    Jugador2: {
        damage: { x: 414, y: 425},
        defense: { x: 414, y: 455 },
        speed: { x: 414, y: 485 },
        luck: { x: 505, y: 425 }
    },
    Jugador3: {
        damage: { x: 970, y: 95 },
        defense: { x: 970, y: 125 },
        speed: { x: 970, y: 155 },
        luck: { x: 1065, y: 95 }
    },
    Jugador4: {
        damage: { x: 970, y: 425 },
        defense: { x: 970, y: 455 },
        speed: { x: 970, y: 485 },
        luck: { x: 1065, y: 425 }
    }
};

const pos = coordenadasStats[playerKey] || coordenadasStats['Jugador1'];

const coordenadasNivel = {
    Jugador1: {
        level: { x: 414, y: 60 },
        exp: { x: 505, y: 60 }
    },
    Jugador2: {
        level: { x: 414, y: 390 },
        exp: { x: 505, y: 390 }
    },
    Jugador3: {
        level: { x: 970, y: 60 },
        exp: { x: 1065, y: 60 }
    },
    Jugador4: {
        level: { x: 970, y: 390 },
        exp: { x: 1065, y: 390 }
    }
};

const posNivel = coordenadasNivel[playerKey] || coordenadasNivel['Jugador1'];

const estiloNivel = {
    fontSize: '16px',
    fill: '#ffffff',
    fontFamily: 'Outfit',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 5
};

const estiloExp = {
    fontSize: '14px',
    fill: '#ffffff',
    fontFamily: 'Outfit',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 5
};

this.add.text(posNivel.level.x, posNivel.level.y, `${stats.level}`, estiloNivel);
this.add.text(posNivel.exp.x, posNivel.exp.y, `${xpRestante}`, estiloExp);

const estiloStats = {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Outfit',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 5
};

this.add.text(pos.damage.x, pos.damage.y, `${stats.damage}`, estiloStats);
this.add.text(pos.defense.x, pos.defense.y, `${stats.defense}`, estiloStats);
this.add.text(pos.speed.x, pos.speed.y, `${stats.speed}`, estiloStats);
this.add.text(pos.luck.x, pos.luck.y, `${stats.luck}`, estiloStats);

        // Botones interactivos en la UI
        const btnStyle = { fontSize: '20px', fill: '#ffffff', fontFamily: 'Orbitron', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5 };

        // Posiciones predefinidas por personaje (similar al estilo de coordenadasNivel)
        const coordenadasBotones = {
            Jugador1: { habilidades: { x: 373, y: 226 }, equipamiento: { x: 373, y: 270 } },
            Jugador2: { habilidades: { x: 373, y: 550 }, equipamiento: { x: 373, y: 594 } },
            Jugador3: { habilidades: { x: 920, y: 226 }, equipamiento: { x: 920, y: 270 } },
            Jugador4: { habilidades: { x: 920, y: 550 }, equipamiento: { x: 920, y: 594 } }
        };

        const defaultBotones = {
            habilidades: { x: 100, y: 205 },
            equipamiento: { x: 100, y: 225 }
        };

        const configBotones = coordenadasBotones[playerKey] || defaultBotones;
        const posHabilidades = configBotones.habilidades || defaultBotones.habilidades;
        const posEquipamiento = configBotones.equipamiento || defaultBotones.equipamiento;

        const verHab = this.add.text(posHabilidades.x, posHabilidades.y, 'VER HABILIDADES', btnStyle).setInteractive({ useHandCursor: true });
        const verEq = this.add.text(posEquipamiento.x, posEquipamiento.y, 'VER EQUIPAMIENTO', Object.assign({}, btnStyle, { fill: '#5aa6ff' })).setInteractive({ useHandCursor: true });

        verHab.on('pointerdown', () => this.showHabilidadesPanel(nombre, stats));
        verEq.on('pointerdown', () => this.showEquipamientoPanel(nombre, stats));
    }

    showHabilidadesPanel(nombre, stats) {
        this.closePanel();

        const group = this.add.group();

        const numHab = stats.habilidades ? stats.habilidades.length : 0;
        const columns = numHab > 6 ? 2 : 1;
        const rows = columns === 2 ? Math.ceil(numHab / 2) : numHab;
        
        const width = columns === 2 ? 850 : 560;
        const entryHeight = 55;
        const height = Math.max(200, 100 + rows * entryHeight);
        const panelX = 608 - width / 2;
        const panelY = Math.max(50, 320 - height / 2);

        const fondo = this.add.rectangle(608, panelY + height / 2, width, height, 0x000000, 0.9);
        fondo.setStrokeStyle(2, 0x87ceeb);
        group.add(fondo);

        const displayName = stats.displayName || nombre;
        const titulo = this.add.text(608, panelY + 20, `HABILIDADES: ${displayName}`, {
            fontSize: '20px',
            fill: '#f5d442',
            fontFamily: 'Outfit',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        group.add(titulo);

        const descripcion = this.add.text(panelX + 20, panelY + 50, '* Pulsa fuera del panel o ACEPTAR para cerrar', {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Outfit',
            fontStyle: 'italic'
        });
        group.add(descripcion);

        const listaY = panelY + 80;
        if (stats.habilidades && stats.habilidades.length > 0) {
            stats.habilidades.forEach((nombreHab, idx) => {
                const hab = HABILITIES[nombreHab];
                
                const col = columns === 2 ? Math.floor(idx / rows) : 0;
                const row = columns === 2 ? idx % rows : idx;
                
                const x = panelX + 20 + col * 420;
                const y = listaY + row * entryHeight;

                const text = this.add.text(x, y,
                    `- ${hab ? hab.name : nombreHab} ${hab ? `(Coste ${hab.cost} MP)` : ''}`, {
                        fontSize: '16px',
                        fill: '#f8fafc',
                        fontFamily: 'Outfit',
                        fontStyle: 'bold'
                    });
                group.add(text);

                const desc = hab ? hab.description : 'No hay descripción disponible.';
                const descText = this.add.text(x + 20, y + 20, desc, {
                    fontSize: '13px',
                    fill: '#d1d5db',
                    fontFamily: 'Outfit',
                    wordWrap: { width: 380 }
                });
                group.add(descText);
            });
        } else {
            const noText = this.add.text(panelX + 20, listaY, 'Este personaje no tiene habilidades asignadas.', {
                fontSize: '14px',
                fill: '#f5f5f5',
                fontFamily: 'Outfit'
            });
            group.add(noText);
        }

        const cerrar = this.add.text(608, panelY + height - 30, 'CERRAR', {
            fontSize: '16px',
            fill: '#34d399',
            fontFamily: 'Outfit',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        cerrar.on('pointerdown', () => this.closePanel());
        group.add(cerrar);

        const mask = this.add.rectangle(608, 320, 1216, 640, 0x000000, 0.2).setInteractive();
        mask.on('pointerdown', () => this.closePanel());
        group.add(mask);

        this.panelActivo = group;
    }

    showEquipamientoPanel(nombre, stats) {
        this.closePanel();

        const width = 560;
        const height = 280;
        const panelX = 608 - width / 2;
        const panelY = 220;

        const group = this.add.group();

        const fondo = this.add.rectangle(608, panelY + height / 2, width, height, 0x000000, 0.9);
        fondo.setStrokeStyle(2, 0x5aa6ff);
        group.add(fondo);

        const displayName = stats.displayName || nombre;
        const titulo = this.add.text(608, panelY + 20, `EQUIPAMIENTO: ${displayName}`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Outfit',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5, 0);
        group.add(titulo);

        const equipo = stats.equipment || {
            weapon: { name: 'Ninguno', description: 'Sin arma equipada.' },
            armor: { name: 'Ninguno', description: 'Sin armadura equipada.' },
            accessory: { name: 'Ninguno', description: 'Sin accesorio equipado.' }
        };

        const entries = [
            { slot: 'Arma', value: equipo.weapon },
            { slot: 'Armadura', value: equipo.armor },
            { slot: 'Accesorio', value: equipo.accessory }
        ];

        entries.forEach((item, idx) => {
            const y = panelY + 60 + idx * 60;
            this.add.text(panelX + 20, y, `${item.slot}: ${item.value.name}`, {
                fontSize: '14px',
                fill: '#f8fafc',
                fontFamily: 'Outfit',
                fontStyle: 'bold'
            });
            this.add.text(panelX + 20, y + 18, item.value.description || 'Sin descripción', {
                fontSize: '12px',
                fill: '#d1d5db',
                fontFamily: 'Outfit'
            });
        });

        const cerrar = this.add.text(608, panelY + height - 25, 'CERRAR', {
            fontSize: '16px',
            fill: '#34d399',
            fontFamily: 'Outfit',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        cerrar.on('pointerdown', () => this.closePanel());
        group.add(cerrar);

        const mask = this.add.rectangle(608, 320, 1216, 640, 0x000000, 0.2).setInteractive();
        mask.on('pointerdown', () => this.closePanel());
        group.add(mask);

        this.panelActivo = group;
    }

    closePanel() {
        if (this.panelActivo) {
            this.panelActivo.clear(true);
            this.panelActivo = null;
        }
    }

    formatearNombre(nombre) {
        return nombre.replace(/([\d])/g, ' $1').trim();
    }
}
