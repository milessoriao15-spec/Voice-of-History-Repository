export type Puzzle = {
  question: string;
  answers: string[]; // keywords or exact match allowed
  hints: string[];
  successMessage: string;
  eventToLog: string;
  date: string;
  significance: string;
  item: string;
  options?: string[]; // For multiple choice / door puzzles
  displayWord?: string; // For scramble
};

export type SessionScript = {
  id: number;
  intro: string;
  puzzles: Puzzle[];
};

export const GAME_SCRIPTS: SessionScript[] = [
  {
    id: 1,
    intro: "Welcome, Guardian! I am the Voice of History. We are in the first era: Ancient Asia (Historical Trivia). Answer the following to fix the timeline.",
    puzzles: [
      {
        question: "First Challenge [Trivia]: What is the famous trade route that connected the East and West, where not only silk but also culture, religion, and technology were exchanged?",
        answers: ["silk road", "silk"],
        hints: ["This route is named after the most famous commodity from China.", "S__k R__d."],
        successMessage: "Excellent! The Silk Road became a bridge of knowledge and trade that shaped civilization.",
        eventToLog: "Opening of the Silk Road",
        date: "130 BCE - 1453 CE",
        significance: "Connected the cultures of the East and West.",
        item: "Ancient Silk Fragment"
      },
      {
        question: "Second Challenge [Trivia]: What important religion originating in India spread towards the East (such as China and Japan)?",
        answers: ["buddhism"],
        hints: ["It was founded by Siddhartha Gautama.", "B_ddh__m."],
        successMessage: "Correct! The spread of Buddhism changed perspectives and cultures in Asia.",
        eventToLog: "Spread of Buddhism",
        date: "6th Century BCE",
        significance: "Preached about peace and Nirvana.",
        item: "Lotus Statue"
      },
      {
        question: "Third Challenge [Trivia]: Which ancient civilization in Asia is known for the invention of paper, gunpowder, and the compass?",
        answers: ["china", "chinese"],
        hints: ["They also built the famous Great Wall.", "C__na."],
        successMessage: "Great! These inventions from China drove early globalization.",
        eventToLog: "Chinese Inventions",
        date: "Ancient Times",
        significance: "Facilitated navigation, communication, and warfare.",
        item: "Earliest Compass"
      }
    ]
  },
  {
    id: 2,
    intro: "Congratulations! Second Session: Empires in Southeast Asia (Word Scramble). Unscramble the letters to correct the data.",
    puzzles: [
      {
        question: "First Challenge [Word Scramble]: Rearrange and guess - The empire in Cambodia that built Angkor Wat.",
        answers: ["khmer", "khmer empire"],
        hints: ["K ___ ___ ___ R", "They built the famous temple in Cambodia."],
        successMessage: "Excellent! The Khmer Empire is known for its magnificent art.",
        eventToLog: "Construction of Angkor Wat",
        date: "12th Century CE",
        significance: "The largest religious monument in the world.",
        item: "Stone carving of Apsara",
        displayWord: "KHMER"
      },
      {
        question: "Second Challenge [Word Scramble]: A powerful maritime empire that controlled the Strait of Malacca.",
        answers: ["srivijaya", "sri vijaya"],
        hints: ["S R I _ _ _ _ _ _", "It originated from the area of Sumatra."],
        successMessage: "Correct! Srivijaya controlled the trade between India and China.",
        eventToLog: "Rise of Srivijaya",
        date: "7th - 13th Century CE",
        significance: "A major center of trade and Buddhist learning.",
        item: "Ancient Spice Pouch",
        displayWord: "SRIVIJAYA"
      },
      {
        question: "Third Challenge [Word Scramble]: Ancient belief in Southeast Asia that nature has spirits.",
        answers: ["animism"],
        hints: ["A N I _ _ _ _ M", "It is the worship of the spirits of nature."],
        successMessage: "Correct! Animism reflects a deep connection to Mother Nature.",
        eventToLog: "Animistic Beliefs",
        date: "Pre-colonial Era",
        significance: "Shaped the lifestyle and culture of ancient Asians.",
        item: "Spirit Charm",
        displayWord: "ANIMISM"
      }
    ]
  },
  {
    id: 3,
    intro: "Third Session: 'Colonial Encounters' (Riddles). Answer the riddles of history.",
    puzzles: [
      {
        question: "First Challenge [Riddle]: I am the country from afar, first to travel to find spices. Vasco da Gama is my captain. Who am I?",
        answers: ["portugal", "portuguese"],
        hints: ["My capital is Lisbon.", "I am next to Spain on the map."],
        successMessage: "Excellent! Portugal led the exploration.",
        eventToLog: "Arrival of the Portuguese in Asia",
        date: "1498 CE",
        significance: "Started European maritime expansion.",
        item: "Portuguese Astrolabe",
        options: ["Portugal", "Spain", "England"]
      },
      {
        question: "Second Challenge [Riddle]: I am the gold of Asia but placed in a pot. I make food delicious, so they travel for me. What am I?",
        answers: ["spices", "spice"],
        hints: ["Used like pepper and cinnamon.", "In English it is S _ _ _ _ S."],
        successMessage: "Correct! Spices were the main reason for colonization.",
        eventToLog: "Spice Trade",
        date: "15th - 17th Century",
        significance: "Sparked monopolies and conflicts among Westerners.",
        item: "Golden Nutmeg",
        options: ["Gold", "Spices", "Silk"]
      },
      {
        question: "Third Challenge [Riddle]: From the West bearing a cross and sword. I controlled your archipelago for over three hundred years. Who am I?",
        answers: ["spain"],
        hints: ["They colonized the Philippines starting in 1565.", "Their king was King Philip II."],
        successMessage: "Great! Spain had a massive impact on culture and religion.",
        eventToLog: "Spanish Colonization",
        date: "1565 - 1898",
        significance: "Spread of Christianity and Hispanic culture.",
        item: "Silver Peso Coin",
        options: ["America", "Japan", "Spain"]
      }
    ]
  },
  {
    id: 4,
    intro: "Fourth Session: Nationalism and Revolution (Logic & Clues). Use the clues to provide the exact keyword.",
    puzzles: [
      {
        question: "First Challenge [Clues]: Clue 1: 'Mahatma'. Clue 2: Ahimsa (Non-violence). Clue 3: Salt March. Who is he?",
        answers: ["gandhi", "mohandas gandhi", "mahatma gandhi"],
        hints: ["His last name is G_ndh_.", "Great soul of India."],
        successMessage: "Excellent! Gandhi's philosophy opened the path to peaceful struggle.",
        eventToLog: "Peaceful Revolution in India",
        date: "1930 CE",
        significance: "Inspired the whole world for peaceful reform.",
        item: "Gandhi's Charkha"
      },
      {
        question: "Second Challenge [Clues]: Clue 1: Kataastaasang Kagalanggalangang Katipunan. Clue 2: Father of the Katipunan. Clue 3: Pugadlawin. Who is he?",
        answers: ["bonifacio", "andres bonifacio"],
        hints: ["He was known as the Supremo.", "A _ _ R E S   B _ _ I F _ C _ O"],
        successMessage: "Correct! Andres Bonifacio is a crucial hero of the Philippines.",
        eventToLog: "The Famous Katipunan",
        date: "1892 CE - 1896 CE",
        significance: "Initiated the first steps against the Spaniards.",
        item: "Katipunero's Bolo"
      },
      {
        question: "Third Challenge [Clues]: Clue 1: Love for one's country. Clue 2: Desire for freedom. Clue 3: An ideology that pushed for revolution. What is it?",
        answers: ["nationalism"],
        hints: ["Starts with N and ends with M.", "N A T I O N A L I S M"],
        successMessage: "Correct! Nationalism awakened the spirit of Asians.",
        eventToLog: "Rise of Nationalism",
        date: "Late 19th - 20th Century",
        significance: "Brought down colonialist regimes.",
        item: "Banner of Independence"
      }
    ]
  },
  {
    id: 5,
    intro: "Final Session: Modern Asia and Globalism (Vault Key/Code). We need to enter the correct codes or acronyms to fully restore the timeline.",
    puzzles: [
      {
        question: "First Challenge [Code]: Type the 5-letter ACRONYM of the Association of Southeast Asian Nations that strengthens the economy in our region today.",
        answers: ["asean", "a.s.e.a.n."],
        hints: ["A _ _ _ N", "Formed in 1967."],
        successMessage: "Excellent! Code accepted: ASEAN.",
        eventToLog: "Establishment of ASEAN",
        date: "August 8, 1967",
        significance: "Cooperation for peace and economy in the region.",
        item: "ASEAN Emblem Golden Pin"
      },
      {
        question: "Second Challenge [Code]: Which 5-letter country is also called the 'Land of the Rising Sun' that emerged (economic miracle) from World War II due to technology?",
        answers: ["japan"],
        hints: ["J _ _ _ N", "Tokyo and Mt. Fuji can be found here."],
        successMessage: "Great! Japan recovered rapidly.",
        eventToLog: "Japan's Economic Miracle",
        date: "Post-1945",
        significance: "Brought modernization and technological advancement.",
        item: "Electronic Component"
      },
      {
        question: "Third Challenge [Code]: Type the 13-letter word where the world has seemingly become a 'global village' because of the internet and free trade.",
        answers: ["globalization"],
        hints: ["G _ _ B A _ I Z A T _ _ N", "Interconnection of countries."],
        successMessage: "Correct! Globalization became the key to the modern world.",
        eventToLog: "Modern Globalization",
        date: "Late 20th Century - Present",
        significance: "Connected the economy, society, and culture of humanity.",
        item: "Digital Map Core"
      }
    ]
  }
];
