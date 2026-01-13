import { Toaster } from 'react-hot-toast';
import { StoryForm } from './components/StoryForm';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Toaster position="top-center" />

      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Share Your Story
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us your story anonymously and watch it come to life as a short film
          </p>
        </header>

        <main>
          <StoryForm />
        </main>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <div className="space-y-2">
            <p>✨ Every story deserves to be told</p>
            <p className="text-xs">
              Your submission is completely anonymous and secure. We respect your privacy.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

