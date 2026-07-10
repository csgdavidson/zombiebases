(function () {
  const axes = ['defence', 'isolation', 'sustainability', 'resources', 'community', 'complexity', 'access'];

  const questions = [
    { id: 'group_size', prompt: "What's your ideal group size?", answers: [
      { id: 'solo', label: 'Just me', weights: { isolation: 3, access: 1, community: -1 } },
      { id: 'small', label: '2–5 people', weights: { defence: 1, resources: 1, isolation: 2 } },
      { id: 'community', label: 'Small community (6–20)', weights: { community: 3, sustainability: 2, resources: 1 } },
      { id: 'settlement', label: 'Large settlement (20+)', weights: { community: 4, defence: 2, sustainability: 1, access: 1 } }
    ]},
    { id: 'first_priority', prompt: 'The outbreak starts tomorrow. What comes first?', answers: [
      { id: 'lockdown', label: 'Secure a defensible perimeter', weights: { defence: 4, community: 1 } },
      { id: 'vanish', label: 'Get far away from population centres', weights: { isolation: 4, access: -1 } },
      { id: 'supplies', label: 'Find food, water and medical supplies', weights: { resources: 4, sustainability: 1 } },
      { id: 'rally', label: 'Gather trusted people and skills', weights: { community: 4, sustainability: 1 } }
    ]},
    { id: 'preferred_isolation', prompt: 'How isolated should your base be?', answers: [
      { id: 'nearby', label: 'Near enough to salvage runs', weights: { access: 3, resources: 1, isolation: -1 } },
      { id: 'regional', label: 'Remote, but reachable by road or boat', weights: { isolation: 2, access: 1, resources: 1 } },
      { id: 'extreme', label: 'Extremely remote with few approach routes', weights: { isolation: 4, defence: 1, access: -2 } },
      { id: 'hidden', label: 'Hidden even if travel is difficult', weights: { isolation: 3, defence: 2, complexity: 1 } }
    ]},
    { id: 'zombie_strategy', prompt: 'What matters most against zombies?', answers: [
      { id: 'walls', label: 'Strong walls and chokepoints', weights: { defence: 4 } },
      { id: 'distance', label: 'So much distance they rarely arrive', weights: { isolation: 4 } },
      { id: 'visibility', label: 'High ground and early warning', weights: { defence: 2, isolation: 1 } },
      { id: 'mobility', label: 'Multiple escape and fallback options', weights: { access: 3, resources: 1 } }
    ]},
    { id: 'food_water', prompt: 'Which resource plan feels safest?', answers: [
      { id: 'farms', label: 'Reliable food production', weights: { sustainability: 4, community: 1 } },
      { id: 'freshwater', label: 'Fresh water security above all', weights: { resources: 4, sustainability: 1 } },
      { id: 'stockpile', label: 'Large stockpiles and salvage access', weights: { resources: 3, access: 2 } },
      { id: 'mixed', label: 'A mix of farming, fishing and storage', weights: { sustainability: 2, resources: 3 } }
    ]},
    { id: 'base_type', prompt: 'Which base type instinctively fits you?', answers: [
      { id: 'fortress', label: 'Fortress', weights: { defence: 4, community: 1 }, typeAffinity: { fortified_structure: 3, institutional_compound: 1 } },
      { id: 'island', label: 'Island', weights: { isolation: 4, resources: 1 }, typeAffinity: { isolated_landmass: 3 } },
      { id: 'remote_settlement', label: 'Remote settlement', weights: { sustainability: 3, community: 3 }, typeAffinity: { remote_settlement: 3 } },
      { id: 'underground', label: 'Underground', weights: { defence: 2, isolation: 2, complexity: 3 }, typeAffinity: { subterranean: 3, industrial_site: 1 } }
    ]},
    { id: 'technical_complexity', prompt: 'How much technical complexity will you accept?', answers: [
      { id: 'low', label: 'Low-tech and easy to maintain', weights: { sustainability: 2, complexity: -2, community: 1 } },
      { id: 'medium', label: 'Some systems if they add resilience', weights: { resources: 2, complexity: 1 } },
      { id: 'high', label: 'Complex infrastructure is worth it', weights: { complexity: 4, defence: 1, resources: 1 } },
      { id: 'expert', label: 'I want engineered protection', weights: { complexity: 5, defence: 2 } }
    ]},
    { id: 'travel', prompt: 'You have one chance to leave. How far will you travel?', answers: [
      { id: 'country', label: 'Stay in my country', weights: { access: 3, community: 1 } },
      { id: 'continent', label: 'Anywhere in my region', weights: { access: 1, resources: 1 } },
      { id: 'world', label: 'Anywhere in the world', weights: { isolation: 2, resources: 1 } },
      { id: 'distance', label: "Distance doesn't matter if survival improves", weights: { isolation: 3, sustainability: 1, access: -1 } }
    ]},
    { id: 'climate_tradeoff', prompt: 'What climate trade-off can you tolerate?', answers: [
      { id: 'temperate', label: 'Temperate and farmable', weights: { sustainability: 3, resources: 2 } },
      { id: 'cold', label: 'Cold if it lowers threat pressure', weights: { isolation: 2, defence: 1 } },
      { id: 'hot', label: 'Hot or dry if water is secured', weights: { resources: 3, isolation: 1 } },
      { id: 'any', label: 'Any climate with strong shelter', weights: { defence: 2, complexity: 1 } }
    ]},
    { id: 'biggest_tradeoff', prompt: 'Which advantage would you choose if you could only have one?', answers: [
      { id: 'strong_walls', label: 'Strong walls', weights: { defence: 5 } },
      { id: 'better_resources', label: 'Better resources', weights: { resources: 4, sustainability: 1 } },
      { id: 'greater_isolation', label: 'Greater isolation', weights: { isolation: 5 } },
      { id: 'easier_access', label: 'Easier access', weights: { access: 4, community: 1 } }
    ]},
    { id: 'long_term_goal', prompt: "What's your long-term goal?", answers: [
      { id: 'month', label: 'Survive one month', weights: { defence: 3, resources: 2 } },
      { id: 'year', label: 'Survive one year', weights: { resources: 3, sustainability: 2 } },
      { id: 'permanent', label: 'Build a permanent community', weights: { sustainability: 4, community: 3 } },
      { id: 'rebuild', label: 'Rebuild civilisation', weights: { community: 4, sustainability: 3, complexity: 1 } }
    ]},
    { id: 'final_priority', prompt: 'Final priority: what should the match optimise for?', answers: [
      { id: 'defence', label: 'Defence', weights: { defence: 5 } },
      { id: 'isolation', label: 'Isolation', weights: { isolation: 5 } },
      { id: 'sustainability', label: 'Sustainability', weights: { sustainability: 5, resources: 1 } },
      { id: 'flexibility', label: 'Flexibility', weights: { access: 2, resources: 2, community: 1 } }
    ]}
  ];

  window.quizQuestions = { axes, questions };
})();
