import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import './Learning.css';

const GET_REVIEW_SESSION = gql`
  query GetReviewSession {
    reviewCards(limit: 20) {
      id
      question
      answer
      conceptName
      difficulty
    }
    learningStats {
      streak
      totalReviews
      masteredCards
    }
  }
`;

const COMPLETE_REVIEW = gql`
  mutation CompleteReview($input: CompleteReviewInput!) {
    completeReview(input: $input) {
      id
      nextReview
    }
  }
`;

type Quality = 0 | 3 | 4 | 5;

export default function Learning() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data, loading, refetch } = useQuery(GET_REVIEW_SESSION);
  const [completeReview] = useMutation(COMPLETE_REVIEW);

  const cards = data?.reviewCards || [];
  const currentCard = cards[currentIndex];
  const stats = data?.learningStats;

  const handleReview = async (quality: Quality) => {
    if (!currentCard) return;

    await completeReview({
      variables: {
        input: {
          cardId: currentCard.id,
          quality,
        },
      },
    });

    setShowAnswer(false);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      refetch();
      setCurrentIndex(0);
    }
  };

  if (loading) return <div className="loading">Loading reviews...</div>;

  return (
    <div className="learning-page">
      <header className="learning-header">
        <h1>🎯 Learning</h1>
        <div className="stats-row">
          <span>🔥 {stats?.streak || 0} day streak</span>
          <span>✓ {stats?.totalReviews || 0} reviews</span>
          <span>⭐ {stats?.masteredCards || 0} mastered</span>
        </div>
      </header>

      {cards.length > 0 ? (
        <div className="review-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
          
          <div className="card-count">
            {currentIndex + 1} / {cards.length}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flashcard"
            >
              <div className="card-concept">{currentCard?.conceptName}</div>
              <div className="card-question">{currentCard?.question}</div>
              
              {showAnswer && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-answer"
                >
                  {currentCard?.answer}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="card-actions">
            {!showAnswer ? (
              <button className="btn-show" onClick={() => setShowAnswer(true)}>
                Show Answer
              </button>
            ) : (
              <div className="review-buttons">
                <button 
                  className="btn-again"
                  onClick={() => handleReview(0)}
                >
                  Again
                </button>
                <button 
                  className="btn-hard"
                  onClick={() => handleReview(3)}
                >
                  Hard
                </button>
                <button 
                  className="btn-good"
                  onClick={() => handleReview(4)}
                >
                  Good
                </button>
                <button 
                  className="btn-easy"
                  onClick={() => handleReview(5)}
                >
                  Easy
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="no-reviews">
          <div className="celebration">🎉</div>
          <h2>All caught up!</h2>
          <p>No more cards to review right now.</p>
          <p>Come back later for more practice.</p>
        </div>
      )}
    </div>
  );
}
