export type AppPage = 'home' | 'tasks' | 'calendar' | 'profile'

interface BottomNavProps {
  active: AppPage
  onHome: () => void
  onTasks: () => void
  onCalendar: () => void
  onProfile: () => void
  onAdd: () => void
}

function BottomNav({
  active,
  onHome,
  onTasks,
  onCalendar,
  onProfile,
  onAdd,
}: BottomNavProps) {
  function itemClass(page: AppPage) {
    return active === page
      ? 'bottom-nav-item bottom-nav-item--active'
      : 'bottom-nav-item'
  }

  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={itemClass('home')}
        onClick={onHome}
        aria-current={active === 'home' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Главная</span>
      </button>

      <button
        type="button"
        className={itemClass('tasks')}
        onClick={onTasks}
        aria-current={active === 'tasks' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M8 10.5l2 2 3.5-4M8 16h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Задачи</span>
      </button>

      <button
        type="button"
        className="bottom-nav-fab"
        onClick={onAdd}
        aria-label="Добавить задачу"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            fill="none"
            stroke="var(--bg)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className={itemClass('calendar')}
        onClick={onCalendar}
        aria-current={active === 'calendar' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M4 9.5h16M8 3v3.5M16 3v3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span>Календарь</span>
      </button>

      <button
        type="button"
        className={itemClass('profile')}
        onClick={onProfile}
        aria-current={active === 'profile' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="12"
            cy="8.5"
            r="3.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M5.5 20c1.2-3.6 4-5.5 6.5-5.5s5.3 1.9 6.5 5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span>Профиль</span>
      </button>
    </nav>
  )
}

export default BottomNav
