// function/tutorial.js

document.addEventListener('DOMContentLoaded', function() {
    const tutorialBtn = document.getElementById('tutorialBtn');
    if (!tutorialBtn) return;

    // Pomocná funkcia na získanie prekladov
    function getT() {
        return (window.translations && window.translations[window.currentLanguage]) 
            ? window.translations[window.currentLanguage] 
            : (window.translations ? window.translations.sk : null);
    }

    function getTutorialSteps() {
        const t = getT();
        if (!t) return [];

        const steps = [];

        steps.push({
            element: '#catalogButtonsContainer',
            title: '🎯 ' + (t.tutorialStep1Title || 'Výber katalógu'),
            intro: t.tutorialStep1Intro || 'Tu si môžete vybrať predvolený katalóg (Coplien & Harrison) alebo nahrať vlastný katalóg vzorov.'
        });
        steps.push({
            element: '#patternCheckboxes',
            title: '📋 ' + (t.tutorialStep2Title || 'Výber vzorov'),
            intro: t.tutorialStep2Intro || 'Zaškrtnite vzory, ktoré chcete analyzovať. Môžete vyhľadávať a vybrať viacero vzorov naraz.'
        });
        steps.push({
            element: '#generateBtn',
            title: '⚙️ ' + (t.tutorialStep3Title || 'Generovanie sekvencie'),
            intro: t.tutorialStep3Intro || 'Po výbere vzorov kliknite na tlačidlo "Generovať sekvenciu". Spustí sa výpočet podobnosti a Markovov rozhodovací proces.'
        });
        steps.push({
            element: '#paramsContainer',
            title: '🔧 ' + (t.tutorialStep4Title || 'Parametre MDP'),
            intro: t.tutorialStep4Intro || 'Môžete upraviť pokročilé parametre (γ, odmeny, ε) a zapnúť voliteľné funkcie ako IDF, sentiment, referenčný bonus alebo USE.'
        });

        const similarityInfo = document.getElementById('similarityInfo');
        if (similarityInfo && !similarityInfo.classList.contains('hidden')) {
            steps.push({
                element: '#similarityInfo',
                title: '📊 ' + (t.tutorialStep5Title || 'Matica podobností'),
                intro: t.tutorialStep5Intro || 'Zobrazuje kosínusovú podobnosť medzi vzormi. Čím tmavšia farba, tým vyššia podobnosť. Môžete prepnúť na graf alebo štatistiky.'
            });
            const graphDiv = document.getElementById('similarityGraph');
            if (graphDiv && !graphDiv.classList.contains('hidden')) {
                steps.push({
                    element: '#similarityGraph',
                    title: '🕸️ ' + (t.tutorialStep6Title || 'Graf podobností'),
                    intro: t.tutorialStep6Intro || 'Interaktívny graf zobrazuje vzťahy medzi vzormi. Hrubšia čiara = vyššia podobnosť. Kliknutím na uzol zobrazíte podrobnosti.'
                });
            }
        }

        const suggestionsSection = document.getElementById('suggestionsSection');
        if (suggestionsSection && !suggestionsSection.classList.contains('hidden')) {
            const patternsList = document.querySelector('#patternsList');
            if (patternsList && patternsList.children.length > 0) {
                steps.push({
                    element: '#patternsList',
                    title: '📝 ' + (t.tutorialStep7Title || 'Navrhnutá sekvencia'),
                    intro: t.tutorialStep7Intro || 'Tu sa zobrazí vygenerovaná postupnosť vzorov. Vzory môžete pretiahnuť myšou a zmeniť ich poradie.'
                });
            }
            steps.push({
                element: '#exportBtn',
                title: '💾 ' + (t.tutorialStep8Title || 'Export výsledkov'),
                intro: t.tutorialStep8Intro || 'Sekvenciu môžete exportovať ako TXT, PDF, CSV alebo PNG. Tlačidlo "Export PRO" vytvorí ZIP archív so všetkými dátami.'
            });
        }

        return steps;
    }

    tutorialBtn.addEventListener('click', function() {
        const t = getT();
        if (!t) {
            showToast('Translations not loaded', 'error');
            return;
        }

        let steps = getTutorialSteps();
        if (steps.length === 0) {
            showToast(t.selectAtLeastTwoPatterns || 'Najprv vyberte vzory a vygenerujte sekvenciu.', 'info');
            return;
        }

        const mappedSteps = steps.map(step => ({
            ...step,
            element: document.querySelector(step.element)
        })).filter(step => step.element !== null);

        if (mappedSteps.length === 0) return;

        const totalSteps = mappedSteps.length;

        // PROGRESS BAR – ROZDELENÝ NA ČASTI
        function injectProgressBar(currentStep) {
            const tooltip = document.querySelector('.introjs-tooltip');
            if (!tooltip) return false;
            
            let container = tooltip.querySelector('.introjs-custom-progress');
            if (!container) {
                container = document.createElement('div');
                container.className = 'introjs-custom-progress';
                const header = tooltip.querySelector('.introjs-tooltip-header');
                if (header) {
                    header.insertAdjacentElement('afterend', container);
                } else {
                    tooltip.insertBefore(container, tooltip.firstChild);
                }
            }

            // Vytvoríme štruktúru progress baru (bez inline štýlov, všetko je v CSS)
            container.innerHTML = `
                <div class="progress-bar-container">
                    <div class="progress-bar-segments">
                        ${Array.from({ length: totalSteps }, (_, i) => {
                            const segmentIndex = i + 1;
                            let segmentClass = 'progress-segment';
                            if (segmentIndex < currentStep) {
                                segmentClass += ' completed';
                            } else if (segmentIndex === currentStep) {
                                segmentClass += ' active';
                            }
                            return `<div class="${segmentClass}"></div>`;
                        }).join('')}
                    </div>
                    <div class="progress-text">
                        <span>${currentStep} / ${totalSteps}</span>
                    </div>
                </div>
            `;
            
            return true;
        }

        // Odstránenie pôvodného "Preskočiť" tlačidla
        function removeSkipButton() {
            const skipBtn = document.querySelector('.introjs-skipbutton');
            if (skipBtn) skipBtn.remove();
        }

        // Pridanie krížika (×) do pravého horného rohu
        function injectOurCloseCross() {
            const tooltip = document.querySelector('.introjs-tooltip');
            if (!tooltip) return false;
            
            if (tooltip.querySelector('.our-introjs-close')) return true;
            
            let header = tooltip.querySelector('.introjs-tooltip-header');
            if (!header) {
                header = document.createElement('div');
                header.className = 'introjs-tooltip-header';
                tooltip.insertBefore(header, tooltip.firstChild);
            }
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'our-introjs-close text-gray-500 hover:text-gray-700 dark:hover:text-gray-300';
            closeBtn.style.cssText = 'position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 24px; line-height: 1; cursor: pointer; padding: 0; margin: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 9999px; transition: all 0.2s; z-index: 100;';
            closeBtn.innerHTML = '×';
            closeBtn.setAttribute('aria-label', t.closeTutorial || 'Zatvoriť tutoriál');
            
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (window._introJsInstance) {
                    window._introJsInstance.exit();
                    window._introJsInstance = null;
                }
            });
            
            header.appendChild(closeBtn);
            header.style.cssText = 'padding-right: 40px; position: relative;';
            
            return true;
        }

        // Skrytie tlačidla Späť na prvom kroku a tlačidla Ďalej na poslednom
        function updateButtonsVisibility(currentStep, totalSteps) {
            setTimeout(() => {
                const prevBtn = document.querySelector('.introjs-prevbutton');
                const nextBtn = document.querySelector('.introjs-nextbutton');
                const doneBtn = document.querySelector('.introjs-donebutton');
                
                if (prevBtn) {
                    if (currentStep === 1) {
                        prevBtn.style.display = 'none';
                    } else {
                        prevBtn.style.display = '';
                    }
                }
                
                if (nextBtn && doneBtn) {
                    if (currentStep === totalSteps) {
                        nextBtn.style.display = 'none';
                        doneBtn.style.display = '';
                    } else {
                        nextBtn.style.display = '';
                        doneBtn.style.display = 'none';
                    }
                }
            }, 50);
        }

        // Inicializácia intro.js
        const intro = introJs();
        window._introJsInstance = intro;

        intro.setOptions({
            steps: mappedSteps,
            showProgress: false,
            showBullets: false,
            showStepNumbers: false,
            exitOnOverlayClick: true,
            nextLabel: t.nextLabel || 'Ďalej →',
            prevLabel: t.prevLabel || '← Späť',
            doneLabel: t.doneLabel || 'Hotovo',
            scrollToElement: true,
            disableInteraction: false,
            tooltipPosition: 'bottom'
        });

        // Udalosť PRED zmenou kroku
        intro.onbeforechange(function(targetElement) {
            const currentStepNumber = intro._currentStep + 1;
            setTimeout(() => {
                removeSkipButton();
                injectProgressBar(currentStepNumber);
                injectOurCloseCross();
                updateButtonsVisibility(currentStepNumber, totalSteps);
            }, 80);
        });

        intro.oncomplete(function() {
            window._introJsInstance = null;
        });

        intro.onexit(function() {
            window._introJsInstance = null;
        });

        intro.start();
        
        setTimeout(() => {
            removeSkipButton();
            injectProgressBar(1);
            injectOurCloseCross();
            updateButtonsVisibility(1, totalSteps);
        }, 200);
    });
});