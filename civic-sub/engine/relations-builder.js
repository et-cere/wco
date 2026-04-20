// engine/relations-builder.js
// Dynamic, browser-safe relations builder for the civic substrate.

export function buildRelations(data) {
  if (!data) return [];

  const {
    actors = [],
    topics = [],
    proposals = [],
    processes = [],
    events = [],
    votes = [],
    amendments = [],
    petitions = [],
    documents = [],
    comments = []
  } = data;

  const relations = [];

  // Proposals → Topics
  for (const p of proposals) {
    if (p.topic_id) {
      relations.push({
        from: p.id,
        to: p.topic_id,
        type: "belongs-to"
      });
    }
  }

  // Actors → Proposals (author)
  for (const p of proposals) {
    if (p.author_id) {
      relations.push({
        from: p.author_id,
        to: p.id,
        type: "authored"
      });
    }
  }

  // Processes → Proposals
  for (const p of proposals) {
    if (p.process_id) {
      relations.push({
        from: p.process_id,
        to: p.id,
        type: "includes"
      });
    }
  }

  // Processes → Events
  for (const m of events) {
    if (m.process_id) {
      relations.push({
        from: m.process_id,
        to: m.id,
        type: "contains"
      });
    }
  }

  // Votes → Proposals / Decisions
  for (const v of votes) {
    if (v.proposal_id) {
      relations.push({
        from: v.id,
        to: v.proposal_id,
        type: "vote-on"
      });
    }
    if (v.decision_id) {
      relations.push({
        from: v.id,
        to: v.decision_id,
        type: "vote-on-decision"
      });
    }
  }

  // Amendments → Proposals
  for (const a of amendments) {
    if (a.proposal_id) {
      relations.push({
        from: a.id,
        to: a.proposal_id,
        type: "amends"
      });
    }
  }

  // Petitions → Topics
  for (const p of petitions) {
    if (p.topic_id) {
      relations.push({
        from: p.id,
        to: p.topic_id,
        type: "petition-on"
      });
    }
  }

  // Documents → Proposals / Processes
  for (const d of documents) {
    if (d.proposal_id) {
      relations.push({
        from: d.id,
        to: d.proposal_id,
        type: "documents"
      });
    }
    if (d.process_id) {
      relations.push({
        from: d.id,
        to: d.process_id,
        type: "documents-process"
      });
    }
  }

  // Comments → Proposals / Topics
  for (const c of comments) {
    if (c.proposal_id) {
      relations.push({
        from: c.id,
        to: c.proposal_id,
        type: "comments-on"
      });
    }
    if (c.topic_id) {
      relations.push({
        from: c.id,
        to: c.topic_id,
        type: "comments-on-topic"
      });
    }
  }

  return relations;
}
