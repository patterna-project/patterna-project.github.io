<p align="center">
  <img src="assets/images/logo.png" alt="Patterna Logo" width="200">
</p>

<p align="center">
  <a href="https://patterna-project-github-io.vercel.app">
    <img src="https://img.shields.io/badge/live_demo-4f46e5?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
  </a>
  <a href="https://tally.so/r/Y5rWkB">
    <img src="https://img.shields.io/badge/feedback-16a34a?style=for-the-badge&logo=tally&logoColor=white" alt="Feedback">
  </a>
  <a href="https://www.fiit.stuba.sk/">
    <img src="https://img.shields.io/badge/bachelor's_thesis-8b5cf6?style=for-the-badge&logo=academia&logoColor=white" alt="Bachelor's Thesis">
  </a>
</p>

A web application for generating optimal pattern sequences using **Markov Decision Process (MDP)** and text similarity analysis.

---

## Features

-  **Similarity Matrix** – Cosine similarity between pattern descriptions (TF‑IDF / Universal Sentence Encoder)
-  **Interactive Graph** – Force‑directed visualization of pattern relationships
-  **Statistics** – Average similarity, median, standard deviation, top connections
-  **Goal‑driven Sequencing** – Markov Decision Process (MDP) with configurable rewards
-  **Forced Start / Goal** – Pin specific patterns as start or goal
-  **Reference Bonus** – Boost transitions when one pattern mentions another
-  **Sentiment Analysis** – Adjust rewards based on emotional tone
-  **Dark Mode** – Toggle between light and dark themes
- 🇸🇰 / 🇬🇧 **Bilingual UI** – Slovak and English
-  **Export** – TXT, PDF, CSV, PNG, or full PRO ZIP with all data

---

## Quick Start

1. **Select patterns** from the catalog (Coplien & Harrison or upload your own)
2. **Adjust parameters** (γ, rewards, ε) or enable advanced features (IDF, sentiment, reference bonus, USE)
3. **Click "Generate Sequence"** – the algorithm selects a goal and builds a path
4. **Drag & drop** to reorder the sequence manually
5. **Export** results or get an **AI evaluation** of the sequence

> 💡 The goal is selected from the top 30% of patterns by total similarity, with probability proportional to variance – favoring specific, non‑generic patterns.

---

## Technologies

| Technology | Purpose |
|------------|---------|
| **TensorFlow.js** | Universal Sentence Encoder (USE) for semantic similarity |
| **D3.js** | Force‑directed graph visualization |
| **Tailwind CSS** | Modern, responsive UI |
| **JSZip** | PRO export – all data bundled in a ZIP |
| **jsPDF / html2canvas** | PDF and PNG export |
| **Tally** | Feedback form (embedded modal) |

---

## Pattern texts

Patterna includes pattern texts for educational purposes only:

| Source | Citation |
|--------|---------|
| **Scrum Patterns** | *A Scrum Book: The Spirit of the Game* (2019) – Pragmatic Bookshelf |
| **Coplien & Harrison** | *Organizational Patterns of Agile Software Development* (2004) – Pearson Prentice Hall |
| **GoF Patterns** | *Design Patterns: Elements of Reusable Object-Oriented Software* (1994) – Addison-Wesley |
 
For any other use, please refer to the original sources.

---

© 2026 FIIT STU – [Faculty of Informatics and Information Technologies](https://www.fiit.stuba.sk/), Slovak University of Technology in Bratislava
