import React, { useState, useRef, useEffect } from 'react';
import { CharacterCounter } from './CharacterCounter';
import { useStorySubmit } from '../hooks/useStorySubmit';

const MAX_LENGTH = 50000;
const MIN_LENGTH = 1;

export const StoryForm: React.FC = () => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { submit, isSubmitting } = useStorySubmit();

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim().length < MIN_LENGTH) {
      return;
    }

    if (content.length > MAX_LENGTH) {
      return;
    }

    try {
      await submit({ content: content.trim() });
      setContent('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const isValid = content.trim().length >= MIN_LENGTH && content.length <= MAX_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="space-y-4">
        <label htmlFor="story" className="block text-lg font-medium text-gray-700">
          Your Story
        </label>

        <textarea
          ref={textareaRef}
          id="story"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your story anonymously... Tell us anything you'd like to see turned into a short film."
          className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none min-h-[200px] max-h-[600px]"
          disabled={isSubmitting}
          rows={8}
        />

        <CharacterCounter current={content.length} max={MAX_LENGTH} />
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all duration-200 ${
          isValid && !isSubmitting
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Your Story'
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Your story is completely anonymous. We don't collect any personal information.
      </p>
    </form>
  );
};

