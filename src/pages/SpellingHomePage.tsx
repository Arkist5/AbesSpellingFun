import { useNavigate } from '../router';

export function SpellingHomePage() {
  const navigate = useNavigate();

  return (
    <main className="home-stub home-stub--spelling">
      <header className="home-stub__header">
        <button
          type="button"
          className="home-stub__back"
          onClick={() => navigate('/')}
        >
          ← Back to Main Menu
        </button>
        <div>
          <p className="home-stub__eyebrow">Spelling zone</p>
          <h1>Spelling Home</h1>
          <p className="home-stub__lede">Word lists and new games will live here soon.</p>
        </div>
      </header>

      <section className="home-stub__card">
        <p>We removed the old spelling game buttons so Ava always starts here first.</p>
        <p>New adventures are coming in future tasks.</p>
      </section>
    </main>
  );
}
