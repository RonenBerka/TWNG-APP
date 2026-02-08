# TWNG — Beta Testing Plan

---

## Beta Goals

1. **Validate core functionality** — Does everything work?
2. **Test Magic Add** — How accurate? What fails?
3. **Measure conversion** — Signup → First guitar rate
4. **Identify friction** — Where do people get stuck?
5. **Gather feedback** — What do collectors actually want?

---

## Beta Structure

```
Duration: 2 weeks
Testers: 30-50 people
Phases:
  Week 1: Core testing (signup, add guitar, basic flows)
  Week 2: Deep testing (Magic Add, stories, edge cases)
```

---

## Tester Recruitment

### Target Mix (50 testers)

| Segment | # | Why | How to Find |
|---------|---|-----|-------------|
| Personal network | 10-15 | Quick feedback, trusted | Friends who play guitar |
| Instagram followers | 10-15 | Already interested in guitars | DM engaged followers |
| Forum members | 10-15 | Serious collectors | The Gear Page, My Les Paul Forum |
| Industry contacts | 5-10 | Professional perspective | Guitar store owners, luthiers |

### Ideal Tester Profile

**Must have:**
- Owns at least 1 guitar
- Has smartphone with camera
- Willing to give honest feedback
- Available for 30-60 min over 2 weeks

**Nice to have:**
- Variety of guitar types (electric, acoustic, bass)
- Different collection sizes (1-3 vs 10+)
- Mix of casual players and serious collectors
- Mix of tech-savvy and not

---

## Recruitment Messages

### Personal Network (casual):
```
Hey [Name] — I'm launching something for guitar people
and could use your help testing it.

TWNG is a place to keep track of your guitars — specs,
photos, stories. Private by default.

Would you spend 30 min trying it and giving feedback?
I'd really appreciate it.

Free forever, obviously. Let me know!
```

### Instagram DM (warm contact):
```
Hey! I've seen your guitar posts — beautiful collection.

I'm building TWNG — a place for collectors to keep
their guitars documented. Looking for beta testers
before we launch.

Would you be interested? Takes about 30 min, and
I'd love your feedback. You'd also get early access
and a Founding Member badge.

Let me know!
```

### Forum Post (public):
```
Looking for Beta Testers — TWNG (Guitar Collection Platform)

Hey everyone,

I'm building TWNG — a platform to document and organize
your guitar collection. Think of it as a home for your
guitars' specs, photos, serial numbers, and stories.

Looking for 10-15 beta testers before we launch publicly.

What's involved:
- Sign up and add 1-3 guitars
- Try the "Magic Add" feature (photo → auto-identification)
- Give honest feedback

What you get:
- Early access
- Founding Member badge
- Direct line to shape the product

Interested? DM me or reply here.

Thanks!
```

---

## Onboarding Beta Testers

### Day 1: Invite

Email/DM with:
- Beta access link (unique or password-protected)
- Brief explanation of what to test
- Link to feedback channel (Slack/Discord/Form)

```
Subject: You're in — TWNG Beta Access

Hey [Name],

Thanks for agreeing to test TWNG!

Here's your access link: [LINK]

What to do:
1. Sign up (takes 1 min)
2. Add at least one guitar — try "Magic Add" if you can
3. Tell me what works and what doesn't

You can share feedback:
- Reply to this email
- Or use this form: [LINK]

I'm around if you have questions. Thanks for helping!

[Founder]
```

### Day 3: Check-in

```
Subject: Quick check — how's TWNG?

Hey [Name],

Just checking in. Did you get a chance to try TWNG?

A few questions if you have 2 minutes:
1. Were you able to add a guitar?
2. Did Magic Add work? (the photo identification)
3. Anything confusing or broken?

No worries if you haven't tried it yet — just let me know
when you do!

Thanks,
[Founder]
```

### Day 7: Feedback Request

```
Subject: One week in — your thoughts?

Hey [Name],

We're one week into beta. I'd love to hear your thoughts.

Quick survey (5 min): [LINK]

Or just reply with:
- What worked well?
- What frustrated you?
- What's missing?

Your feedback directly shapes what we build.

Thanks for being part of this.

[Founder]
```

