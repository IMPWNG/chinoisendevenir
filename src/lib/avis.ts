export type AvisItem = {
  name: string;
  place: string;
  text: string;
};

const fr: AvisItem[] = [
  {
    name: "Awa Diop",
    place: "Dakar",
    text: "Bonjour, je vous écris juste pour vous remercier. Je suis arrivée en Chine la semaine dernière. Ça faisait des années que je voulais venir, et là je peux enfin le faire. Sans votre accompagnement j'aurais lâché le dossier au milieu.",
  },
  {
    name: "Aminata Bah",
    place: "Conakry",
    text: "Franchement c'est un accompagnement de qualité. Ils ont vérifié mes pièces, les traductions, les dates. J'ai eu l'école que je voulais. Je vous le recommande.",
  },
  {
    name: "Ibrahima Fall",
    place: "Dakar",
    text: "Je vais être honnête. J'ai pas eu mon premier choix d'université. La deuxième m'a accepté et elle est bien quand même, le programme correspond à ce que je cherchais. L'équipe est restée jusqu'au bout.",
  },
  {
    name: "Fatou Ndiaye",
    place: "Thiès",
    text: "Si vous savez pas par où commencer, écrivez-leur. Moi les sites chinois je comprenais rien. Ils m'ont expliqué étape par étape. Aujourd'hui j'ai mon admission.",
  },
  {
    name: "Jean Kouakou",
    place: "Abidjan",
    text: "Sur WhatsApp ils répondent, on est pas laissés sans nouvelles. J'ai eu mon admission en ingénierie. Je vous recommanderais sans hésiter.",
  },
  {
    name: "Camille Dupont",
    place: "Lyon",
    text: "Bonjour, petit message après mon arrivée. J'ai eu l'admission et le visa. La bourse, non : on m'avait prévenue que c'était pas garanti. Pour le dossier par contre, j'ai été bien suivie du début à la fin.",
  },
  {
    name: "Oumar Traoré",
    place: "Bamako",
    text: "Je suis en Chine maintenant. Grâce à Chinois en Devenir je réalise ce que je voulais depuis le lycée, un master ici. Le dossier a pris des mois, mais ils ont suivi.",
  },
  {
    name: "Khady Mbaye",
    place: "Saint-Louis",
    text: "J'avais pas le niveau de chinois. Ils m'ont pas poussée vers une fac tout de suite, ils m'ont orientée vers une année de langue. C'était le bon choix. L'école me plaît.",
  },
  {
    name: "Cheikh Diouf",
    place: "Dakar",
    text: "C'est du sérieux. Pas des promesses du genre « tu auras forcément la bourse ». Ils m'ont dit ce qui était possible et ce qui ne l'était pas. J'ai ma lettre d'admission.",
  },
  {
    name: "Mame Diarra Gueye",
    place: "Dakar",
    text: "Le délai était plus long que ce que j'espérais, je stresse facilement. Mais ils relançaient les universités et au final j'ai été prise. Je recommande.",
  },
  {
    name: "Lamine Bah",
    place: "Conakry",
    text: "Au début je trouvais que c'était un budget. Après l'admission et le visa, je regrette pas. J'aurais pas su monter le dossier tout seul.",
  },
  {
    name: "Kadiatou Conté",
    place: "Conakry",
    text: "Je vous écris de Chine. Merci. Mon rêve c'était de partir étudier ici, et là je suis sur place. L'accompagnement était clair, j'ai toujours su quelle pièce il manquait.",
  },
  {
    name: "Mariama Sidibé",
    place: "Bamako",
    text: "Qualité du suivi, vraiment. Chaque document a été relu. J'ai eu l'université de mon choix en commerce. Mes parents aussi sont rassurés.",
  },
  {
    name: "Aboubacar Bangoura",
    place: "Labé",
    text: "Mon premier choix a dit non. Le second m'a pris. Je suis un peu déçu pour la première, mais l'université est bien quand même et le programme est sérieux. Eux ils ont continué à chercher, ils ont pas arrêté au premier refus.",
  },
  {
    name: "Fatoumata Touré",
    place: "Bamako",
    text: "Je le recommande à toute personne qui veut étudier en Chine et qui parle français. On comprend ce qu'on doit faire. Moi j'ai eu mon admission.",
  },
  {
    name: "Léa Bernard",
    place: "Nantes",
    text: "J'ai fait l'année de langue puis l'admission. Les deux dossiers ont été suivis par la même personne, ça change tout. Je suis contente d'être partie.",
  },
  {
    name: "Thomas Moreau",
    place: "Bruxelles",
    text: "Admission oui, bourse non. C'est pas ce que j'espérais sur le financement, je le dis clairement. En revanche pour les démarches et le visa, rien à dire, c'était carré.",
  },
  {
    name: "Inès Laurent",
    place: "Toulouse",
    text: "Coucou, juste pour dire merci. Vous avez été patients avec toutes mes questions sur WhatsApp. J'ai mon école. Je pars le mois prochain.",
  },
  {
    name: "Hugo Petit",
    place: "Lille",
    text: "J'ai eu l'université que je visais. Le dossier était complet, les délais respectés. Je recommande si vous voulez un accompagnement de qualité.",
  },
  {
    name: "Chloé Garcia",
    place: "Montpellier",
    text: "J'ai pas eu la fac que je mettais en numéro 1. Ils m'ont proposé une autre qui correspondait à mon niveau, et elle m'a acceptée. Au final je suis bien. Merci pour le suivi.",
  },
];

