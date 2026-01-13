import { useState } from 'react';
import { submitStory, SubmitStoryRequest } from '../api/stories';
import toast from 'react-hot-toast';

export const useStorySubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (data: SubmitStoryRequest) => {
    setIsSubmitting(true);

    try {
      const result = await submitStory(data);
      toast.success('Story submitted successfully! 🎉');
      return result;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to submit story. Please try again.');
      } else {
        toast.error('Failed to submit story. Please try again.');
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
};

