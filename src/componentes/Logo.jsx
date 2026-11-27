export function Logo({ className = 'h-9 w-9' }) {
  // Logotipo decorativo: el texto «AgriMind AI» ya está presente junto a él en la interfaz.
  return <img src="/agrimind_logo.svg" alt="" aria-hidden="true" className={`object-contain ${className}`} />;
}