---

## What to Test

### Core Functionality (Week 1)

| Feature | Test | Success Criteria |
|---------|------|------------------|
| Signup | Can users create account? | 90%+ complete signup |
| Email verification | Does email arrive? | <2 min delivery |
| Add guitar (manual) | Can users add guitar manually? | Works on mobile + desktop |
| Add guitar (Magic Add) | Does photo ID work? | 70%+ accurate |
| View collection | Does collection display? | Loads <3 sec |
| Edit guitar | Can users update info? | Saves correctly |
| Delete guitar | Can users remove? | Confirmation works |

### Advanced Features (Week 2)

| Feature | Test | Success Criteria |
|---------|------|------------------|
| Voice-to-story | Does transcription work? | Usable output |
| Serial number decode | Does it identify year? | 80%+ for Fender/Gibson |
| Privacy toggle | Does visibility change? | Works correctly |
| Photo upload | Multiple photos? | 5+ photos per guitar |
| Mobile experience | All features on phone? | No broken layouts |

### Edge Cases

- Very old guitar (pre-1960)
- Unusual brand (non-Fender/Gibson)
- No serial number
- Custom/modified guitar
- Blurry photo for Magic Add
- Non-English story (voice)

---

## Feedback Collection

### Channels

1. **Quick feedback:** Reply to email / DM
2. **Structured feedback:** Google Form survey
3. **Real-time chat:** Slack/Discord channel (optional)
4. **Bug reports:** Simple form or email

### Survey Questions (End of Week 1)

```
1. How easy was it to sign up? (1-5)
2. Did you add at least one guitar? (Y/N)
3. Did you try Magic Add? (Y/N)
   - If yes: How accurate was it? (1-5)
4. What was confusing? (Open)
5. What would you improve? (Open)
6. Would you recommend TWNG to a friend? (1-10)
7. Anything else? (Open)
```

### Survey Questions (End of Week 2)

```
1. How many guitars did you add?
2. Which features did you use?
   [ ] Magic Add
   [ ] Manual entry
   [ ] Voice story
   [ ] Photo upload
   [ ] Serial decode
3. What's the most valuable feature? (Open)
4. What's missing? (Open)
5. Would you use TWNG regularly? (Y/N)
6. What would make you use it more? (Open)
7. Any bugs we should know about? (Open)
```

---

## Metrics to Track

### Quantitative

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Signup completion | 90% | Analytics |
| First guitar added | 70% | Database |
| Magic Add used | 50% | Analytics |
| Magic Add accuracy | 70% | Manual review |
| Return visit (day 2) | 40% | Analytics |
| 2+ guitars added | 30% | Database |
| Session duration | 5+ min | Analytics |

### Qualitative

- What words do people use to describe TWNG?
- What do they compare it to?
- What questions do they ask?
- What do they wish existed?

---

## Bug Tracking

### Priority Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| P0 - Critical | Can't use app, data loss | Fix within hours |
| P1 - High | Major feature broken | Fix within 24h |
| P2 - Medium | Feature works but buggy | Fix before launch |
| P3 - Low | Minor annoyance | Fix when possible |

### Bug Report Template

```
What happened:
What you expected:
Steps to reproduce:
Device/Browser:
Screenshot (if applicable):
```

---

## Beta Success Criteria

### Ready to Launch If:

- [ ] 80%+ of testers successfully added a guitar
- [ ] Magic Add accuracy > 70%
- [ ] No P0 or P1 bugs in last 3 days
- [ ] Core flows work on mobile
- [ ] Positive qualitative feedback (would recommend)

### Delay Launch If:

- Signup completion < 70%
- Magic Add accuracy < 50%
- Critical bugs unresolved
- Major UX confusion
- Negative feedback pattern

---

## Post-Beta Actions

1. **Fix bugs** — Address all P0-P2 issues
2. **Implement top 3 feedback items** — Quick wins
3. **Thank testers** — Personal message + Founding Member badge
4. **Document learnings** — What surprised us?
5. **Prepare for launch** — Update based on learnings
