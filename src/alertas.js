// Compatibilidad temporal: los módulos vanilla todavía importan el semáforo y
// la sincronización desde aquí. La lógica vive en datos/alertas.js y este
// puente se retira en la Fase 5.
export * from './datos/alertas.js';
