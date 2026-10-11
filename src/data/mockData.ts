import { ExamCategory, Subject, Topic, Question, MockTest, NoteItem, TypingPassage } from '../types';

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 'cgl',
    name: 'CGL MCQs',
    icon: '🏛️',
    active: true,
    category: 'SSC',
    description: 'Combined Graduate Level Exam Tier 1 & 2 Practice',
    testCount: 24,
  },
  {
    id: 'chsl',
    name: 'CHSL Quiz',
    icon: '📝',
    active: true,
    category: 'SSC',
    description: 'Combined Higher Secondary Level (10+2) Test Series',
    testCount: 18,
  },
  {
    id: 'mts',
    name: 'MTS MCQs',
    icon: '💼',
    active: true,
    category: 'SSC',
    description: 'Multi-Tasking Staff & Havaldar Previous Year & Model Sets',
    testCount: 15,
  },
  {
    id: 'gd',
    name: 'GD MCQs',
    icon: '💂',
    active: true,
    category: 'SSC',
    description: 'SSC Constable GD (BSF, CISF, CRPF, SSB, ITBP)',
    testCount: 30,
  },
  {
    id: 'cpo',
    name: 'CPO SI',
    icon: '⭐',
    active: true,
    category: 'Police',
    description: 'Central Police Organisation Sub-Inspector & CAPFs',
    testCount: 12,
  },
  {
    id: 'steno',
    name: 'Steno',
    icon: '✍️',
    active: true,
    category: 'SSC',
    description: 'Stenographer Grade C & D General Awareness & English',
    testCount: 10,
  },
  {
    id: 'ssc_je',
    name: 'SSC JE',
    icon: '🏗️',
    active: true,
    category: 'SSC',
    description: 'Junior Engineer Non-Tech General Intelligence & GK',
    testCount: 14,
  },
  {
    id: 'jht',
    name: 'JHT MCQs',
    icon: '📖',
    active: true,
    category: 'SSC',
    description: 'Junior Hindi Translator Language & GK Tests',
    testCount: 8,
  },
  {
    id: 'delhi_police',
    name: 'Delhi Police',
    icon: '🚓',
    active: true,
    category: 'Police',
    description: 'Delhi Police Constable Executive & Driver Test Papers',
    testCount: 22,
  },
  {
    id: 'selection_post',
    name: 'Selection Post',
    icon: '🎯',
    active: true,
    category: 'SSC',
    description: 'Phase XII / XIII Selection Posts Matric to Graduate',
    testCount: 16,
  },
  {
    id: 'head_constable',
    name: 'Head Constable',
    icon: '👮‍♀️',
    active: true,
    category: 'Police',
    description: 'Delhi Police Head Constable (AWO/TPO & Ministerial)',
    testCount: 12,
  },
  {
    id: 'imd_asst',
    name: 'IMD Asst.',
    icon: '🔬',
    active: true,
    category: 'Other',
    description: 'India Meteorological Department Scientific Assistant',
    testCount: 6,
  },
  {
    id: 'ssa_udc',
    name: 'SSA / UDC',
    icon: '🚀',
    active: false,
    badge: 'SOON',
    category: 'SSC',
    description: 'Senior Secretariat Assistant / Upper Division Clerk',
    testCount: 0,
  },
  {
    id: 'driver_dp',
    name: 'Driver (DP)',
    icon: '🛣️',
    active: false,
    badge: 'SOON',
    category: 'Police',
    description: 'Delhi Police Constable Driver Technical & Traffic Rules',
    testCount: 0,
  },
];

export const SUBJECTS: Subject[] = [
  {
    id: 'polity',
    name: 'Polity & Constitution',
    nameHi: 'भारतीय राजव्यवस्था',
    icon: '⚖️',
    color: 'from-blue-600 to-indigo-700',
    topicCount: 6,
    questionCount: 180,
  },
  {
    id: 'history',
    name: 'History',
    nameHi: 'भारतीय इतिहास',
    icon: '🏛️',
    color: 'from-amber-600 to-yellow-700',
    topicCount: 5,
    questionCount: 210,
  },
  {
    id: 'geography',
    name: 'Geography',
    nameHi: 'भारत एवं विश्व भूगोल',
    icon: '🌍',
    color: 'from-emerald-600 to-teal-700',
    topicCount: 5,
    questionCount: 160,
  },
  {
    id: 'science',
    name: 'General Science',
    nameHi: 'सामान्य विज्ञान',
    icon: '🔬',
    color: 'from-cyan-600 to-blue-700',
    topicCount: 4,
    questionCount: 190,
  },
  {
    id: 'economics',
    name: 'Indian Economy',
    nameHi: 'भारतीय अर्थव्यवस्था',
    icon: '📈',
    color: 'from-purple-600 to-indigo-800',
    topicCount: 4,
    questionCount: 120,
  },
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    nameHi: 'गणित (अंकगणित)',
    icon: '📐',
    color: 'from-rose-600 to-pink-700',
    topicCount: 5,
    questionCount: 250,
  },
  {
    id: 'reasoning',
    name: 'Reasoning Ability',
    nameHi: 'तर्कशक्ति परीक्षण',
    icon: '🧩',
    color: 'from-violet-600 to-purple-700',
    topicCount: 4,
    questionCount: 175,
  },
  {
    id: 'english',
    name: 'English Language',
    nameHi: 'अंग्रेजी भाषा',
    icon: '📚',
    color: 'from-teal-600 to-emerald-700',
    topicCount: 4,
    questionCount: 200,
  },
];

