/* Marca de TennisTrack; el texto toma el color actual (modo claro u oscuro). */
export default function LogoTennisTrack({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 80"
      role="img"
      aria-label="TennisTrack Academia"
    >
      <circle
        cx="40"
        cy="40"
        r="26"
        fill="#cbd90a"
        stroke="#5f6d14"
        strokeWidth="5"
      />
      <text
        x="80"
        y="44"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="30"
        letterSpacing="-1"
      >
        TENNISTRACK
      </text>
      <text
        x="81"
        y="64"
        fill="currentColor"
        opacity="0.6"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontSize="11"
        letterSpacing="4"
      >
        ACADEMIA
      </text>
    </svg>
  );
}
