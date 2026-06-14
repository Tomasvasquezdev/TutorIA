// ── Logo.jsx ── Isotipo de TutorIA (placeholder genérico) ──
// SVG de tres rombos apilados (estilo del design system de Stitch).
// Es un placeholder: cuando llegue el logo real, se reemplaza este SVG.
// Recibe tamaño y color por props para reutilizarlo en sidebar, login, etc.

export default function Logo({ size = 28, color = 'currentColor', className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
        </svg>
    );
}
