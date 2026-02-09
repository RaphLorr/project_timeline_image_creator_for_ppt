import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import 'vis-timeline/styles/vis-timeline-graph2d.min.css'
import './timeline.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
