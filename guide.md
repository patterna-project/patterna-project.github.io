# Patterna dokumentácia

[← Späť na hlavný README](README.md)

Podrobná dokumentácia (architektúra, implementácia, výpočtové metódy, návod na použitie, FAQ) je dostupná na Overleafi:

**[https://www.overleaf.com/read/czbdxjrnbfqz](https://www.overleaf.com/read/czbdxjrnbfqz)**

---

## Rýchly prehľad

### Hlavné funkcie

- **Matica podobností** – Kosínusová podobnosť medzi textami vzorov (TF-IDF / Universal Sentence Encoder)
- **Interaktívny graf** – Vizualizácia vzťahov medzi vzormi (D3.js, force-directed)
- **Štatistiky** – Priemerná podobnosť, medián, smerodajná odchýlka, top spojenia
- **Generovanie sekvencií** – Markovov rozhodovací proces (MDP) s konfigurovateľnými odmenami
- **Vynútený štart / cieľ** – Fixný štartovací alebo cieľový vzor
- **Referenčný bonus** – Zvýšenie pravdepodobnosti prechodu pri explicitnom odkaze v texte
- **Sentiment analýza** – Úprava odmien podľa emocionálneho tónu textu
- **Tmavý režim** – Prepínanie medzi svetlým a tmavým vzhľadom
- **Dvojjazyčné rozhranie** – Slovenčina / Angličtina
- **Export** – TXT, PDF, CSV, PNG, alebo kompletný ZIP so všetkými dátami

### Rýchly štart

1. Vyberte vzory z katalógu (alebo nahrajte vlastný)
2. Upravte parametre (γ, odmeny, ε) alebo zapnite pokročilé funkcie (IDF, sentiment, referenčný bonus, USE)
3. Kliknite na "Generovať sekvenciu"
4. Pretiahnutím myšou zmeňte poradie vzorov v sekvencii
5. Exportujte výsledky alebo získajte AI hodnotenie sekvencie

---

## Technológie

| Technológia | Účel |
|-------------|------|
| TensorFlow.js | Universal Sentence Encoder (USE) |
| D3.js | Interaktívny graf vzťahov |
| Tailwind CSS | Moderné responzívne UI |
| JSZip | Export PRO (ZIP archív) |
| jsPDF / html2canvas | Export do PDF a PNG |
| Tally | Formulár spätnej väzby |

---

**Inštitúcia:** FIIT STU Bratislava

---

© 2026 FIIT STU – [Fakulta informatiky a informačných technológií](https://www.fiit.stuba.sk/)
