// substrate/engine/linker.js

export function linkSubstrate(data) {
  const {
    topics = [],
    proposals = [],
    processes = [],
    decisions = [],
    comments = [],
    actors = []
  } = data;

  // Indexes for fast lookup
  const topicById = Object.fromEntries(topics.map(t => [t.id, t]));
  const actorById = Object.fromEntries(actors.map(a => [a.id, a]));

  // 1. Link proposals → topics
  proposals.forEach(p => {
    if (!topicById[p.topic]) {
      // auto-create topic if missing
      const newTopic = {
        id: p.topic,
        title: `Auto Topic for ${p.title}`,
        summary: "",
        tags: ["auto"]
      };
      topics.push(newTopic);
      topicById[newTopic.id] = newTopic;
    }
  });

  // 2. Link proposals → actors
  proposals.forEach(p => {
    if (!actorById[p.author]) {
      const newActor = {
        id: p.author,
        name: `Unknown Actor ${p.author}`,
        roles: ["auto"]
      };
      actors.push(newActor);
      actorById[newActor.id] = newActor;
    }
  });

  // 3. Link comments → proposals + actors
  comments.forEach(c => {
    if (!actorById[c.author]) {
      actors.push({
        id: c.author,
        name: `Unknown Actor ${c.author}`,
        roles: ["auto"]
      });
    }
  });

  // 4. Link decisions → proposals
  decisions.forEach(d => {
    const proposal = proposals.find(p => p.id === d.proposal);
    if (proposal) {
      proposal.decision = d.id;
    }
  });

  return {
    topics,
    proposals,
    processes,
    decisions,
    comments,
    actors
  };
}
