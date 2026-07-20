/**
 * Instinct vs Insight — Scenario Bank
 * 42 real-world scenarios that trigger gut reactions across 10 life categories.
 * Each scenario has 2-3 tap-able response options.
 */

export const INSTINCT_SCENARIOS = [
  // CONFLICT
  { id: 1, text: "Someone criticizes your work in front of others. Your first instinct?", options: ["Defend myself immediately", "Shut down and go quiet", "Get angry"], category: "Conflict" },
  { id: 2, text: "A friend cancels on you last-minute, again. Your first instinct?", options: ["Assume they don't value me", "Get irritated but say nothing", "Call them out"], category: "Conflict" },
  { id: 3, text: "Someone takes credit for your idea. Your first instinct?", options: ["Say something right now", "Let it go, it's not worth it", "Feel resentful and stew"], category: "Conflict" },
  { id: 4, text: "You're interrupted mid-sentence in a meeting. Your first instinct?", options: ["Assume my input doesn't matter", "Talk louder to be heard", "Let it go"], category: "Conflict" },
  { id: 5, text: "Someone disagrees with you strongly in front of others. Your first instinct?", options: ["Prove I'm right", "Go quiet to avoid escalation", "Feel embarrassed"], category: "Conflict" },

  // MONEY
  { id: 6, text: "An unexpected bill arrives. Your first instinct?", options: ["Panic about money", "Get frustrated at myself", "Immediately problem-solve"], category: "Money" },
  { id: 7, text: "You see someone succeeding financially where you're not. Your first instinct?", options: ["Feel behind", "Feel motivated", "Feel resentful"], category: "Money" },
  { id: 8, text: "You have to say no to something because of budget. Your first instinct?", options: ["Feel embarrassed", "Feel responsible and mature", "Feel resentful about money"], category: "Money" },
  { id: 9, text: "A big expense comes up that you didn't plan for. Your first instinct?", options: ["Assume I'll never get ahead", "Trust I'll figure it out", "Blame myself for not saving more"], category: "Money" },
  { id: 10, text: "Someone asks to borrow money from you. Your first instinct?", options: ["Say yes even if I shouldn't", "Feel guilty saying no", "Set a clear boundary calmly"], category: "Money" },

  // SELF-WORTH
  { id: 11, text: "You make a visible mistake at work. Your first instinct?", options: ["I'm not good enough", "Everyone's watching me fail", "This is just one moment"], category: "Self-Worth" },
  { id: 12, text: "You don't hear back after a big opportunity. Your first instinct?", options: ["I wasn't good enough", "Their loss", "Something better is coming"], category: "Self-Worth" },
  { id: 13, text: "Someone doesn't respond to your text for hours. Your first instinct?", options: ["They're upset with me", "They're busy", "I did something wrong"], category: "Self-Worth" },
  { id: 14, text: "You receive praise for something you did. Your first instinct?", options: ["Deflect it, it's not a big deal", "Feel like a fraud", "Simply say thank you"], category: "Self-Worth" },
  { id: 15, text: "You compare your progress to where you thought you'd be by now. Your first instinct?", options: ["I'm behind", "I'm exactly where I need to be", "I've wasted time"], category: "Self-Worth" },

  // RELATIONSHIPS
  { id: 16, text: "Your partner seems distant tonight. Your first instinct?", options: ["Assume it's about me", "Ask what's wrong", "Withdraw too"], category: "Relationships" },
  { id: 17, text: "A family member gives unsolicited advice. Your first instinct?", options: ["Get defensive", "Feel judged", "Brush it off"], category: "Relationships" },
  { id: 18, text: "Someone you trust lets you down. Your first instinct?", options: ["I can't rely on anyone", "This is disappointing but not everything", "It's my fault for trusting them"], category: "Relationships" },
  { id: 19, text: "A friend shares something that hurts your feelings, without meaning to. Your first instinct?", options: ["Say nothing and let it build", "Address it calmly", "Assume they don't care about my feelings"], category: "Relationships" },
  { id: 20, text: "Someone you love needs space right now. Your first instinct?", options: ["Feel rejected", "Give them room", "Chase for reassurance"], category: "Relationships" },

  // OPPORTUNITY
  { id: 21, text: "A new opportunity feels exciting but risky. Your first instinct?", options: ["Play it safe", "Jump in", "Overthink it for days"], category: "Opportunity" },
  { id: 22, text: "You're offered something bigger than you feel ready for. Your first instinct?", options: ["I'm not ready", "I'll figure it out", "This is a mistake"], category: "Opportunity" },
  { id: 23, text: "A plan you were excited about falls through. Your first instinct?", options: ["This always happens to me", "Something else will open up", "I should have known better"], category: "Opportunity" },
  { id: 24, text: "You have to pitch or advocate for yourself. Your first instinct?", options: ["Downplay what I bring", "Own it confidently", "Avoid it if possible"], category: "Opportunity" },
  { id: 25, text: "You're asked to lead something for the first time. Your first instinct?", options: ["I'm not qualified for this", "This is my moment", "I'll probably mess it up"], category: "Opportunity" },

  // FAMILY
  { id: 26, text: "A parent or sibling questions a decision you made. Your first instinct?", options: ["Doubt myself immediately", "Explain calmly and hold my ground", "Get defensive"], category: "Family" },
  { id: 27, text: "You have to set a boundary with a family member. Your first instinct?", options: ["Feel guilty even thinking about it", "Set it clearly and kindly", "Avoid the conversation entirely"], category: "Family" },
  { id: 28, text: "An old family pattern shows up again at a gathering. Your first instinct?", options: ["Fall right back into the old role", "Notice it and choose differently", "Get frustrated and shut down"], category: "Family" },
  { id: 29, text: "Someone in your family compares you to a sibling or relative. Your first instinct?", options: ["Feel like I don't measure up", "That's their perception, not my truth", "Get competitive"], category: "Family" },
  { id: 30, text: "You disappoint a family member by choosing yourself. Your first instinct?", options: ["Feel like a bad person", "Feel okay honoring my own needs", "Overexplain myself"], category: "Family" },

  // CAREER
  { id: 31, text: "You're passed over for a promotion or opportunity. Your first instinct?", options: ["I'm not valued here", "This isn't the end of the story", "I should have worked harder"], category: "Career" },
  { id: 32, text: "You have to give feedback that might not be well received. Your first instinct?", options: ["Avoid saying anything", "Say it clearly and kindly", "Soften it until it means nothing"], category: "Career" },
  { id: 33, text: "A coworker seems to be advancing faster than you. Your first instinct?", options: ["I'm falling behind", "Their path isn't my path", "I need to compete harder"], category: "Career" },
  { id: 34, text: "You make a decision at work that doesn't go as planned. Your first instinct?", options: ["I shouldn't have trusted my judgment", "I'll learn and adjust", "Everyone probably noticed"], category: "Career" },
  { id: 35, text: "You're asked a question in a meeting you don't know the answer to. Your first instinct?", options: ["I look incompetent", "It's okay to say I'll find out", "Panic and guess"], category: "Career" },

  // COMPARISON & SOCIAL MEDIA
  { id: 36, text: "You scroll past someone's highlight-reel life update. Your first instinct?", options: ["My life isn't measuring up", "Their story isn't my story", "Feel a pang of envy"], category: "Comparison" },
  { id: 37, text: "A post gets far less engagement than you hoped. Your first instinct?", options: ["No one cares what I have to say", "That's not the point of putting it out there", "Feel embarrassed"], category: "Comparison" },
  { id: 38, text: "You see someone your age hitting a milestone you haven't. Your first instinct?", options: ["I'm behind schedule", "Everyone's timeline is different", "Feel pressure to catch up"], category: "Comparison" },

  // TIME & PRESSURE
  { id: 39, text: "You fall behind on something you committed to. Your first instinct?", options: ["I've failed", "I'll adjust the plan, not abandon it", "Feel overwhelmed and shut down"], category: "Pressure" },
  { id: 40, text: "You have way more on your plate than time allows today. Your first instinct?", options: ["Try to do it all anyway", "Decide what actually matters most", "Feel like I'm already behind"], category: "Pressure" },

  // HEALTH & BODY
  { id: 41, text: "You miss a workout or healthy habit you'd committed to. Your first instinct?", options: ["I've ruined my progress", "One miss doesn't erase the pattern", "Feel like giving up entirely"], category: "Health" },
  { id: 42, text: "You don't feel good in your body today. Your first instinct?", options: ["Something is wrong with me", "This is temporary, not permanent", "Feel frustrated at myself"], category: "Health" },
];

export function pickRandomScenarios(count = 5, excludeIds = []) {
  const pool = INSTINCT_SCENARIOS.filter(s => !excludeIds.includes(s.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}