export const TOPICS: Record<string, Topic[]> = {
  polity: [
    { id: 'polity_preamble', subjectId: 'polity', name: 'Constituent Assembly & Preamble', nameHi: 'संविधान सभा एवं प्रस्तावना', questionCount: 15, difficulty: 'Easy' },
    { id: 'polity_fr', subjectId: 'polity', name: 'Fundamental Rights & Duties (Art 12-51A)', nameHi: 'मौलिक अधिकार एवं कर्तव्य', questionCount: 25, difficulty: 'Moderate' },
    { id: 'polity_president', subjectId: 'polity', name: 'President, Vice-President & Governor', nameHi: 'राष्ट्रपति एवं राज्यपाल', questionCount: 20, difficulty: 'Moderate' },
    { id: 'polity_parliament', subjectId: 'polity', name: 'Parliament & State Legislature', nameHi: 'संसद एवं राज्य विधानमंडल', questionCount: 30, difficulty: 'Hard' },
    { id: 'polity_judiciary', subjectId: 'polity', name: 'Supreme Court & High Courts', nameHi: 'सर्वोच्च न्यायालय एवं उच्च न्यायालय', questionCount: 18, difficulty: 'Moderate' },
    { id: 'polity_amendments', subjectId: 'polity', name: 'Important Constitutional Amendments', nameHi: 'महत्वपूर्ण संविधान संशोधन', questionCount: 22, difficulty: 'Hard' },
  ],
  history: [
    { id: 'hist_ancient', subjectId: 'history', name: 'Indus Valley & Vedic Civilization', nameHi: 'सिंधु घाटी एवं वैदिक सभ्यता', questionCount: 20, difficulty: 'Easy' },
    { id: 'hist_buddhism', subjectId: 'history', name: 'Buddhism, Jainism & Maurya Empire', nameHi: 'बौद्ध, जैन एवं मौर्य साम्राज्य', questionCount: 25, difficulty: 'Moderate' },
    { id: 'hist_medieval', subjectId: 'history', name: 'Delhi Sultanate & Mughal Dynasty', nameHi: 'दिल्ली सल्तनत एवं मुगल काल', questionCount: 30, difficulty: 'Moderate' },
    { id: 'hist_1857', subjectId: 'history', name: 'Revolt of 1857 & Early Resistance', nameHi: '1857 का संग्राम एवं जन आंदोलन', questionCount: 20, difficulty: 'Moderate' },
    { id: 'hist_modern', subjectId: 'history', name: 'Indian National Movement (1905-1947)', nameHi: 'भारतीय राष्ट्रीय आंदोलन (1905-1947)', questionCount: 35, difficulty: 'Hard' },
  ],
  geography: [
    { id: 'geo_rivers', subjectId: 'geography', name: 'Rivers & River Valley Projects of India', nameHi: 'भारत की नदियाँ एवं बहुउद्देशीय परियोजनाएं', questionCount: 25, difficulty: 'Moderate' },
    { id: 'geo_mountains', subjectId: 'geography', name: 'Himalayas & Physical Geography', nameHi: 'हिमालय एवं भारत का भौतिक स्वरूप', questionCount: 20, difficulty: 'Moderate' },
    { id: 'geo_climate', subjectId: 'geography', name: 'Monsoon, Soils & Agriculture', nameHi: 'मानसून, मृदा एवं प्रमुख फसलें', questionCount: 22, difficulty: 'Hard' },
    { id: 'geo_parks', subjectId: 'geography', name: 'National Parks & Biosphere Reserves', nameHi: 'राष्ट्रीय उद्यान एवं वन्यजीव अभयारण्य', questionCount: 30, difficulty: 'Easy' },
  ],
  science: [
    { id: 'sci_bio_human', subjectId: 'science', name: 'Human Biology, Diseases & Vitamins', nameHi: 'मानव शरीर क्रिया, रोग एवं विटामिन', questionCount: 35, difficulty: 'Moderate' },
    { id: 'sci_phy_motion', subjectId: 'science', name: 'Motion, Optics, Work & Energy', nameHi: 'गति के नियम, प्रकाश एवं ऊर्जा', questionCount: 25, difficulty: 'Moderate' },
    { id: 'sci_chem_compounds', subjectId: 'science', name: 'Acids, Bases, Metals & Everyday Chemistry', nameHi: 'अम्ल, क्षार एवं धातु अधातु', questionCount: 25, difficulty: 'Easy' },
    { id: 'sci_units', subjectId: 'science', name: 'SI Units, Discoveries & Inventions', nameHi: 'एसआई मात्रक एवं प्रमुख आविष्कार', questionCount: 20, difficulty: 'Easy' },
  ],
  quant: [
    { id: 'quant_percent', subjectId: 'quant', name: 'Percentage & Profit, Loss & Discount', nameHi: 'प्रतिशत तथा लाभ-हानि', questionCount: 30, difficulty: 'Moderate' },
    { id: 'quant_ratio', subjectId: 'quant', name: 'Ratio, Proportion & Mixture Alligation', nameHi: 'अनुपात, समानुपात एवं मिश्रण', questionCount: 25, difficulty: 'Moderate' },
    { id: 'quant_time_work', subjectId: 'quant', name: 'Time & Work, Pipes & Cisterns', nameHi: 'समय एवं कार्य, नल एवं टंकी', questionCount: 25, difficulty: 'Hard' },
    { id: 'quant_speed_train', subjectId: 'quant', name: 'Speed, Distance & Trains', nameHi: 'चाल, समय, दूरी एवं रेलगाड़ी', questionCount: 25, difficulty: 'Moderate' },
    { id: 'quant_si_ci', subjectId: 'quant', name: 'Simple & Compound Interest', nameHi: 'साधारण एवं चक्रवृद्धि ब्याज', questionCount: 20, difficulty: 'Hard' },
  ],
  reasoning: [
    { id: 'reas_coding', subjectId: 'reasoning', name: 'Coding-Decoding & Letter Series', nameHi: 'कोडिंग-डिकोडिंग एवं अक्षर श्रृंखला', questionCount: 25, difficulty: 'Easy' },
    { id: 'reas_analogy', subjectId: 'reasoning', name: 'Analogy & Classification', nameHi: 'सादृश्यता एवं वर्गीकरण', questionCount: 20, difficulty: 'Easy' },
    { id: 'reas_blood', subjectId: 'reasoning', name: 'Blood Relations & Direction Sense', nameHi: 'रक्त संबंध एवं दिशा ज्ञान', questionCount: 25, difficulty: 'Moderate' },
    { id: 'reas_syllogism', subjectId: 'reasoning', name: 'Syllogism & Logical Deduction', nameHi: 'कथन एवं निष्कर्ष (न्याय निगमन)', questionCount: 20, difficulty: 'Hard' },
  ],
  english: [
    { id: 'eng_vocab', subjectId: 'english', name: 'Synonyms, Antonyms & One Word Substitution', nameHi: 'पर्यायवाची, विलोम एवं एकल शब्द', questionCount: 40, difficulty: 'Moderate' },
    { id: 'eng_idioms', subjectId: 'english', name: 'Important Idioms & Phrases', nameHi: 'महत्वपूर्ण मुहावरे और लोकोक्तियाँ', questionCount: 30, difficulty: 'Easy' },
    { id: 'eng_spotting', subjectId: 'english', name: 'Spotting the Error (Grammar Rules)', nameHi: 'वाक्य त्रुटि सुधार (व्याकरण)', questionCount: 35, difficulty: 'Hard' },
  ],
  economics: [
    { id: 'eco_inflation', subjectId: 'economics', name: 'Inflation, RBI & Monetary Policy', nameHi: 'मुद्रास्फीति, आरबीआई एवं मौद्रिक नीति', questionCount: 20, difficulty: 'Moderate' },
    { id: 'eco_budget', subjectId: 'economics', name: 'Union Budget, Taxes & GST', nameHi: 'केंद्रीय बजट, प्रत्यक्ष एवं अप्रत्यक्ष कर', questionCount: 20, difficulty: 'Moderate' },
  ]
};

