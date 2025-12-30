import { GoogleGenAI } from "@google/genai";

// --- Types & Data ---
interface Command {
  id: string;
  category: string;
  title: string;
  template: string;
}

const COMMAND_DATA: Command[] = [
  // Writing
  { id: 'w1', category: 'writing', title: 'Summarize', template: 'Summarize the following text into 3 key bullet points: [text]' },
  { id: 'w2', category: 'writing', title: 'Rewrite Tone', template: 'Rewrite this paragraph in a more [formal/casual/persuasive] tone: [paragraph]' },
  { id: 'w3', category: 'writing', title: 'Brainstorm Ideas', template: 'Brainstorm 10 blog post titles about [topic].' },
  { id: 'w4', category: 'writing', title: 'Compose Email', template: 'Write a professional email to [recipient] about [subject].' },
  { id: 'w5', category: 'writing', title: 'Ad Copy', template: 'Generate 3 variations of Facebook ad copy for a [product or service].' },
  { id: 'w6', category: 'writing', title: 'Translate', template: 'Translate "[text]" into [language].' },
  { id: 'w7', category: 'writing', title: 'Persona Shift', template: 'Adopt the persona of a [character or profession] and describe [event or topic].' },
  { id: 'w8', category: 'writing', title: 'Screenplay', template: 'Write a short screenplay scene between [character A] and [character B] about [conflict].' },

  // Coding
  { id: 'c1', category: 'coding', title: 'Write Function', template: 'Write a [language] function to [task].' },
  { id: 'c2', category: 'coding', title: 'Explain Code', template: 'Explain what this code does in simple terms: [code snippet]' },
  { id: 'c3', category: 'coding', title: 'Debug', template: 'Find the bug in this code and provide a fix: [code snippet]' },
  { id: 'c4', category: 'coding', title: 'Regex', template: 'Create a regular expression to validate [pattern, e.g. email or phone].' },
  { id: 'c5', category: 'coding', title: 'Convert', template: 'Convert this [source language] code to [target language]: [code snippet]' },
  { id: 'c6', category: 'coding', title: 'Unit Tests', template: 'Write a unit test for the following function using [framework]: [function]' },
  { id: 'c7', category: 'coding', title: 'Complexity', template: 'Explain the Big O time and space complexity of this logic: [code]' },
  { id: 'c8', category: 'coding', title: 'Refactor', template: 'Refactor this code to be more idiomatic and performant: [code snippet]' },
  { id: 'c9', category: 'coding', title: 'Docker', template: 'Create a Dockerfile for a basic [environment, e.g. Node or Python] application.' },

  // Learning
  { id: 'l1', category: 'learning', title: 'ELI5', template: 'Explain [complex topic] in simple terms that a 5-year-old would understand.' },
  { id: 'l2', category: 'learning', title: 'Analogy', template: 'Create a vivid analogy to help me understand [concept].' },
  { id: 'l3', category: 'learning', title: 'Study Plan', template: 'Create a [duration] study plan for mastering [subject].' },
  { id: 'l4', category: 'learning', title: 'Quiz', template: 'Generate a [number]-question multiple-choice quiz on [topic].' },
  { id: 'l5', category: 'learning', title: 'Pros & Cons', template: 'List the pros and cons of [decision or technology] from a [neutral/expert] perspective.' },
  { id: 'l6', category: 'learning', title: 'Mind Map', template: 'Generate a detailed mind map structure for brainstorming [topic].' },
  { id: 'l7', category: 'learning', title: 'Socratic', template: 'Use the Socratic method to help me understand the concept of [topic]. Ask one question at a time.' },
  { id: 'l8', category: 'learning', title: 'Debate Prep', template: 'Outline the key arguments for and against [controversial topic].' },

  // Business
  { id: 'b1', category: 'business', title: 'SWOT', template: 'Perform a comprehensive SWOT analysis for [company or project].' },
  { id: 'b2', category: 'business', title: 'Meeting Agenda', template: 'Create a detailed meeting agenda for a [type of meeting] regarding [project].' },
  { id: 'b3', category: 'business', title: 'Job Description', template: 'Write a compelling job description for a [job title] at a [company type].' },
  { id: 'b4', category: 'business', title: 'Biz Plan', template: 'Draft an executive summary and business plan outline for a [business idea].' },
  { id: 'b5', category: 'business', title: 'Market Trends', template: 'Provide an overview of the current market trends in [industry] for 2025.' },
  { id: 'b6', category: 'business', title: 'Presentation', template: 'Create a [number]-slide presentation outline on [topic] for a [audience].' },
  { id: 'b7', category: 'business', title: 'Data Insight', template: 'Generate a Python script using Pandas to analyze a dataset with columns [list] for [specific insight].' },
  { id: 'b8', category: 'business', title: 'PRD', template: 'Draft a Product Requirements Document (PRD) for a new feature that [feature description].' },

  // Fun
  { id: 'f1', category: 'fun', title: 'Time Travel', template: 'Act as a tour guide from the year [year] describing [modern city].' },
  { id: 'f2', category: 'fun', title: 'Author Style', template: 'Write a short story about [topic] in the unmistakable style of [famous author].' },
  { id: 'f3', category: 'fun', title: 'Iron Chef', template: 'Create a gourmet recipe using only [ingredient 1], [ingredient 2], and [ingredient 3].' },
  { id: 'f4', category: 'fun', title: 'Recs', template: 'Recommend 5 [movies/books/games] similar to [title] but with a focus on [element].' },
  { id: 'f5', category: 'fun', title: 'Stand-up', template: 'Write a 2-minute stand-up comedy set about [life situation].' },
  { id: 'f6', category: 'fun', title: 'Trip Itinerary', template: 'Plan a [number]-day budget-friendly itinerary for [destination] focused on [activity].' },
  { id: 'f7', category: 'fun', title: 'Text RPG', template: 'Start a text-based RPG where I am a [class, e.g. Wizard] in a [setting, e.g. floating city].' },
];

