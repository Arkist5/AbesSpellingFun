import { useNavigate } from '../router';

export function RootHomePage() {
  const navigate = useNavigate();

  return (
    <main className="root-home">
      <header className="root-home__header">
        <p className="root-home__eyebrow">Welcome back</p>
        <h1>Abe's Spelling & Math Fun</h1>
        <p>What do you want to play today?</p>
      </header>

      <section className="root-home__choices">
        <button
          type="button"
          className="root-home__tile root-home__tile--spelling"
          onClick={() => navigate('/spelling')}
        >
          <div className="root-home__tile-label">Spelling</div>
          <div className="root-home__tile-subtitle">Words, sounds, and games</div>
        </button>

        <button
          type="button"
          className="root-home__tile root-home__tile--math"
          onClick={() => navigate('/math')}
        >
          <div className="root-home__tile-label">Math</div>
          <div className="root-home__tile-subtitle">Numbers and flashcards</div>
        </button>
      </section>
    </main>
  );
}
