import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>Temporal</h1>
  </StrictMode>,
);
