interface FocusIconProps {
  active: boolean
  size: number
}

// Фирменная иконка фокуса — статичные кольца, по ним вращаются короткие
// штрихи-орбиты. В неактивном состоянии (задача ещё не выбрана) кольца
// притушены; когда фокус выбран — ярче, а центр начинает пульсировать
// волнами, расходящимися сквозь все три кольца.
function FocusIcon({ active, size }: FocusIconProps) {
  const outerOpacity = active ? 0.35 : 0.15
  const middleOpacity = active ? 0.45 : 0.2
  const innerOpacity = active ? 0.55 : 0.25

  return (
    <svg
      className="focus-icon"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="5"
        fill="url(#focus-glow)"
        opacity={active ? 1 : 0.4}
      />

      <g className="focus-icon-outer">
        <circle
          cx="20"
          cy="20"
          r="20"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1"
          opacity={outerOpacity}
        />
        <path
          d="M24.948,39.380 A20,20 0 0,1 15.052,39.380"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>

      <g className="focus-icon-middle">
        <circle
          cx="20"
          cy="20"
          r="14"
          fill="none"
          stroke="var(--gold-light)"
          strokeWidth="1"
          opacity={middleOpacity}
        />
        <path
          d="M24.895,33.117 A14,14 0 0,1 15.105,33.117"
          fill="none"
          stroke="var(--gold-light)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>

      <g className="focus-icon-inner">
        <circle
          cx="20"
          cy="20"
          r="8"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1"
          opacity={innerOpacity}
        />
        <path
          d="M24.681,26.488 A8,8 0 0,1 15.319,26.488"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>

      {active && (
        <>
          <circle
            className="focus-icon-wave"
            cx="20"
            cy="20"
            r="3.5"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1"
          />
          <circle
            className="focus-icon-wave focus-icon-wave--delayed"
            cx="20"
            cy="20"
            r="3.5"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1"
          />
        </>
      )}

      <circle
        cx="20"
        cy="20"
        r="3.5"
        fill="var(--hot)"
        className={active ? 'focus-icon-center focus-icon-center--pulse' : 'focus-icon-center'}
      />
    </svg>
  )
}

export default FocusIcon
