export function enhanceSubstrate(data) {
  const { topics, proposals, actors, events, decisions } = data;

  // A. Topic clustering
  topics.forEach(t => {
    t.related_topics = topics
      .filter(o => o.id !== t.id && o.tags?.some(tag => t.tags?.includes(tag)))
      .map(o => o.id);
  });

  // B. Actor influence mapping
  actors.forEach(a => {
    a.influence = {
      proposals: proposals.filter(p => p.author === a.id).length,
      comments: data.comments.filter(c => c.author === a.id).length,
      votes: data.votes.filter(v => v.voter === a.id).length,
      events: events.filter(e => e.participants?.includes(a.id)).length
    };
  });

  // C. Process timeline synthesis
  proposals.forEach(p => {
    const d = decisions.find(x => x.proposal === p.id);
    p.timeline = {
      created: p.created_at,
      decided: d?.timestamp || null
    };
  });

  // D. WCO slot synthesis
  proposals.forEach(p => {
    if (p.tags?.includes("wco")) {
      p.wco_slot = `slot-${p.topic}`;
    }
  });

  return data;
}
