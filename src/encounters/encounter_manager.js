export default class EncounterManager {
    constructor() {
        this.distanciaAcumulada = 0;
        this.pasosParaGracia = 0;
        this.pixelsPorPaso = 128;
        this.probabilidad = 0.1;
        this.graciaMinima = 4;
    }

    actualizarDistancia(pixelesMovidos, enZonaDeHierba = true) {
        if (!enZonaDeHierba || pixelesMovidos <= 0) return false;

        this.distanciaAcumulada += pixelesMovidos;

        if (this.distanciaAcumulada >= this.pixelsPorPaso) {
            this.distanciaAcumulada = 0;
            return this.chequearEncuentro();
        }

        return false;
    }

    chequearEncuentro() {
        // Si aún estamos en periodo de gracia, restamos un paso y salimos
        console.log("Chequeando encuentro");
        if (this.pasosParaGracia > 0) {
            this.pasosParaGracia--;
            return false;
        }

        console.log("Tirando dados");
        // Tirada de dados
        if (Math.random() < this.probabilidad) {
            this.pasosParaGracia = this.graciaMinima;
            return true;
        }

        return false;
    }
}