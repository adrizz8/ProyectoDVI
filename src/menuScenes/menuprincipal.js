class MenuPrincipal extends Phaser.Scene {
    constructor() {
        super('MenuPrincipal');
    }

    create() {
        // Creamos la imagen del menú con alpha 0 y la tweenamos para aparecer lentamente
        const bg = this.add.image(608, 320, 'menuPrincipal').setAlpha(0);
        this.tweens.add({
            targets: bg,
            alpha: 1,
            duration: 800,
            ease: 'Power1'
        });

        // ── Stats del jugador ──────────────────────────────────────────
        // Recupera los datos guardados en el registro global del juego
        const horasJuego = this.registry.get('horasJuego') ?? 0;
        const dinero     = this.registry.get('dinero')     ?? 0;

        const horasFormateadas = this.formatearHoras(horasJuego);

        this.add.text(300, 150, `Tiempo: ${horasFormateadas}`, {
            fontSize: '22px', fill: '#f5d442', fontFamily: 'Arial'
        });

        this.add.text(300, 185, `Dinero: €${dinero.toLocaleString()}`, {
            fontSize: '22px', fill: '#f5d442', fontFamily: 'Arial'
        });

        // ── Botones ────────────────────────────────────────────────────
        const botones = [
            { key: 'estrategiaButton',  y: 400, scene: 'EstrategiaScene'   },
            { key: 'mochilaButton',     y: 500, scene: 'MochilaScene'      },
            { key: 'salirButton',       y: 600, scene: null                },  // salir
            { key: 'equipamientoButton',y: 700, scene: 'EquipamientoScene' },
            { key: 'opcionesButton',    y: 800, scene: 'OpcionesScene'     },
        ];

        botones.forEach(({ key, y, scene }) => {
            const btn = this.add.image(608, y, key).setInteractive();

            btn.on('pointerover',  () => btn.setScale(1.05));
            btn.on('pointerout',   () => btn.setScale(1));
            btn.on('pointerdown',  () => {
                if (scene) {
                    this.scene.start(scene);
                } else {
                    this.game.destroy(true);
                }
            });
        });

        // ── Abrir / cerrar con ESPACIO ─────────────────────────────────
        // Guardamos el nombre de la escena que abrió el menú (se recibe en data al lanzarlo)
        const previousScene = this.scene.settings.data?.from;

        this.input.keyboard.on('keydown-SPACE', () => {
            // Ocultamos la imagen con un tween y solo entonces cerramos la escena
            const bg = this.children.getByName('menuPrincipal') || this.add.image(608, 320, 'menuPrincipal');
            this.tweens.add({
                targets: bg,
                alpha: 0,
                duration: 800,
                ease: 'Power1',
                onComplete: () => {
                    this.scene.stop();
                    if (previousScene) {
                        this.scene.resume(previousScene);
                    }
                }
            });
        });
    }

    // Convierte segundos totales → "Xh Ym"
    formatearHoras(segundosTotales) {
        const h = Math.floor(segundosTotales / 3600);
        const m = Math.floor((segundosTotales % 3600) / 60);
        return `${h}h ${m}m`;
    }
}

// Exportación para poder importarla desde game.js
export default MenuPrincipal;