const en: AvisItem[] = [
  {
    name: "Awa Diop",
    place: "Dakar",
    text: "Hi, I'm just writing to say thank you. I arrived in China last week. I had wanted to come for years, and now I finally can. Without your support I would have dropped the file halfway.",
  },
  {
    name: "Aminata Bah",
    place: "Conakry",
    text: "Honestly the support is good quality. They checked my documents, the translations, the dates. I got the school I wanted. I recommend them.",
  },
  {
    name: "Ibrahima Fall",
    place: "Dakar",
    text: "I'll be honest. I didn't get my first-choice university. The second one accepted me and it's good anyway — the program is what I was looking for. The team stayed with me until the end.",
  },
  {
    name: "Fatou Ndiaye",
    place: "Thiès",
    text: "If you don't know where to start, write to them. I couldn't understand the Chinese websites. They explained it step by step. I have my admission now.",
  },
  {
    name: "Jean Kouakou",
    place: "Abidjan",
    text: "They reply on WhatsApp, you're not left without news. I got my admission in engineering. I would recommend them without hesitating.",
  },
  {
    name: "Camille Dupont",
    place: "Lyon",
    text: "Hi, a short note after I arrived. I got the admission and the visa. The scholarship, no — they had told me it wasn't guaranteed. For the file itself, I was followed from start to finish.",
  },
  {
    name: "Oumar Traoré",
    place: "Bamako",
    text: "I'm in China now. Thanks to Chinois en Devenir I'm doing what I wanted since high school, a master's here. The file took months, but they stayed on it.",
  },
  {
    name: "Khady Mbaye",
    place: "Saint-Louis",
    text: "My Chinese wasn't good enough. They didn't push me straight into a university. They pointed me to a language year first. It was the right choice. I like the school.",
  },
  {
    name: "Cheikh Diouf",
    place: "Dakar",
    text: "They're serious. No promises like \"you'll definitely get the scholarship\". They told me what was possible and what wasn't. I have my admission letter.",
  },
  {
    name: "Mame Diarra Gueye",
    place: "Dakar",
    text: "It took longer than I hoped, and I stress easily. But they followed up with the universities and in the end I was accepted. I recommend them.",
  },
  {
    name: "Lamine Bah",
    place: "Conakry",
    text: "At first I thought it was a lot of money. After the admission and the visa, I don't regret it. I couldn't have built the file on my own.",
  },
  {
    name: "Kadiatou Conté",
    place: "Conakry",
    text: "I'm writing from China. Thank you. My dream was to come study here, and now I'm here. The support was clear. I always knew which document was missing.",
  },
  {
    name: "Mariama Sidibé",
    place: "Bamako",
    text: "The follow-up is really good quality. Every document was read again. I got my first-choice university in business. My parents feel reassured too.",
  },
  {
    name: "Aboubacar Bangoura",
    place: "Labé",
    text: "My first choice said no. The second one took me. I'm a bit disappointed about the first, but the university is good anyway and the program is serious. They kept looking. They didn't stop at the first refusal.",
  },
  {
    name: "Fatoumata Touré",
    place: "Bamako",
    text: "I recommend them to anyone who wants to study in China and speaks French. You understand what you have to do. I got my admission.",
  },
  {
    name: "Léa Bernard",
    place: "Nantes",
    text: "I did the language year, then the university application. The same person followed both files. That changes everything. I'm glad I left.",
  },
  {
    name: "Thomas Moreau",
    place: "Brussels",
    text: "Admission yes, scholarship no. That's not what I hoped for on the money side, I'll say it clearly. For the paperwork and the visa, though, nothing to complain about. It was tight and clear.",
  },
  {
    name: "Inès Laurent",
    place: "Toulouse",
    text: "Hey, just to say thanks. You were patient with all my WhatsApp questions. I have my school. I leave next month.",
  },
  {
    name: "Hugo Petit",
    place: "Lille",
    text: "I got the university I was aiming for. The file was complete, the deadlines were kept. I recommend them if you want quality support.",
  },
  {
    name: "Chloé Garcia",
    place: "Montpellier",
    text: "I didn't get the university I put first. They suggested another one that matched my level, and it accepted me. In the end I'm fine. Thanks for the follow-up.",
  },
];

export const avisByLang = { fr, en };
