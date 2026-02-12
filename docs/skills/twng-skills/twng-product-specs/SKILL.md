---
name: twng-product-specs
description: Write technical specifications, feature requirements, user stories, and product documentation for TWNG platform. Use when defining new features, writing PRDs, or creating technical documentation.
---

# TWNG Product Specs Writer

## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Document Version**: !`date '+%Y.%m.%d'`-01

---

## TWNG Platform Overview

### Core Entities
- **User**: Collector, musician, or professional with a profile
- **Guitar/Instrument**: Individual item with history, specs, media
- **Collection**: User-organized group of guitars
- **Timeline Event**: Repair, modification, ownership change, etc.
- **Luthier**: Verified professional who can authenticate guitars
- **Article**: Editorial content (guides, stories, interviews)

### Key Features (MVP)
1. User profiles and authentication
2. Guitar documentation (add, edit, view)
3. Collections management
4. Timeline/history tracking
5. Luthier directory
6. Search and discovery
7. Magic Add (AI-powered quick entry)

## Document Templates

### Feature Specification Template

```markdown
# [Feature Name]

**Version**: 1.0
**Date**: [Date]
**Author**: [Name]
**Status**: Draft | Review | Approved | In Development | Complete

## Executive Summary

[2-3 sentences describing what this feature does and why it matters]

## Problem Statement

**User Pain Point**:
[What problem does this solve?]

**Current Workaround**:
[How do users handle this today?]

**Impact of Not Solving**:
[What happens if we don't build this?]

## Proposed Solution

### Overview
[High-level description of the solution]

### User Flow
1. [Step 1]
2. [Step 2]
3. [Step 3]

### UI/UX Requirements
- [Screen/component 1]
- [Screen/component 2]

### Technical Requirements
- [Backend requirement]
- [Frontend requirement]
- [Integration requirement]

## User Stories

### Primary User Stories
| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-001 | Collector | [action] | [benefit] | High |
| US-002 | Luthier | [action] | [benefit] | Medium |

### Edge Cases
- [Edge case 1]
- [Edge case 2]

## Acceptance Criteria

### Functional Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Non-Functional Requirements
- [ ] Performance: [metric]
- [ ] Security: [requirement]
- [ ] Accessibility: [requirement]

## Metrics & Success Criteria

**KPIs**:
- [Metric 1]: Target [X]
- [Metric 2]: Target [Y]

**Definition of Done**:
- [ ] All acceptance criteria met
- [ ] QA approved
- [ ] Documentation updated
- [ ] Analytics implemented

## Dependencies

- [Dependency 1]
- [Dependency 2]

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Plan] |

## Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Design | X days | |
| Development | X days | |
| QA | X days | |
| Total | X days | |

## Appendix

### Wireframes
[Link or embed]

### API Specifications
[Link or embed]

### References
- [Link 1]
- [Link 2]
```

### User Story Template

```markdown
## User Story: [Title]

**ID**: US-[XXX]
**Epic**: [Parent feature]
**Priority**: High | Medium | Low
**Story Points**: [X]

### Story
As a **[user type]**,
I want to **[action/goal]**,
So that **[benefit/value]**.

### Acceptance Criteria

**Given** [precondition]
**When** [action]
**Then** [expected result]

**Given** [precondition]
**When** [action]
**Then** [expected result]

### UI/UX Notes
- [Design consideration]
- [Interaction detail]

### Technical Notes
- [Implementation detail]
- [API endpoint needed]

### Out of Scope
- [What this story does NOT include]

### Dependencies
- [Blocker or dependency]

### Open Questions
- [ ] [Question 1]
- [ ] [Question 2]
```

### Bug Report Template

```markdown
## Bug Report: [Title]

**ID**: BUG-[XXX]
**Severity**: Critical | High | Medium | Low
**Status**: Open | In Progress | Fixed | Closed
**Reported By**: [Name]
**Date**: [Date]

### Description
[Clear description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- **Device**: [Desktop/Mobile/Tablet]
- **OS**: [Operating system]
- **Browser**: [Browser and version]
- **User Type**: [Logged in/Guest]

### Screenshots/Videos
[Attach or link]

### Logs
```
[Relevant log output]
```

### Possible Cause
[If known]

### Suggested Fix
[If known]
```

## Writing Guidelines for TWNG Specs

### Language
- Be specific, not vague
- Use active voice
- Define all acronyms first use
- Include examples when possible

### TWNG-Specific Terminology

| Term | Definition |
|------|------------|
| Guitar | Any stringed instrument documented on TWNG |
| Collection | User-created grouping of guitars |
| Timeline | Chronological history of guitar events |
| Verification | Luthier authentication stamp |
| Magic Add | AI-powered quick documentation feature |
| Founding Member | Early adopter with special badge |
| Pioneer | First users badge |

### User Types

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| Collector | Owns multiple guitars, focuses on documentation | Easy input, rich history, value tracking |
| Player | Uses guitar primarily for playing | Quick access, basic documentation |
| Luthier | Guitar repair/build professional | Verification tools, client management |
| Dealer | Sells guitars (future) | Listings, authentication |
| Guest | Not logged in | Browse, limited search |

## API Endpoint Naming Convention

```
GET    /api/v1/guitars              # List guitars
POST   /api/v1/guitars              # Create guitar
GET    /api/v1/guitars/:id          # Get guitar
PUT    /api/v1/guitars/:id          # Update guitar
DELETE /api/v1/guitars/:id          # Delete guitar

GET    /api/v1/guitars/:id/timeline # Get timeline events
POST   /api/v1/guitars/:id/timeline # Add timeline event

GET    /api/v1/collections          # List user collections
POST   /api/v1/collections          # Create collection

GET    /api/v1/luthiers             # List luthiers
GET    /api/v1/luthiers/:id         # Get luthier profile

POST   /api/v1/magic-add            # AI guitar recognition
```

## Data Models Reference

### Guitar Object
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string (user-given name)",
  "brand": "string",
  "model": "string",
  "year": "number",
  "serial_number": "string",
  "body_style": "string",
  "finish": "string",
  "description": "string (story)",
  "images": ["url"],
  "videos": ["url"],
  "tags": ["string"],
  "is_verified": "boolean",
  "verified_by": "uuid (luthier)",
  "timeline": [TimelineEvent],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Timeline Event Object
```json
{
  "id": "uuid",
  "guitar_id": "uuid",
  "type": "purchase|repair|modification|ownership_change|other",
  "date": "date",
  "title": "string",
  "description": "string",
  "luthier_id": "uuid (if applicable)",
  "images": ["url"],
  "created_at": "datetime"
}
```

## Quality Checklist

Before submitting a spec:

- [ ] Problem clearly defined
- [ ] Solution addresses the problem
- [ ] User stories are complete
- [ ] Acceptance criteria are testable
- [ ] Edge cases considered
- [ ] Dependencies identified
- [ ] Risks assessed
- [ ] Timeline is realistic
- [ ] Stakeholders reviewed
