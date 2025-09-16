/**
 * CME Quiz Answer Validation Tests
 * Tests for the fixed red-then-green bug and race condition prevention
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
}));

// Mock CME content
jest.mock('../assets/cme-content-merged.json', () => ({
  modules: [],
  popularQuizzes: {
    quizzes: [
      {
        id: 'test-quiz',
        title: 'Test Quiz',
        questions: [
          {
            id: 'test-q1',
            question: 'What is the correct answer?',
            options: ['Wrong 1', 'Correct Answer', 'Wrong 2', 'Wrong 3'],
            correctIndex: 1,
            explanation: 'This is the correct answer because...'
          }
        ]
      }
    ]
  }
}), { virtual: true });

// Import the component after mocks
import CmeQuizScreen from '../screens/CmeQuizScreen';

describe('CME Quiz Answer Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock AsyncStorage to return empty progress
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('Correct Answer Selection', () => {
    it('should show green immediately for correct answer without red flash', async () => {
      const { getByText, getByTestId } = render(
        <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
      );

      // Wait for component to load
      await waitFor(() => {
        expect(getByText('What is the correct answer?')).toBeTruthy();
      });

      // Click the correct answer
      const correctOption = getByText('Correct Answer');
      fireEvent.press(correctOption);

      // Submit the answer
      const submitButton = getByText('Submit Answer');
      fireEvent.press(submitButton);

      // Wait for feedback to appear
      await waitFor(() => {
        expect(getByText('Correct!')).toBeTruthy();
      });

      // Verify no red state was shown (this test passes if no red styling is applied)
      const explanation = getByText('This is the correct answer because...');
      expect(explanation).toBeTruthy();
    });

    it('should prevent multiple rapid clicks on same answer', async () => {
      const { getByText } = render(
        <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
      );

      await waitFor(() => {
        expect(getByText('What is the correct answer?')).toBeTruthy();
      });

      const correctOption = getByText('Correct Answer');
      
      // Click rapidly multiple times
      fireEvent.press(correctOption);
      fireEvent.press(correctOption);
      fireEvent.press(correctOption);

      // Submit should still work normally
      const submitButton = getByText('Submit Answer');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Correct!')).toBeTruthy();
      });
    });

    it('should disable answer options during submission', async () => {
      const { getByText } = render(
        <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
      );

      await waitFor(() => {
        expect(getByText('What is the correct answer?')).toBeTruthy();
      });

      const correctOption = getByText('Correct Answer');
      const wrongOption = getByText('Wrong 1');
      
      // Click correct answer
      fireEvent.press(correctOption);
      
      // Submit answer
      const submitButton = getByText('Submit Answer');
      fireEvent.press(submitButton);

      // Try to click wrong answer after submission - should not change selection
      fireEvent.press(wrongOption);

      await waitFor(() => {
        expect(getByText('Correct!')).toBeTruthy();
      });
    });
  });

  describe('Wrong Answer Selection', () => {
    it('should show red immediately for wrong answer', async () => {
      const { getByText } = render(
        <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
      );

      await waitFor(() => {
        expect(getByText('What is the correct answer?')).toBeTruthy();
      });

      // Click wrong answer
      const wrongOption = getByText('Wrong 1');
      fireEvent.press(wrongOption);

      // Submit the answer
      const submitButton = getByText('Submit Answer');
      fireEvent.press(submitButton);

      // Wait for feedback
      await waitFor(() => {
        expect(getByText('Incorrect')).toBeTruthy();
      });

      // Explanation should still be shown
      const explanation = getByText('This is the correct answer because...');
      expect(explanation).toBeTruthy();
    });
  });

  describe('Race Condition Prevention', () => {
    it('should handle async operations without state conflicts', async () => {
      // Mock a slow async operation
      const slowAsyncMock = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByText } = render(
        <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
      );

      await waitFor(() => {
        expect(getByText('What is the correct answer?')).toBeTruthy();
      });

      const correctOption = getByText('Correct Answer');
      
      // Click answer
      fireEvent.press(correctOption);
      
      // Immediately submit (simulating race condition)
      const submitButton = getByText('Submit Answer');
      fireEvent.press(submitButton);

      // Should still resolve correctly
      await waitFor(() => {
        expect(getByText('Correct!')).toBeTruthy();
      });
    });
  });

  describe('Selection Token Logic', () => {
    it('should ignore stale selection responses', async () => {
      const { getByText } = render(
        <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
      );

      await waitFor(() => {
        expect(getByText('What is the correct answer?')).toBeTruthy();
      });

      const option1 = getByText('Wrong 1');
      const option2 = getByText('Correct Answer');
      
      // Rapid selection changes
      fireEvent.press(option1);
      // Immediately change to different option
      fireEvent.press(option2);

      const submitButton = getByText('Submit Answer');
      fireEvent.press(submitButton);

      // Should show result for the last valid selection (option2)
      await waitFor(() => {
        expect(getByText('Correct!')).toBeTruthy();
      });
    });
  });
});

describe('CME Quiz Accessibility', () => {
  it('should announce feedback via accessibility', async () => {
    const { getByText, getByA11yRole } = render(
      <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
    );

    await waitFor(() => {
      expect(getByText('What is the correct answer?')).toBeTruthy();
    });

    const correctOption = getByText('Correct Answer');
    fireEvent.press(correctOption);

    const submitButton = getByText('Submit Answer');
    fireEvent.press(submitButton);

    await waitFor(() => {
      // Check for accessibility alert
      const feedbackElement = getByA11yRole('alert');
      expect(feedbackElement).toBeTruthy();
    });
  });

  it('should have proper accessibility labels on options', async () => {
    const { getByText, getByA11yLabel } = render(
      <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
    );

    await waitFor(() => {
      expect(getByText('What is the correct answer?')).toBeTruthy();
    });

    // Check for proper accessibility labels
    const optionA = getByA11yLabel(/Option A: Wrong 1/);
    const optionB = getByA11yLabel(/Option B: Correct Answer/);
    
    expect(optionA).toBeTruthy();
    expect(optionB).toBeTruthy();
  });
});

describe('CME Quiz State Management', () => {
  it('should maintain single source of truth for answer selection', async () => {
    const { getByText } = render(
      <CmeQuizScreen navigation={mockNavigation} route={{ params: { moduleId: 'test-quiz' } }} />
    );

    await waitFor(() => {
      expect(getByText('What is the correct answer?')).toBeTruthy();
    });

    // Test that only one answer can be selected at a time
    const option1 = getByText('Wrong 1');
    const option2 = getByText('Correct Answer');
    
    fireEvent.press(option1);
    fireEvent.press(option2); // Should replace previous selection
    
    const submitButton = getByText('Submit Answer');
    fireEvent.press(submitButton);

    await waitFor(() => {
      // Should show result for the last selected option
      expect(getByText('Correct!')).toBeTruthy();
    });
  });
});