// Curated authentic questions with 4 options and 1-line crisp explanations
export const QUESTIONS_DATABASE: Question[] = [
  // Polity questions
  {
    id: 'q_pol_1',
    topicId: 'polity_fr',
    subjectId: 'polity',
    questionEn: 'Which Article of the Indian Constitution is regarded as the "Heart and Soul of the Constitution" by Dr. B.R. Ambedkar?',
    questionHi: 'डॉ. बी.आर. अम्बेडकर ने भारतीय संविधान के किस अनुच्छेद को "संविधान का हृदय और आत्मा" कहा था?',
    optionsEn: ['Article 19', 'Article 21', 'Article 32', 'Article 14'],
    optionsHi: ['अनुच्छेद 19', 'अनुच्छेद 21', 'अनुच्छेद 32', 'अनुच्छेद 14'],
    correctIndex: 2,
    explanationEn: 'Article 32 gives the Right to Constitutional Remedies via 5 Writs (Habeas Corpus, Mandamus, etc.).',
    explanationHi: 'अनुच्छेद 32 संवैधानिक उपचारों का अधिकार प्रदान करता है जिसके तहत सर्वोच्च न्यायालय 5 रिट जारी करता है।',
  },
  {
    id: 'q_pol_2',
    topicId: 'polity_fr',
    subjectId: 'polity',
    questionEn: 'By which Constitutional Amendment was the Right to Education (Article 21A) inserted into Fundamental Rights?',
    questionHi: 'शिक्षा का अधिकार (अनुच्छेद 21A) किस संविधान संशोधन द्वारा मौलिक अधिकारों में जोड़ा गया?',
    optionsEn: ['42nd Amendment, 1976', '44th Amendment, 1978', '86th Amendment, 2002', '91st Amendment, 2003'],
    optionsHi: ['42वां संशोधन, 1976', '44वां संशोधन, 1978', '86वां संशोधन, 2002', '91वां संशोधन, 2003'],
    correctIndex: 2,
    explanationEn: '86th Amendment Act 2002 made free & compulsory education for 6-14 year children a fundamental right.',
    explanationHi: '86वें संविधान संशोधन 2002 के द्वारा 6 से 14 वर्ष के बच्चों के लिए मुफ्त व अनिवार्य शिक्षा अनिवार्य की गई।',
  },
  {
    id: 'q_pol_3',
    topicId: 'polity_fr',
    subjectId: 'polity',
    questionEn: 'Which writ is issued by the court to inquire into the legality of the claim which a person asserts to a public office?',
    questionHi: 'किसी व्यक्ति के सार्वजनिक पद पर दावे की वैधता की जांच के लिए न्यायालय कौन-सी रिट जारी करता है?',
    optionsEn: ['Quo-Warranto', 'Mandamus', 'Certiorari', 'Prohibition'],
    optionsHi: ['अधिकार पृच्छा (Quo-Warranto)', 'परमादेश (Mandamus)', 'उत्प्रेषण (Certiorari)', 'प्रतिषेध (Prohibition)'],
    correctIndex: 0,
    explanationEn: 'Quo-Warranto translates to "By what authority or warrant" and prevents illegal usurpation of public office.',
    explanationHi: 'अधिकार पृच्छा (Quo-Warranto) का अर्थ है "किस अधिकार से", जो गैर-कानूनी तरीके से पद ग्रहण करने पर रोक लगाता है।',
  },
  {
    id: 'q_pol_4',
    topicId: 'polity_preamble',
    subjectId: 'polity',
    questionEn: 'Which words were added to the Preamble of the Indian Constitution through the 42nd Constitutional Amendment Act, 1976?',
    questionHi: '42वें संविधान संशोधन 1976 द्वारा प्रस्तावना में कौन से तीन नए शब्द जोड़े गए थे?',
    optionsEn: [
      'Socialist, Secular, and Integrity',
      'Sovereign, Democratic, Republic',
      'Justice, Liberty, Equality',
      'Fraternity, Unity, Secular'
    ],
    optionsHi: [
      'समाजवादी, पंथनिरपेक्ष और अखंडता',
      'संप्रभु, लोकतांत्रिक, गणराज्य',
      'न्याय, स्वतंत्रता, समता',
      'बंधुता, एकता, पंथनिरपेक्ष'
    ],
    correctIndex: 0,
    explanationEn: '42nd Amendment added "Socialist, Secular and Integrity" to the Preamble during the 1976 Emergency.',
    explanationHi: '42वें संशोधन द्वारा प्रस्तावना में "समाजवादी, पंथनिरपेक्ष और अखंडता" शब्द जोड़े गए थे।',
  },
  {
    id: 'q_pol_5',
    topicId: 'polity_president',
    subjectId: 'polity',
    questionEn: 'Under which Article of the Constitution can the President of India grant pardons, reprieves, respites or remissions?',
    questionHi: 'संविधान के किस अनुच्छेद के तहत भारत के राष्ट्रपति को क्षमादान, लघुकरण या निलंबन की शक्ति प्राप्त है?',
    optionsEn: ['Article 61', 'Article 72', 'Article 123', 'Article 143'],
    optionsHi: ['अनुच्छेद 61', 'अनुच्छेद 72', 'अनुच्छेद 123', 'अनुच्छेद 143'],
    correctIndex: 1,
    explanationEn: 'Article 72 empowers the President to grant pardons and suspend death sentences.',
    explanationHi: 'अनुच्छेद 72 के तहत राष्ट्रपति को मृत्युदंड सहित किसी भी सजा को क्षमा या कम करने का अधिकार है।',
  },

  // History questions
  {
    id: 'q_hist_1',
    topicId: 'hist_ancient',
    subjectId: 'history',
    questionEn: 'At which Indus Valley Civilization site was the famous "Great Bath" discovered?',
    questionHi: 'सिंधु घाटी सभ्यता के किस स्थल पर प्रसिद्ध "विशाल स्नानागार" (Great Bath) खोजा गया था?',
    optionsEn: ['Harappa', 'Mohenjo-daro', 'Lothal', 'Kalibangan'],
    optionsHi: ['हड़प्पा', 'मोहनजोदड़ो', 'लोथल', 'कालीबंगन'],
    correctIndex: 1,
    explanationEn: 'Mohenjo-daro (Mound of the Dead) in Sindh, Pakistan houses the Great Bath excavated by R.D. Banerjee.',
    explanationHi: 'विशाल स्नानागार मोहनजोदड़ो में मिला था, जिसकी खोज 1922 में राखालदास बनर्जी ने की थी।',
  },
  {
    id: 'q_hist_2',
    topicId: 'hist_ancient',
    subjectId: 'history',
    questionEn: 'Which Harappan port city is known for having an artificial tidal dockyard?',
    questionHi: 'कौन सा हड़प्पाकालीन बंदरगाह नगर कृत्रिम गोदीबाड़ा (Dockyard) के लिए प्रसिद्ध है?',
    optionsEn: ['Dholavira', 'Lothal', 'Rakhigarhi', 'Banawali'],
    optionsHi: ['धोलावीरा', 'लोथल', 'राखीगढ़ी', 'बनावली'],
    correctIndex: 1,
    explanationEn: 'Lothal in Gujarat (on Bhogava river) was a major trading port and maritime dockyard of Indus civilization.',
    explanationHi: 'गुजरात के लोथल में भोगवा नदी के तट पर सिंधु घाटी सभ्यता का प्रमुख बंदरगाह (गोदीबाड़ा) स्थित था।',
  },
  {
    id: 'q_hist_3',
    topicId: 'hist_modern',
    subjectId: 'history',
    questionEn: 'In which year did Mahatma Gandhi launch the famous Dandi March (Salt Satyagraha)?',
    questionHi: 'महात्मा गांधी ने प्रसिद्ध दांडी मार्च (नमक सत्याग्रह) किस वर्ष शुरू किया था?',
    optionsEn: ['1920', '1930', '1931', '1942'],
    optionsHi: ['1920', '1930', '1931', '1942'],
    correctIndex: 1,
    explanationEn: 'Dandi March began on 12 March 1930 from Sabarmati Ashram and concluded at Dandi on 6 April 1930.',
    explanationHi: 'दांडी यात्रा 12 मार्च 1930 को साबरमती से शुरू होकर 6 अप्रैल 1930 को दांडी में नमक कानून तोड़कर समाप्त हुई।',
  },
  {
    id: 'q_hist_4',
    topicId: 'hist_modern',
    subjectId: 'history',
    questionEn: 'Who presided over the historic Lahore Session of the Indian National Congress in 1929 where "Poorna Swaraj" was adopted?',
    questionHi: '1929 के ऐतिहासिक लाहौर अधिवेशन की अध्यक्षता किसने की थी जिसमें "पूर्ण स्वराज" का प्रस्ताव पारित हुआ?',
    optionsEn: ['Mahatma Gandhi', 'Subhash Chandra Bose', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel'],
    optionsHi: ['महात्मा गांधी', 'सुभाष चंद्र बोस', 'जवाहरलाल नेहरू', 'सरदार वल्लभभाई पटेल'],
    correctIndex: 2,
    explanationEn: 'Pt. Jawaharlal Nehru presided over the 1929 Lahore session where 26 January was marked as Independence Day.',
    explanationHi: '1929 के लाहौर अधिवेशन की अध्यक्षता जवाहरलाल नेहरू ने की तथा रावी नदी तट पर तिरंगा फहराया गया।',
  },

  // Geography questions
  {
    id: 'q_geo_1',
    topicId: 'geo_rivers',
    subjectId: 'geography',
    questionEn: 'Which river is known as "Dakshin Ganga" or "Ganga of South India"?',
    questionHi: 'किस नदी को "दक्षिण गंगा" या दक्षिण की गंगा के नाम से जाना जाता है?',
    optionsEn: ['Krishna', 'Godavari', 'Cauvery', 'Narmada'],
    optionsHi: ['कृष्णा', 'गोदावरी', 'कावेरी', 'नर्मदा'],
    correctIndex: 1,
    explanationEn: 'Godavari is the longest peninsular river (1465 km) and is called Dakshin Ganga or Vriddha Ganga.',
    explanationHi: 'गोदावरी प्रायद्वीपीय भारत की सबसे लंबी नदी (1465 किमी) है और इसे दक्षिण गंगा या वृद्ध गंगा कहते हैं।',
  },
  {
    id: 'q_geo_2',
    topicId: 'geo_parks',
    subjectId: 'geography',
    questionEn: 'Kaziranga National Park in Assam is world famous for which endangered species?',
    questionHi: 'असम का काजीरंगा राष्ट्रीय उद्यान किस संकटापन्न प्राणी के लिए विश्व प्रसिद्ध है?',
    optionsEn: ['Royal Bengal Tiger', 'One-horned Rhinoceros', 'Snow Leopard', 'Asiatic Lion'],
    optionsHi: ['रॉयल बंगाल टाइगर', 'एक सींग वाला गैंडा', 'हिम तेंदुआ', 'एशियाई शेर'],
    correctIndex: 1,
    explanationEn: 'Kaziranga hosts two-thirds of the world’s great one-horned rhinoceroses and is a UNESCO World Heritage Site.',
    explanationHi: 'काजीरंगा राष्ट्रीय उद्यान विश्व के दो-तिहाई एक सींग वाले गैंडों का प्राकृतिक आवास है।',
  },

  // General Science
  {
    id: 'q_sci_1',
    topicId: 'sci_bio_human',
    subjectId: 'science',
    questionEn: 'Deficiency of which Vitamin leads to Night Blindness (Nyctalopia)?',
    questionHi: 'किस विटामिन की कमी से रतौंधी (Night Blindness) रोग होता है?',
    optionsEn: ['Vitamin A', 'Vitamin B1', 'Vitamin C', 'Vitamin D'],
    optionsHi: ['विटामिन A', 'विटामिन B1', 'विटामिन C', 'विटामिन D'],
    correctIndex: 0,
    explanationEn: 'Vitamin A (Retinol) deficiency impairs Rhodopsin pigment formation leading to night blindness.',
    explanationHi: 'विटामिन A (रेटिनॉल) की कमी से आंखों में रोडोप्सिन वर्णक कम बनता है जिससे रतौंधी होती है।',
  },
  {
    id: 'q_sci_2',
    topicId: 'sci_phy_motion',
    subjectId: 'science',
    questionEn: 'What is the SI unit of electric potential difference (Voltage)?',
    questionHi: 'विद्युत विभवान्तर (Electric Potential Difference) का SI मात्रक क्या है?',
    optionsEn: ['Ampere', 'Watt', 'Volt', 'Ohm'],
    optionsHi: ['एम्पीयर', 'वाट', 'वोल्ट', 'ओम'],
    correctIndex: 2,
    explanationEn: 'Volt (V) is the SI unit of potential difference, named after Alessandro Volta.',
    explanationHi: 'विभवांतर का SI मात्रक वोल्ट (Volt) है, 1 वोल्ट = 1 जूल / 1 कूलॉम।',
  },

  // Quant & Maths
  {
    id: 'q_quant_1',
    topicId: 'quant_percent',
    subjectId: 'quant',
    questionEn: 'If the price of sugar increases by 25%, by what percent must a household reduce consumption to keep expenditure unchanged?',
    questionHi: 'यदि चीनी के मूल्य में 25% की वृद्धि हो जाए, तो गृहिणी को खपत में कितने प्रतिशत की कमी करनी होगी ताकि खर्च न बढ़े?',
    optionsEn: ['20%', '25%', '16.66%', '30%'],
    optionsHi: ['20%', '25%', '16.66%', '30%'],
    correctIndex: 0,
    explanationEn: 'Formula: [R / (100 + R)] × 100 = [25 / 125] × 100 = 20% reduction needed.',
    explanationHi: 'शॉर्ट ट्रिक: [R / (100 + R)] × 100 = [25 / 125] × 100 = 20% की कमी करनी होगी।',
  },
  {
    id: 'q_quant_2',
    topicId: 'quant_time_work',
    subjectId: 'quant',
    questionEn: 'A can do a piece of work in 12 days and B can do it in 24 days. Working together, in how many days will they complete the work?',
    questionHi: 'A किसी कार्य को 12 दिनों में तथा B 24 दिनों में कर सकता है। दोनों मिलकर उस कार्य को कितने दिनों में समाप्त करेंगे?',
    optionsEn: ['6 days', '8 days', '10 days', '16 days'],
    optionsHi: ['6 दिन', '8 दिन', '10 दिन', '16 दिन'],
    correctIndex: 1,
    explanationEn: 'Total Work = LCM(12, 24) = 24 units. Total efficiency = 2 + 1 = 3 units/day. Days = 24 / 3 = 8 days.',
    explanationHi: 'कुल कार्य = LCM(12, 24) = 24। A की क्षमता = 2, B की = 1। दोनों मिलकर = 24 / 3 = 8 दिन।',
  },

  // Reasoning
  {
    id: 'q_reas_1',
    topicId: 'reas_coding',
    subjectId: 'reasoning',
    questionEn: 'In a certain code, "DELHI" is written as "CCIDD". How will "BOMBAY" be written in that code?',
    questionHi: 'यदि किसी निश्चित कूट भाषा में "DELHI" को "CCIDD" लिखा जाता है, तो उसी कूट भाषा में "BOMBAY" को कैसे लिखा जाएगा?',
    optionsEn: ['AMJXVS', 'AMJZVS', 'AMLXVS', 'BMJXVT'],
    optionsHi: ['AMJXVS', 'AMJZVS', 'AMLXVS', 'BMJXVT'],
    correctIndex: 0,
    explanationEn: 'Pattern: Letters shifted by -1, -2, -3, -4, -5, -6 sequentially: B(-1)=A, O(-2)=M, M(-3)=J, B(-4)=X, A(-5)=V, Y(-6)=S.',
    explanationHi: 'पैटर्न: अक्षरों में क्रमशः -1, -2, -3, -4, -5, -6 की कमी हो रही है: B-1=A, O-2=M, M-3=J, B-4=X, A-5=V, Y-6=S = AMJXVS।',
  },

  // English
  {
    id: 'q_eng_1',
    topicId: 'eng_vocab',
    subjectId: 'english',
    questionEn: 'Choose the word that is nearest in meaning (Synonym) to: "CANDID"',
    questionHi: '"CANDID" शब्द का सबसे सटीक समानार्थी (Synonym) शब्द चुनें:',
    optionsEn: ['Secretive', 'Frank & Outspoken', 'Cruel', 'Deceptive'],
    optionsHi: ['Secretive (रहस्यमयी)', 'Frank & Outspoken (स्पष्टवादी)', 'Cruel (निर्दयी)', 'Deceptive (धोखेबाज)'],
    correctIndex: 1,
    explanationEn: 'Candid means truthful, open, straightforward and frank.',
    explanationHi: 'Candid का अर्थ होता है निष्कपट, खरा और स्पष्ट बोलने वाला (Frank/Straightforward)।',
  }
];

// Mock Tests configuration for SSC, Delhi Police, etc.
export const MOCK_TESTS: MockTest[] = [
  {
    id: 'mock_cgl_1',
    examId: 'cgl',
    title: 'SSC CGL 2026 Tier-1 Live Full Mock Test 1',
    subtitle: 'Based on Latest TCS Pattern & High-Yield Questions',
    durationMinutes: 60,
    totalMarks: 200,
    totalQuestions: 25, // Compact demonstration pack for lightning response
    positiveMarks: 2,
    negativeMarks: 0.5,
    free: true,
    sections: ['General Awareness', 'Quantitative Aptitude', 'Reasoning', 'English'],
    questions: [
      ...QUESTIONS_DATABASE,
      {
        id: 'q_mock_extra_1',
        examId: 'cgl',
        questionEn: 'Which is the oldest fold mountain range in India?',
        questionHi: 'भारत की सबसे प्राचीन वलित पर्वत श्रृंखला कौन सी है?',
        optionsEn: ['Himalayas', 'Aravalli Range', 'Satpura Range', 'Western Ghats'],
        optionsHi: ['हिमालय', 'अरावली पर्वतमाला', 'सतपुड़ा पर्वतमाला', 'पश्चिमी घाट'],
        correctIndex: 1,
        explanationEn: 'Aravalli range in Rajasthan/Delhi is one of the oldest geological fold mountain systems in the world.',
        explanationHi: 'अरावली पर्वत श्रृंखला भारत एवं विश्व की सबसे प्राचीन वलित पर्वत श्रृंखलाओं में से एक है।',
      },
      {
        id: 'q_mock_extra_2',
        examId: 'cgl',
        questionEn: 'Who is the custodian of the Constitution of India?',
        questionHi: 'भारत के संविधान का संरक्षक (कस्टोडियन) किसे माना जाता है?',
        optionsEn: ['The President', 'The Prime Minister', 'The Supreme Court of India', 'The Parliament'],
        optionsHi: ['राष्ट्रपति', 'प्रधानमंत्री', 'भारत का सर्वोच्च न्यायालय', 'संसद'],
        correctIndex: 2,
        explanationEn: 'The Supreme Court acts as the final interpreter and custodian of the Indian Constitution.',
        explanationHi: 'सर्वोच्च न्यायालय भारत के संविधान का अंतिम व्याख्याकार और मुख्य संरक्षक है।',
      },
      {
        id: 'q_mock_extra_3',
        examId: 'cgl',
        questionEn: 'What is the chemical name of "Baking Soda"?',
        questionHi: '"बेकिंग सोडा" (मीठा सोडा) का रासायनिक नाम क्या है?',
        optionsEn: ['Sodium Carbonate', 'Sodium Bicarbonate', 'Calcium Hydroxide', 'Sodium Chloride'],
        optionsHi: ['सोडियम कार्बोनेट', 'सोडियम बाइकार्बोनेट', 'कैल्शियम हाइड्रोक्साइड', 'सोडियम क्लोराइड'],
        correctIndex: 1,
        explanationEn: 'Sodium Bicarbonate (NaHCO3) is commonly known as Baking Soda.',
        explanationHi: 'सोडियम बाइकार्बोनेट (NaHCO3) को बेकिंग सोडा कहा जाता है, जबकि Na2CO3 धावन सोडा है।',
      }
    ]
  },
  {
    id: 'mock_delhi_police_1',
    examId: 'delhi_police',
    title: 'Delhi Police Constable Full Practice Mock Test 1',
    subtitle: 'GK + Reasoning + Computer & Numerical Ability Special',
    durationMinutes: 90,
    totalMarks: 100,
    totalQuestions: 20,
    positiveMarks: 1,
    negativeMarks: 0.25,
    free: true,
    sections: ['General Knowledge', 'Reasoning', 'Numerical Ability', 'Computer Fundamentals'],
    questions: [
      {
        id: 'dp_q_1',
        examId: 'delhi_police',
        questionEn: 'Under which Ministry does Delhi Police operate directly?',
        questionHi: 'दिल्ली पुलिस सीधे किस मंत्रालय के प्रशासनिक नियंत्रण में कार्य करती है?',
        optionsEn: ['Ministry of Defence', 'Ministry of Home Affairs (MHA)', 'Government of NCT Delhi', 'Ministry of Law'],
        optionsHi: ['रक्षा मंत्रालय', 'गृह मंत्रालय (MHA)', 'दिल्ली सरकार', 'विधि मंत्रालय'],
        correctIndex: 1,
        explanationEn: 'Delhi Police functions directly under the Ministry of Home Affairs (MHA), Government of India.',
        explanationHi: 'दिल्ली पुलिस केंद्र सरकार के गृह मंत्रालय (Ministry of Home Affairs) के अधीन कार्य करती है।',
      },
      {
        id: 'dp_q_2',
        examId: 'delhi_police',
        questionEn: 'What is the shortcut key in MS Excel to open the "Format Cells" dialog box?',
        questionHi: 'MS Excel में "Format Cells" डायलॉग बॉक्स खोलने की शॉर्टकट कुंजी क्या है?',
        optionsEn: ['Ctrl + F', 'Ctrl + 1', 'Alt + F4', 'Ctrl + Shift + F'],
        optionsHi: ['Ctrl + F', 'Ctrl + 1', 'Alt + F4', 'Ctrl + Shift + F'],
        correctIndex: 1,
        explanationEn: 'Pressing Ctrl + 1 immediately brings up the Format Cells window in Microsoft Excel.',
        explanationHi: 'माइक्रोसॉफ्ट एक्सेल में Ctrl + 1 दबाने से फॉर्मेट सेल्स विंडो खुलती है।',
      },
      ...QUESTIONS_DATABASE.slice(0, 10)
    ]
  },
  {
    id: 'mock_gd_1',
    examId: 'gd',
    title: 'SSC GD Constable All India Live Speed Test 1',
    subtitle: 'Border Security & Para-Military Force Target Series',
    durationMinutes: 60,
    totalMarks: 160,
    totalQuestions: 20,
    positiveMarks: 2,
    negativeMarks: 0.5,
    free: true,
    sections: ['General Intelligence', 'General Knowledge', 'Elementary Mathematics', 'Hindi/English'],
    questions: QUESTIONS_DATABASE.slice(0, 15)
  },
  {
    id: 'mock_mts_1',
    examId: 'mts',
    title: 'SSC MTS & Havaldar Session 1 & 2 Model Set 1',
    subtitle: 'Non-Technical Staff Examination Practice Set',
    durationMinutes: 90,
    totalMarks: 150,
    totalQuestions: 15,
    positiveMarks: 3,
    negativeMarks: 1,
    free: true,
    sections: ['Maths & Reasoning', 'General Awareness & English'],
    questions: QUESTIONS_DATABASE.slice(2, 14)
  },
  {
    id: 'mock_chsl_1',
    examId: 'chsl',
    title: 'SSC CHSL 10+2 Tier-1 Speed Booster Test',
    subtitle: 'DEO, LDC & JSA Targeted Questions with Solutions',
    durationMinutes: 60,
    totalMarks: 200,
    totalQuestions: 15,
    positiveMarks: 2,
    negativeMarks: 0.5,
    free: true,
    sections: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English'],
    questions: QUESTIONS_DATABASE.slice(0, 12)
  }
];

export const PDF_NOTES_LIBRARY: NoteItem[] = [
  {
    id: 'note_polity_golden',
    subjectId: 'polity',
    subjectName: 'Polity & Constitution',
    title: 'Top 100 Golden Articles & Amendments',
    description: 'Tabular summary of fundamental rights, emergency provisions & landmark amendments.',
    pagesCount: 14,
    fileSizeBytes: '2.4 MB',
    downloadFilename: 'StudyBull_Polity_Golden_Articles.pdf',
    tags: ['Polity', 'Constitution', 'Articles'],
    content: {
      chapter: 'Indian Constitution & Governance',
      sections: [
        {
          heading: '1. Preamble & Key Features',
          points: [
            'Adopted on 26th November 1949, Enforced on 26th January 1950.',
            '42nd Amendment Act 1976 added: Socialist, Secular, and Integrity.',
            'Borrowed features: Parliamentary System (UK), Fundamental Rights & Judicial Review (USA), DPSP (Ireland).'
          ],
          proTip: 'Exam Alert: Preamble is an integral part of the Constitution (Kesavananda Bharati case 1973).'
        },
        {
          heading: '2. Most Repeated Fundamental Rights (Art 12-35)',
          points: [
            'Article 14: Equality before law & equal protection of laws.',
            'Article 17: Abolition of Untouchability (Strictly absolute).',
            'Article 19: Protection of 6 fundamental freedoms.',
            'Article 21: Protection of life and personal liberty (Cannot be suspended even in emergency).',
            'Article 21A: Right to free & compulsory education (86th Amendment 2002).',
            'Article 32: Right to Constitutional Remedies - Heart & Soul of Constitution.'
          ],
          keyTable: {
            headers: ['Writ', 'Meaning', 'Issued For'],
            rows: [
              ['Habeas Corpus', 'To have the body of', 'Against illegal detention'],
              ['Mandamus', 'We Command', 'Directing public official to do duty'],
              ['Quo-Warranto', 'By what authority', 'Inquiring into legality of office claim'],
              ['Certiorari', 'To be certified', 'Quashing order of inferior court']
            ]
          }
        }
      ]
    }
  },
  {
    id: 'note_history_modern',
    subjectId: 'history',
    subjectName: 'History',
    title: 'Modern Indian History Timeline (1757 to 1947)',
    description: 'Chronological timeline from Battle of Plassey to Independence.',
    pagesCount: 18,
    fileSizeBytes: '3.1 MB',
    downloadFilename: 'StudyBull_History_Timeline.pdf',
    tags: ['History', 'Modern India', 'Freedom Movement'],
    content: {
      chapter: 'The Road to Freedom (1757 - 1947)',
      sections: [
        {
          heading: '1. Major British Battles & Treaties',
          points: [
            '1757: Battle of Plassey (Robert Clive defeated Siraj-ud-Daulah).',
            '1764: Battle of Buxar (British defeated Mir Qasim & allies).',
            '1765: Treaty of Allahabad (Dual Government in Bengal).',
            '1857: Great Revolt started at Meerut on 10th May 1857.'
          ],
          proTip: 'Order: Plassey (1757) -> Buxar (1764) -> Allahabad (1765).'
        },
        {
          heading: '2. Gandhian Mass Movements',
          points: [
            '1917: Champaran Satyagraha (First Civil Disobedience).',
            '1918: Kheda Satyagraha & Ahmedabad Mill Strike.',
            '1920-22: Non-Cooperation Movement (Withdrawn after Chauri Chaura).',
            '1930: Civil Disobedience Movement (Dandi Salt March).',
            '1942: Quit India Movement (8 August 1942, "Do or Die").'
          ]
        }
      ]
    }
  },
  {
    id: 'note_geo_rivers',
    subjectId: 'geography',
    subjectName: 'Geography',
    title: 'Indian Rivers, Dams & Physical Geography',
    description: 'Himalayan and Peninsular river systems, major multipurpose dams and origin points.',
    pagesCount: 15,
    fileSizeBytes: '2.1 MB',
    downloadFilename: 'StudyBull_Geography_Rivers_Dams.pdf',
    tags: ['Geography', 'Rivers', 'Dams'],
    content: {
      chapter: 'Drainage System of India',
      sections: [
        {
          heading: '1. Major River Origins & Lengths',
          points: [
            'Ganga: Originates from Gangotri Glacier (Bhagirathi), 2525 km (Longest in India).',
            'Godavari: Originates from Trimbakeshwar (Maharashtra), 1465 km (Dakshin Ganga).',
            'Narmada: Originates from Amarkantak (MP), flows West through Rift Valley into Arabian Sea.',
            'Tapi: Originates from Multai (Betul, MP), flows West into Gulf of Khambhat.'
          ]
        },
        {
          heading: '2. Multipurpose River Valley Projects',
          points: [
            'Tehri Dam: Bhagirathi River (Uttarakhand) - Highest dam in India (260.5 m).',
            'Bhakra Nangal Dam: Sutlej River (Himachal/Punjab) - Highest gravity dam.',
            'Hirakud Dam: Mahanadi River (Odisha) - Longest earthen dam in India (25.8 km).',
            'Sardar Sarovar Dam: Narmada River (Gujarat).'
          ]
        }
      ]
    }
  },
  {
    id: 'note_science_booster',
    subjectId: 'science',
    subjectName: 'General Science',
    title: 'General Science 500 High-Yield Facts & Formulae',
    description: 'Human Biology glands, vitamins & deficiency diseases, Physics formulas & Chemistry ores.',
    pagesCount: 12,
    fileSizeBytes: '1.9 MB',
    downloadFilename: 'StudyBull_General_Science.pdf',
    tags: ['Science', 'Biology', 'Physics', 'Chemistry'],
    content: {
      chapter: 'Everyday Science High-Frequency Facts',
      sections: [
        {
          heading: '1. Human Nutrition & Vitamins',
          points: [
            'Fat Soluble: Vitamin A, D, E, K (Stored in Liver).',
            'Water Soluble: Vitamin B-Complex & C (Excreted in urine).',
            'Universal Donor: O Negative (O-); Universal Acceptor: AB Positive (AB+).',
            'Insulin is produced by Beta cells of Islets of Langerhans in Pancreas.'
          ],
          keyTable: {
            headers: ['Vitamin', 'Chemical Name', 'Deficiency Disease'],
            rows: [
              ['Vitamin A', 'Retinol', 'Night blindness (Nyctalopia)'],
              ['Vitamin B1', 'Thiamine', 'Beriberi'],
              ['Vitamin C', 'Ascorbic Acid', 'Scurvy'],
              ['Vitamin D', 'Calciferol', 'Rickets (Kids), Osteomalacia']
            ]
          }
        },
        {
          heading: '2. Physics & Chemistry Important Facts',
          points: [
            'Speed of Light: 3 × 10^8 m/s in vacuum.',
            'Total Internal Reflection: Principle of Optical Fibres and Mirage.',
            'Baking Soda: Sodium Bicarbonate (NaHCO3).',
            'Washing Soda: Sodium Carbonate (Na2CO3·10H2O).'
          ]
        }
      ]
    }
  },
  {
    id: 'note_maths_tricks',
    subjectId: 'quant',
    subjectName: 'Maths (Quant)',
    title: 'Maths Shortcut Tricks & Golden Formula Hand-Book',
    description: 'Percentage fraction conversions, Speed Time Distance rules & Algebra identities.',
    pagesCount: 16,
    fileSizeBytes: '2.8 MB',
    downloadFilename: 'StudyBull_Maths_Shortcuts.pdf',
    tags: ['Maths', 'Aptitude', 'Arithmetic'],
    content: {
      chapter: 'Speed Math & Arithmetic Quick Revision',
      sections: [
        {
          heading: '1. Percentage Fraction Table',
          points: [
            '1/2 = 50% | 1/3 = 33.33% | 1/4 = 25% | 1/5 = 20%',
            '1/6 = 16.66% | 1/7 = 14.28% | 1/8 = 12.5% | 1/9 = 11.11%',
            '1/11 = 9.09% | 1/12 = 8.33% | 1/16 = 6.25%'
          ],
          proTip: 'Fraction conversion solves profit-loss and interest questions mentally!'
        },
        {
          heading: '2. Train, Speed & Distance Rules',
          points: [
            'km/h to m/s: Multiply by 5/18.',
            'm/s to km/h: Multiply by 18/5.',
            'Two trains opposite direction: Relative Speed = S1 + S2.',
            'Two trains same direction: Relative Speed = |S1 - S2|.'
          ]
        }
      ]
    }
  },
  {
    id: 'note_reasoning_tricks',
    subjectId: 'reasoning',
    subjectName: 'Reasoning',
    title: 'Logical Reasoning & Coding Short Tricks',
    description: 'Alphabet reverse pairs (AZ, BY, CX), Blood relation symbols & Syllogism Venn rules.',
    pagesCount: 11,
    fileSizeBytes: '1.7 MB',
    downloadFilename: 'StudyBull_Reasoning_Tricks.pdf',
    tags: ['Reasoning', 'Coding', 'Syllogism'],
    content: {
      chapter: 'General Intelligence & Reasoning Formulae',
      sections: [
        {
          heading: '1. Alphabet Opposite Pairs Trick (EJOTY)',
          points: [
            'EJOTY formula: E=5, J=10, O=15, T=20, Y=25.',
            'Opposite Letter mnemonic: A-Z (Azad), B-Y (Boy), C-X (Crux), D-W (Dew), E-V (Evening), F-U (Fun), G-T (GT Road), H-S (High School), I-R (Indian Railway), J-Q (Jungle Queen), K-P (Kanpur), L-O (Love), M-N (Man).'
          ]
        },
        {
          heading: '2. Direction Sense & Clocks',
          points: [
            'Angle between hands of clock at H:M = |(30H - 11/2 M)| degrees.',
            'Mirror image of clock: Subtract from 11:60 or 23:60.',
            'Pythagoras theorem for shortest distance: D = √(Base² + Height²).'
          ]
        }
      ]
    }
  },
  {
    id: 'note_english_rules',
    subjectId: 'english',
    subjectName: 'English',
    title: 'Top 100 Golden Grammar Rules & Common Errors',
    description: 'Subject-Verb agreement, Preposition rules, Conditionals & High-frequency Vocab.',
    pagesCount: 13,
    fileSizeBytes: '1.8 MB',
    downloadFilename: 'StudyBull_English_Grammar_Rules.pdf',
    tags: ['English', 'Grammar', 'Vocab'],
    content: {
      chapter: 'English Grammar Rules for SSC Exams',
      sections: [
        {
          heading: '1. Subject-Verb Agreement Essentials',
          points: [
            'Neither...nor, Either...or: Verb agrees with the nearest subject.',
            'Along with, Together with, As well as: Verb agrees with the FIRST subject.',
            'Each, Every, Either, Neither, Everyone, Somebody: Always take SINGULAR verb.',
            'One of the + Plural Noun + Singular Verb (e.g. One of the boys is absent).'
          ]
        },
        {
          heading: '2. High-Frequency One Word Substitutions',
          points: [
            'Omniscient: One who knows everything.',
            'Omnipotent: One who is all-powerful.',
            'Infallible: One who never makes mistakes.',
            'Altruist: One who works for the welfare of others.'
          ]
        }
      ]
    }
  },
  {
    id: 'note_economics_budget',
    subjectId: 'economics',
    subjectName: 'Indian Economy',
    title: 'Indian Economy, RBI & Budget Handbook',
    description: 'Fiscal vs Monetary policy, Repo Rate, Reverse Repo, Inflation & Five Year Plans.',
    pagesCount: 10,
    fileSizeBytes: '1.5 MB',
    downloadFilename: 'StudyBull_Economics_Handbook.pdf',
    tags: ['Economics', 'RBI', 'Budget'],
    content: {
      chapter: 'Banking, RBI & Macroeconomics',
      sections: [
        {
          heading: '1. RBI & Monetary Policy Instruments',
          points: [
            'RBI was established on 1 April 1935 under RBI Act 1934 on recommendation of Hilton Young Commission.',
            'Repo Rate: Rate at which RBI lends short-term funds to commercial banks against government securities.',
            'Reverse Repo Rate: Rate at which RBI absorbs liquidity from commercial banks.',
            'Cash Reserve Ratio (CRR): Percentage of deposits banks must keep with RBI in cash form.'
          ]
        },
        {
          heading: '2. National Income & Taxes',
          points: [
            'Direct Taxes: Income Tax, Corporate Tax, Capital Gains Tax.',
            'Indirect Taxes: GST (Goods & Services Tax - 101st Constitutional Amendment 2016).',
            'GST Slabs: 0%, 5%, 12%, 18%, 28%.'
          ]
        }
      ]
    }
  }
];

export const TYPING_PASSAGES: TypingPassage[] = [
  {
    id: 'ssc_dest_1',
    title: 'SSC CGL / CHSL DEST Pattern Passage 1',
    category: 'SSC DEST',
    content: 'The Constitution of India is the supreme law of India. The document lays down the framework that demarcates fundamental political code, structure, procedures, powers, and duties of government institutions and sets out fundamental rights, directive principles, and the duties of citizens. It is the longest written national constitution in the world. Dr. B.R. Ambedkar was the chairman of the drafting committee. The constitution declares India a sovereign, socialist, secular, and democratic republic, assuring its citizens justice, equality, and liberty.',
    wordCount: 88,
  },
  {
    id: 'dp_police_1',
    title: 'Delhi Police Head Constable Special Passage',
    category: 'Police HC',
    content: 'Law and order are essential components for the peaceful development of any civilized society. Police departments are entrusted with the solemn duty of safeguarding life, liberty, and property of citizens. Modern policing demands not only physical courage but also empathy, technical aptitude, and sound legal understanding. Effective traffic management and community policing ensure safety in urban centres.',
    wordCount: 66,
  },
  {
    id: 'digital_india_1',
    title: 'Digital Governance & Public Administration',
    category: 'General',
    content: 'Digital governance has revolutionized public service delivery across India. Through Aadhaar, Unified Payments Interface, and direct benefit transfers, public schemes have eliminated leakages and empowered millions of households. Modern examinations utilize computer based testing systems to guarantee transparency, fairness, and prompt declaration of evaluation results.',
    wordCount: 52,
  }
];

