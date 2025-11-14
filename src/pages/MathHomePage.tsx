import { useNavigate } from '../router';

export function MathHomePage() {
  const navigate = useNavigate();

  return (
    <main className="home-stub home-stub--math">
      <header className="home-stub__header">
        <button
          type="button"
          className="home-stub__back"
          onClick={() => navigate('/')}
        >
          ← Back to Main Menu
        </button>
        <div>
          <p className="home-stub__eyebrow">Math zone</p>
          <h1>Math Home</h1>
          <p className="home-stub__lede">Flashcards and other challenges will arrive here.</p>
        </div>
      </header>

      <section className="home-stub__card">
        <p>For Task 1 we are just setting up the navigation split.</p>
        <p>A dedicated Math home experience will be fleshed out next.</p>
      </section>
    </main>
  );
}
