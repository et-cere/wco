...idk, maybe start at bottom for newer hOW TO?!?
@@@@@@@@@@@@@

### Contributing & Upgrading

This project is built so the whole community can improve it over time — even if you’re not a programmer.

**How upgrades happen (simple version):**

The “official” Civic Substrate lives in one main folder (the one you downloaded or cloned).  
When someone adds something new — for example, support for a brand-new civic website — they create a couple of small files and send them to the main project.  
Once those files are added to the official version, everyone who downloads the latest copy automatically gets the upgrade.

You don’t need to be a coder to help:
- Test the tool and tell us what feels confusing or broken.
- Share your own Civic Pulse JSON file so others can see what you’ve collected.
- Suggest a new type of civic signal we haven’t thought of yet.
- Ask us to add support for a specific platform you use (we’ll try to make it happen).

**For people who want to add something themselves (developers or tinkerers):**

1. **Add support for a new civic platform**  
   Drop two files into the `substrate/adapters/` folder:
   - A short `.json` file describing the platform
   - A `.js` file that knows how to pull data from it (we have examples for Decidim, Polis, etc.)

2. **Add a new kind of civic data**  
   Create a new type definition in `substrate/types/` and update the manifest if needed.

3. **Submit your changes**  
   - Fork the project on GitHub  
   - Add your files  
   - Open a Pull Request (PR) with a short note saying what you added  
   - We review it quickly and merge it into the main version

Once merged, the new feature becomes part of the canonical substrate and everyone benefits.

**Connecting different people’s work**

Right now you can export your signals as a **Civic Pulse JSON** file and share it with anyone.  
They can import it into their own copy and suddenly see what you’ve been collecting.  
In the future we’ll make it even easier — shared public pulses, one-click imports from URLs, etc.

The whole system is marked as **“extensible”** on purpose. That means we designed it so new adapters, new data types, and new ideas can be added cleanly without breaking what already works.

We want this substrate to feel like Wikipedia for civic infrastructure: anyone can improve it, and the improvements belong to everyone.

---

**No gatekeepers.**  
If something is missing, we add it together.  
Just open an issue or send a message — even if it’s just “hey, can we support Platform XYZ?”

This is how we grow from a small tool into a real shared foundation.

@@@@@@@@@@@@@@@@@@

### Using the Browser Extension + Live Sharing

The Civic Substrate comes with a simple browser extension that makes capturing civic signals effortless.

**How it works:**
- Click the extension icon in your browser toolbar.
- On any webpage (news article, civic discussion, tweet, proposal page, etc.), click **"Add civic signal from this page"**.
- The signal is saved locally and instantly appears in the Viewer under **Civic Pulse**.
- You can also click **"Open viewer"** to see everything in one place.

All signals stay under your control. You can export them anytime as a clean JSON file.

**Live Sharing with Others (P2P)**
The viewer supports optional peer-to-peer sharing using WebRTC.  
This means you can share your civic signals directly with other people who have the substrate — without going through a central server.

- When you add a signal, it can automatically broadcast to connected peers.
- Others can receive your signals in real time and merge them into their own substrate.
- A basic trust system is included so you can choose whose signals you accept.

This feature is still growing. For now it works best when people are online at the same time and manually connect (copy-paste room codes). In the future we’ll make joining even simpler.

**Why this matters**
It lets communities build a shared, living record of civic activity together — while keeping full ownership and control. No big platform owns your data.

You can start small (just you and a few friends) or grow it into larger decentralized civic networks.

@@@@@@@@@@@@

civic-substrate/
  index.html
  app.js
  style.css
  substrate-extension-config.json

  substrate/
    manifest.json

    types/
      core/
        topic.json
        proposal.json
        event.json
        decision.json
        comment.json

      actors/
        actor.json
        organization.json
        working-group.json
        role.json
        mandate.json

      processes/
        process.json
        meeting.json
        timeline.json
        step.json
        delegation.json

      governance/
        vote.json
        petition.json
        amendment.json
        budget-item.json
        jurisdiction.json
        constituency.json

      artifacts/
        document.json
        attachment.json
        reference.json
        tag.json

      wco/
        wco-country.json
        wco-slot.json
        wco-node.json
        wco-link.json

    adapters/
      democracyos.json
      decidim.json
      polis.json
      osm.json
      wco.json

	adapters/ingest/
	decidim.js
	democracyos.js
	index.js
	osm.js
	polis.js
	wso.js

  data/
    topics.json
    proposals.json
    events.json
    actors.json
    decisions.json
