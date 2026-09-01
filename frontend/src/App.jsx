import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TodoListPage from './pages/TodoListPage';
import TodoDetailPage from './pages/TodoDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Multi-page routing using React Router v6
// Page 1: /todos — Todo list with all features
// Page 2: /todo?id=<id> — Single todo detail view
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to todos list */}
        <Route path="/" element={<Navigate to="/todos" replace />} />

        {/* Page 1: Todo List */}
        <Route path="/todos" element={<TodoListPage />} />

        {/* Page 2: Single Todo Detail — receives ?id= query param */}
        <Route path="/todo" element={<TodoDetailPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
