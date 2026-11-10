import styles from './CoverArt.module.css';

const DOTS = [0, 1, 2, 3, 4, 5];

function Pattern({ seed }: { seed: number }) {
  switch (seed % 4) {
    case 0:
      return (
        <>
          <circle cx={80 + ((seed * 9) % 60)} cy="30" r="70" fill="#fff" fillOpacity=".10" />
          <circle cx="250" cy="120" r="46" fill="#000" fillOpacity=".10" />
        </>
      );
    case 1:
      return (
        <>
          <path d="M0 132 L120 0 H170 L50 132Z" fill="#fff" fillOpacity=".10" />
          <path d="M150 132 L270 0 H300 V40 L210 132Z" fill="#000" fillOpacity=".10" />
        </>
      );
    case 2:
      return (
        <>
          <rect x="170" y="-30" width="120" height="120" rx="60" fill="#fff" fillOpacity=".12" />
          <rect
            x="40"
            y="70"
            width="90"
            height="90"
            rx="20"
            transform="rotate(18 85 115)"
            fill="#000"
            fillOpacity=".10"
          />
        </>
      );
    default:
      return (
        <>
          <g fill="#fff" fillOpacity=".14">
            {DOTS.map((dot) => (
              <circle key={dot} cx={180 + dot * 22} cy={20 + (dot % 2) * 22} r="7" />
            ))}
          </g>
          <path d="M0 100 Q 150 40 300 110 V132 H0Z" fill="#000" fillOpacity=".12" />
        </>
      );
  }
}

/** Geometric cover drawn from a merchant's brand colour. */
export function CoverArt({ color, seed }: { color: string; seed: number }) {
  return (
    <svg
      className={styles.art}
      viewBox="0 0 300 132"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="300" height="132" fill={color} />
      <Pattern seed={seed} />
    </svg>
  );
}

/** The larger artwork on the deal page. The background shows through from the cover. */
export function CoverArtLarge() {
  return (
    <svg
      className={styles.art}
      viewBox="0 0 760 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <circle cx="560" cy="170" r="190" fill="#fff" fillOpacity=".10" />
      <circle
        cx="560"
        cy="170"
        r="128"
        fill="none"
        stroke="#fff"
        strokeOpacity=".22"
        strokeWidth="2"
        strokeDasharray="4 10"
      />
      <g fill="#fff" fillOpacity=".16">
        <circle cx="520" cy="130" r="16" />
        <circle cx="610" cy="150" r="12" />
        <circle cx="560" cy="220" r="18" />
        <circle cx="500" cy="210" r="10" />
        <circle cx="625" cy="225" r="14" />
      </g>
      <path d="M0 420 L250 150 H330 L80 420Z" fill="#000" fillOpacity=".10" />
      <circle cx="90" cy="60" r="120" fill="#000" fillOpacity=".08" />
    </svg>
  );
}