generative-advanced
    comments.json
    processes.json
    votes.json
    petitions.json
    amendments.json
    budget.json
    documents.json

   engine/
linker.js
generative.js
generative-advanced.js

  readmeA.txt


@@@@@@@@@@@@@@@@@@

### Quick Start: Using the Browser Extension (Updated 2026)

1. **Install the extension (development mode)**
   - Open Chrome → go to `chrome://extensions/`
   - Turn on **Developer mode** (top right)
   - Click **"Load unpacked"** and select your `wco-extension/` folder

2. **Capture a civic signal**
   - Go to any webpage (news, proposal, tweet, discussion…)
   - Click the WCO extension icon in your toolbar
   - Click **"Add Civic Signal from this Page"**
   - The signal is saved locally and instantly appears in the **Civic Pulse** view (if the viewer is open)

3. **Open the full viewer**
   - Click **"Open Civic Substrate Viewer"** in the popup
   - Or manually open `index.html` from the main civic-substrate folder

4. **Export your signals**
   - In the popup, click **"Export My Civic Pulse"** to download a JSON file you can share or import later.

**Tip:** Keep the viewer tab open while browsing — new signals will appear live in the **Civic Pulse** section.

---

### For Developers & Contributors – How to Expand the Project

**Super simple ways to improve it (no deep coding required):**

**A. Improve the Extension**
- Edit `popup.html` / `popup.js` for better UI
- Edit `background.js` to change how signals are handled
- Add new buttons or actions in the popup

**B. Make the Viewer Better**
- Open `app.js`
- Add or improve a view inside the `viewRenderers` object (e.g. make Civic Pulse actually show a nice list instead of placeholder)
- Improve context panels or add new ones

**C. Add Support for a New Civic Platform** (easiest big win)
1. Create a new file in `substrate/adapters/ingest/` called `yourplatform.js`
2. Follow the pattern from `decidim.js` (very short)
3. Add it to `substrate/adapters/ingest/index.js`
4. Test by running the ingest functions

**D. Fix or Upgrade Core Engine**
- `engine/relations-builder.js` → controls how things are connected
- `engine/generative.js` → auto-fills missing data
- `p2p/webrtc.js` and `p2p/merge.js` → for live sharing

**E. Add New Data Types**
- Create a new `.json` schema in `substrate/types/`
- Then update the ingest framework if needed

**Testing changes:**
- After editing files, reload the extension in `chrome://extensions/`
- For the viewer, just refresh the `index.html` tab
- Use the **"Run Generative Engine"** button in the header to rebuild connections

**Sharing your improvements**
- Fork the repo
- Add/edit files
- Open a Pull Request with a short description like “Added support for Platform XYZ” or “Improved Civic Pulse display”

No gatekeepers — if it works and is clean, it gets merged fast.

---

### Current Folder Structure (Quick Reference)
civic-substrate/
├── index.html                 ← Main viewer
├── app.js                     ← All the UI logic
├── style.css
├── substrate-extension-config.json
│
├── wco-extension/             ← Browser extension files
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   └── config/
│       └── substrate-extension-config.json
│
├── substrate/
│   ├── adapters/ingest/       ← Where new platforms go
│   ├── engine/                ← Core logic (relations, generative…)
│   ├── p2p/                   ← Live sharing
│   └── data/                  ← Your saved JSON files
│
└── readmeA.txt


You can start small: fix one placeholder (like making Civic Pulse show real signals) and you’ve already contributed something useful.

---

Would you like me to also give you a **quick improvement for `renderCivicPulsePanel`** so the Civic Pulse view actually shows the signals in a nice list instead of the placeholder? That would be a fast, visible win before you tweet about it.

Just say “yes” and I’ll give you the code to paste in. Or tell me what else feels highest priority right now.  

You’ve got this — the foundation is already there. Let’s make it feel solid for the tweet tonight. 🚀