// --- Utilities ---

/**
 * Replaces [placeholder] patterns with editable spans
 */
function createInteractiveTemplate(template: string): string {
  return template.replace(/\[(.*?)\]/g, (match, placeholder) => {
    return `<span class="placeholder-input" contenteditable="true" data-original="${placeholder}">[${placeholder}]</span>`;
  });
}

/**
 * Gets the text from a template with all current placeholder values
 */
function getProcessedText(cardElement: HTMLElement): string {
  const container = cardElement.querySelector('.command-text-body');
  if (!container) return '';
  
  // Clone to not affect original during cleanup
  const clone = container.cloneNode(true) as HTMLElement;
  const placeholders = clone.querySelectorAll('.placeholder-input');
  
  placeholders.forEach(p => {
    p.textContent = (p as HTMLElement).innerText;
  });
  
  return clone.innerText.trim();
}

// --- UI Engine ---

function renderCommands(filter: string = '') {
  const container = document.getElementById('commandContainer');
  if (!container) return;

  const categories = ['writing', 'coding', 'learning', 'business', 'fun'];
  
  categories.forEach(catId => {
    const catSection = document.getElementById(catId);
    const grid = catSection?.querySelector('.command-grid');
    if (!grid) return;

    const catCommands = COMMAND_DATA.filter(cmd => 
      cmd.category === catId && 
      (cmd.title.toLowerCase().includes(filter.toLowerCase()) || 
       cmd.template.toLowerCase().includes(filter.toLowerCase()))
    );

    grid.innerHTML = catCommands.map(cmd => `
      <div class="command-card" data-id="${cmd.id}">
        <div class="command-text">
          <strong>${cmd.title}</strong>
          <div class="command-text-body">${createInteractiveTemplate(cmd.template)}</div>
        </div>
        <div class="card-footer">
          <button class="copy-btn">
            <i class="fas fa-copy"></i>
            <span>Copy</span>
          </button>
        </div>
      </div>
    `).join('');

    // Hide section if no results
    if (catSection) {
      catSection.style.display = catCommands.length > 0 ? 'block' : 'none';
    }
  });
}

// --- Main Init ---

document.addEventListener('DOMContentLoaded', () => {
  renderCommands();

  // Search Logic
  const searchInput = document.getElementById('globalSearch') as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    renderCommands(val);
  });

  // Sidebar Active States & Scrolling
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.substring(1);
      const targetEl = document.getElementById(targetId || '');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // Handle Copy Events (Delegation)
  document.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const copyBtn = target.closest<HTMLButtonElement>('.copy-btn');
    
    if (copyBtn) {
      const card = copyBtn.closest<HTMLElement>('.command-card');
      if (card) {
        const text = getProcessedText(card);
        try {
          await navigator.clipboard.writeText(text);
          const originalContent = copyBtn.innerHTML;
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = `<i class="fas fa-check"></i> <span>Copied!</span>`;
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = originalContent;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy', err);
        }
      }
    }

    // Architect Copy
    const copyResultBtn = target.closest<HTMLButtonElement>('.copy-result-btn');
    if (copyResultBtn) {
      const text = document.getElementById('resultText')?.innerText || '';
      await navigator.clipboard.writeText(text);
      copyResultBtn.innerHTML = `<i class="fas fa-check"></i> Copied`;
      setTimeout(() => {
        copyResultBtn.innerHTML = `<i class="fas fa-copy"></i> Copy`;
      }, 2000);
    }
  });

  // AI Architect Implementation
  const generateBtn = document.getElementById('generatePromptBtn');
  const architectInput = document.getElementById('architectInput') as HTMLTextAreaElement;
  const architectResult = document.getElementById('architectResult');
  const resultText = document.getElementById('resultText');

  generateBtn?.addEventListener('click', async () => {
    const userInput = architectInput.value.trim();
    if (!userInput) return;

    const loadingIcon = generateBtn.querySelector('.loading-icon') as HTMLElement;
    const btnText = generateBtn.querySelector('span') as HTMLElement;
    
    // Toggle Loading
    loadingIcon.style.display = 'inline-block';
    btnText.textContent = 'Architecting...';
    generateBtn.setAttribute('disabled', 'true');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a world-class prompt engineer. The user wants to create a highly effective prompt for this task: "${userInput}". 
        Create a detailed, multi-step prompt that includes:
        - Role (Who the AI should be)
        - Context (Detailed background)
        - Task (Specific steps to follow)
        - Output Constraints (Format, tone, length)
        
        Provide ONLY the final optimized prompt text. No introduction or closing.`,
        config: {
          temperature: 0.7,
        }
      });

      if (resultText && architectResult) {
        resultText.textContent = response.text || "Failed to generate prompt.";
        architectResult.style.display = 'block';
        architectResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error('AI Architect Error:', error);
      if (resultText) resultText.textContent = "Error communicating with Gemini. Please check your connection.";
    } finally {
      loadingIcon.style.display = 'none';
      btnText.textContent = 'Generate Architect Prompt';
      generateBtn.removeAttribute('disabled');
    }
  });

  // Placeholder Auto-clearing on first click
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('placeholder-input')) {
      const original = `[${target.getAttribute('data-original')}]`;
      if (target.innerText === original) {
        target.innerText = '';
      }
    }
  });

  document.addEventListener('focusout', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('placeholder-input')) {
      if (target.innerText.trim() === '') {
        target.innerText = `[${target.getAttribute('data-original')}]`;
      }
    }
  });
});
