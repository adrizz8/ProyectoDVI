class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }   



    create() {
        // Añadimos listener de teclado antes de cambiar de escena. Si GameScene se usa en el futuro,
        // permitirá abrir el menú principal (aunque normalmente se inicia un nivel inmediatamente).
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.pause();
            this.scene.launch('MenuPrincipal');
        });

        // Iniciar la escena del nivel correcto (la key definida en Level.js es 'level').
        this.scene.start('level');
    }

}