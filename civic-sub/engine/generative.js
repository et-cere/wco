// substrate/engine/generative.js

export function generateSubstrate(data) {
  const {
    topics = [],
    proposals = [],
    processes = [],
    decisions = [],
    comments = [],
    actors = [],
    events = [],
    votes = [],
    petitions = [],
    amendments = [],
    budget = [],
    documents = [],
    wco = {}
  } = data;

  // Indexes
  const byId = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));
  const topicById = byId(topics);
  const actorById = byId(actors);
  const proposalById = byId(proposals);
  const processById = byId(processes);
  const decisionById = byId(decisions);

  // Utility: ensure object exists
  function ensure(collection, id, template) {
    if (!collection.find(x => x.id === id)) {
      const obj = template(id);
      collection.push(obj);
      return obj;
    }
    return collection.find(x => x.id === id);
  }

  // -------------------------------
  // 1. Link proposals → topics
  // -------------------------------
  proposals.forEach(p => {
    if (!topicById[p.topic]) {
      const t = {
        id: p.topic,
        title: `Auto Topic for ${p.title}`,
        summary: "",
        tags: ["auto", "inferred"]
      };
      topics.push(t);
      topicById[t.id] = t;
    }
  });

  // -------------------------------
  // 2. Link proposals → authors
  // -------------------------------
  proposals.forEach(p => {
    if (!actorById[p.author]) {
      const a = {
        id: p.author,
        name: `Unknown Actor ${p.author}`,
        roles: ["auto", "inferred"]
      };
      actors.push(a);
      actorById[a.id] = a;
    }
  });

  // -------------------------------
  // 3. Link comments → proposals + actors
  // -------------------------------
  comments.forEach(c => {
    if (!proposalById[c.proposal]) {
      ensure(proposals, c.proposal, (id) => ({
        id,
        title: `Auto Proposal ${id}`,
        summary: "",
        status: "auto",
        author: "actor-unknown",
        topic: "topic-unknown",
        created_at: null,
        tags: ["auto", "inferred"]
      }));
    }

    if (!actorById[c.author]) {
      ensure(actors, c.author, (id) => ({
        id,
        name: `Unknown Actor ${id}`,
        roles: ["auto", "inferred"]
      }));
    }
  });

  // -------------------------------
  // 4. Link decisions → proposals
  // -------------------------------
  decisions.forEach(d => {
    const p = proposalById[d.proposal];
    if (p) {
      p.decision = d.id;
    }
  });

  // -------------------------------
  // 5. Link processes → proposals
  // -------------------------------
  processes.forEach(proc => {
    proc.steps?.forEach(stepId => {
      const step = ensure(processes, stepId, (id) => ({
        id,
        title: `Auto Step ${id}`,
        type: "step",
        tags: ["auto", "inferred"]
      }));
      step.parent_process = proc.id;
    });

    if (proc.proposal && proposalById[proc.proposal]) {
      proposalById[proc.proposal].process = proc.id;
    }
  });

  // -------------------------------
  // 6. Link events → actors + processes
  // -------------------------------
  events.forEach(e => {
    e.participants?.forEach(aid => {
      if (!actorById[aid]) {
        ensure(actors, aid, (id) => ({
          id,
          name: `Unknown Actor ${id}`,
          roles: ["auto", "inferred"]
        }));
      }
    });

    if (e.process && processById[e.process]) {
      processById[e.process].events = processById[e.process].events || [];
      processById[e.process].events.push(e.id);
    }
  });

  // -------------------------------
  // 7. Link votes → decisions + actors
  // -------------------------------
  votes.forEach(v => {
    if (!decisionById[v.decision]) {
      ensure(decisions, v.decision, (id) => ({
        id,
        proposal: null,
        outcome: "auto",
        timestamp: null,
        tags: ["auto", "inferred"]
      }));
    }

    if (!actorById[v.voter]) {
      ensure(actors, v.voter, (id) => ({
        id,
        name: `Unknown Actor ${id}`,
        roles: ["auto", "inferred"]
      }));
    }
  });

  // -------------------------------
  // 8. Link petitions → topics
  // -------------------------------
  petitions.forEach(p => {
    if (!topicById[p.topic]) {
      ensure(topics, p.topic, (id) => ({
        id,
        title: `Auto Topic ${id}`,
        summary: "",
        tags: ["auto", "inferred"]
      }));
    }
  });

  // -------------------------------
  // 9. Link amendments → proposals
  // -------------------------------
  amendments.forEach(a => {
    if (!proposalById[a.proposal]) {
      ensure(proposals, a.proposal, (id) => ({
        id,
        title: `Auto Proposal ${id}`,
        summary: "",
        status: "auto",
        author: "actor-unknown",
        topic: "topic-unknown",
        created_at: null,
        tags: ["auto", "inferred"]
      }));
    }
  });

  // -------------------------------
  // 10. Link documents → proposals
  // -------------------------------
  documents.forEach(doc => {
    if (doc.related_proposal && proposalById[doc.related_proposal]) {
      const p = proposalById[doc.related_proposal];
      p.documents = p.documents || [];
      p.documents.push(doc.id);
    }
  });

  // -------------------------------
  // 11. WCO linking (countries → topics)
  // -------------------------------
  if (wco.countries) {
    wco.countries.forEach(c => {
      const topicId = `topic-wco-${c.code}`;
      ensure(topics, topicId, (id) => ({
        id,
        title: c.name,
        summary: `WCO Country Node for ${c.name}`,
        tags: ["wco"]
      }));
    });
  }

  return {
    topics,
    proposals,
    processes,
    decisions,
    comments,
    actors,
    events,
    votes,
    petitions,
    amendments,
    budget,
    documents,
    wco
  };
}
