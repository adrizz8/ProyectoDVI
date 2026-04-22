/**
 * ITEM_TYPES
 * ----------
 * Diccionario de todos los objetos que existen en el juego.
 **/
export const ITEM_TYPES = {
    'pincho_tortilla': {
        id: 'pincho_tortilla',
        name: 'Pincho de Tortilla',
        type: 'consumable',
        heal: 50,
        description: 'Recupera 50 HP (Energía vital de la cafetería).'
    },
    'monster': {
        id: 'monster',
        name: 'Monster',
        type: 'consumable',
        recMp: 20,
        description: 'Restaura 20 MP (Concentración extrema).'
    },
    'menu_dia': {
        id: 'menu_dia',
        name: 'Menú del Día',
        type: 'consumable',
        heal: 100,
        recMp: 50,
        description: 'Restaura 100 HP y 50 MP (El banquete del estudiante).'
    },
    'tinto_verano': {
        id: 'tinto_verano',
        name: 'Tinto de Verano',
        type: 'consumable',
        buffAtt: 15,
        description: 'Aumenta el ataque en 15 (Efecto euforia).'
    },
    'palmera_chocolate': {
        id: 'palmera_chocolate',
        name: 'Palmera de Chocolate',
        type: 'consumable',
        buffDef: 10,
        description: 'Aumenta la defensa en 10 (Capa de grasa protectora).'
    },
    'cafe': {
        id: 'cafe',
        name: 'Café',
        type: 'consumable',
        buffSpd: 10,
        description: 'Aumenta la velocidad en 10 (Cafeína directa).'
    },
    'amuleto_delegacion': {
        id: 'amuleto_delegacion',
        name: 'Amuleto de Delegación',
        type: 'consumable',
        buffLck: 5,
        description: 'Aumenta la suerte en 5 (El carisma del delegado).'
    },
    'cigarro': {
        id: 'cigarro',
        name: 'Cigarro',
        type: 'consumable',
        statusRecovery: true,
        description: 'Elimina estado anómalo (Reduce el estrés).'
    },
    'convalidacion_directa': {
        id: 'convalidacion_directa',
        name: 'Convalidación Directa',
        type: 'consumable',
        levelUp: true,
        description: 'Suma un nivel al personaje (Saltarse una asignatura).'
    },
    'teclado_mecanico': {
        id: 'teclado_mecanico',
        name: 'Teclado Mecánico',
        type: 'equipment',
        bonusStats: { damage: 5 },
        description: 'Arma periférica +5 daño (Switches Blue para más ruido).'
    },
    'sudadera_facu': {
        id: 'sudadera_facu',
        name: 'Sudadera de la Facu',
        type: 'equipment',
        bonusStats: { defense: 5 },
        description: 'Prenda reglamentaria que ofrece +5 defensa.'
    },
    'llave_lab': {
        id: 'llave_lab',
        name: 'Llave del Lab 1.4',
        type: 'key',
        description: 'Abre la puerta del laboratorio de sistemas.'
    },
    'monster_dorada': {
        id: 'monster_dorada',
        name: 'Monster Dorada',
        type: 'key_item',
        description: 'Un objeto legendario.'
    },
    'pincho_tortilla_viejo': {
        id: 'pincho_tortilla_viejo',
        name: 'Pincho Frío',
        type: 'consumable',
        heal: 30,
        description: 'Un pincho que lleva demasiado tiempo en la barra. Cura 30 HP.'
    },
    'llave_planta1': {
        id: 'llave_planta1',
        name: 'Llave de la Planta 1',
        type: 'key',
        description: 'Permite entrar en las aulas de la Planta 1.'
    },
    'regla_lhopital': {
        id: 'regla_lhopital',
        name: 'Regla de L\'Hôpital',
        type: 'consumable',
        statusRecovery: true,
        description: 'Cuando te aturdan y pierdes un turno de ataque, úsala para quitarte el efecto.'
    },
    'compilador_amigable': {
        id: 'compilador_amigable',
        name: 'Compilador Amigable',
        type: 'consumable',
        recMp: 20,
        description: 'Recupera 20 de Energía. Te lo dio el NPC de FP.'
    },
    'puntero_null': {
        id: 'puntero_null',
        name: 'Puntero a NULL',
        type: 'consumable',
        buffDef: 0,
        disable_enemy: true,
        description: 'Arma arrojadiza: desactiva las habilidades del enemigo un turno.'
    },
    'apuntes_trivial': {
        id: 'apuntes_trivial',
        name: 'Apuntes de lo Trivial',
        type: 'consumable',
        disable_enemy: true,
        description: 'El enemigo se queda parado un turno intentando comprender por qué el ataque es trivial.'
    },
    'cerveza': {
        id: 'cerveza',
        name: 'Cerveza',
        type: 'consumable',
        heal: 20,
        recMp: 10,
        description: 'Una Mahou bien fría. Recupera 20 HP y 10 MP.'
    },
    'apuntes_ansi': {
        id: 'apuntes_ansi',
        name: 'Apuntes de Ansiedad',
        type: 'consumable',
        recMp: 15,
        description: 'Apuntes ilegibles. Restauran 15 Energía por el esfuerzo.'
    }
};
