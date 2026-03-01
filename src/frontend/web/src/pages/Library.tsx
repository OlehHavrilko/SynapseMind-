import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import './Library.css';

const GET_DOCUMENTS = gql`
  query GetDocuments($limit: Int, $offset: Int) {
    documents(limit: $limit, offset: $offset) {
      id
      title
      content
      source
      sourceUrl
      summary
      isProcessed
      tags
      wordCount
      readingTime
      createdAt
    }
  }
`;

const IMPORT_DOCUMENT = gql`
  mutation ImportDocument($input: CreateDocumentInput!) {
    importDocument(input: $input) {
      id
      title
      source
    }
  }
`;

const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

const sourceIcons: Record<string, string> = {
  web: '🌐',
  youtube: '📺',
  podcast: '🎙️',
  pdf: '📄',
  ebook: '📚',
  notion: '📝',
  manual: '✍️',
};

export default function Library() {
  const [importUrl, setImportUrl] = useState('');
  const { data, loading, refetch } = useQuery(GET_DOCUMENTS, {
    variables: { limit: 50, offset: 0 },
  });

  const [importDocument] = useMutation(IMPORT_DOCUMENT, {
    onCompleted: () => {
      setImportUrl('');
      refetch();
    },
  });

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    onCompleted: () => refetch(),
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    importDocument({
      variables: {
        input: {
          title: importUrl,
          sourceUrl: importUrl,
          source: 'WEB',
        },
      },
    });
  };

  if (loading) return <div className="loading">Loading library...</div>;

  return (
    <div className="library-page">
      <header className="library-header">
        <h1>📚 Library</h1>
        <form onSubmit={handleImport} className="import-form">
          <input
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="Enter URL to import..."
          />
          <button type="submit">Import</button>
        </form>
      </header>

      <div className="documents-grid">
        {data?.documents?.map((doc: any) => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <span className="document-icon">{sourceIcons[doc.source] || '📄'}</span>
              <button
                className="delete-btn"
                onClick={() => deleteDocument({ variables: { id: doc.id } })}
              >
                ×
              </button>
            </div>
            <h3 className="document-title">{doc.title}</h3>
            <p className="document-summary">
              {doc.summary || doc.content?.substring(0, 100) || 'No content yet'}
            </p>
            <div className="document-meta">
              <span className="tag">{doc.source}</span>
              {doc.wordCount && <span>{doc.readingTime} min read</span>}
              {doc.isProcessed && <span className="processed">✓ Processed</span>}
            </div>
          </div>
        ))}
      </div>

      {!data?.documents?.length && (
        <div className="empty-library">
          <p>Your library is empty.</p>
          <p>Import some content to get started!</p>
        </div>
      )}
    </div>
  );
}
