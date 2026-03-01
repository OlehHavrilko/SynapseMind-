import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

const GET_DASHBOARD = gql`
  query GetDashboard {
    me {
      id
      name
      email
      goals {
        id
        title
        progress
      }
      projects {
        id
        name
        status
      }
    }
    learningStats {
      streak
      totalReviews
      masteredConcepts
      learningConcepts
    }
    reviewCards(limit: 5) {
      id
      question
      conceptName
      nextReview
    }
    documents(limit: 5) {
      id
      title
      source
      createdAt
    }
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
};

export default function Dashboard() {
  const { data, loading } = useQuery(GET_DASHBOARD);

  if (loading) return <div className="loading">Loading...</div>;

  const { me, learningStats, reviewCards, documents } = data;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, {me?.name || 'User'}! 👋</h1>
        <p>Here's what's happening with your knowledge today.</p>
      </header>

      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <span className="stat-value">{learningStats?.streak || 0}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <span className="stat-value">{learningStats?.totalReviews || 0}</span>
            <span className="stat-label">Reviews Done</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stat-icon">🧠</div>
          <div className="stat-content">
            <span className="stat-value">{learningStats?.masteredConcepts || 0}</span>
            <span className="stat-label">Mastered</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <span className="stat-value">{documents?.length || 0}</span>
            <span className="stat-label">Documents</span>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <div className="section-header">
            <h2>📝 Due for Review</h2>
            <Link to="/learning" className="section-link">View all</Link>
          </div>
          <div className="card-list">
            {reviewCards?.map((card: any) => (
              <div key={card.id} className="card-item">
                <span className="card-title">{card.conceptName || 'Unknown'}</span>
                <span className="card-subtitle">{card.question.substring(0, 50)}...</span>
              </div>
            ))}
            {!reviewCards?.length && (
              <p className="empty-state">No cards due for review! 🎉</p>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>📄 Recent Documents</h2>
            <Link to="/library" className="section-link">View all</Link>
          </div>
          <div className="card-list">
            {documents?.map((doc: any) => (
              <div key={doc.id} className="card-item">
                <span className="card-title">{doc.title}</span>
                <span className="card-subtitle">{doc.source} • {new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {!documents?.length && (
              <p className="empty-state">No documents yet. Import some content!</p>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>🎯 Your Goals</h2>
          </div>
          <div className="goals-list">
            {me?.goals?.map((goal: any) => (
              <div key={goal.id} className="goal-item">
                <span className="goal-title">{goal.title}</span>
                <div className="goal-progress">
                  <div 
                    className="goal-bar" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
            {!me?.goals?.length && (
              <p className="empty-state">Set some goals to track your progress!</p>
            )}
          </div>
        </section>
      </div>

      <div className="quick-actions">
        <Link to="/synapse" className="action-btn primary">
          🤖 Chat with Synapse
        </Link>
        <Link to="/graph" className="action-btn">
          🧠 View Knowledge Graph
        </Link>
        <Link to="/library" className="action-btn">
          📥 Import Content
        </Link>
      </div>
    </div>
  );
}
