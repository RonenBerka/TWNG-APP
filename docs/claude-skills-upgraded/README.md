# Upgraded SKILL.md Files with Dynamic Context Injection

This directory contains 9 upgraded SKILL.md files with Dynamic Context sections that inject real-time contextual information using command substitutions.

## Created Skills

### 1. **animation-prompt-generator**
- **Dynamic Context**: Current date, Session ID, Week/Year tracking
- **Injections**: 3 command substitutions for version tracking
- **Purpose**: Generate AI animation prompts with current session context

### 2. **satirical-hebrew-writing**
- **Dynamic Context**: Current date/time, day of week, news cycle relevance
- **Injections**: 3 command substitutions for immediate news contextualization
- **Purpose**: Create timely satirical Hebrew content with current events awareness

### 3. **jewelry-model-photography**
- **Dynamic Context**: Session Tracking ID, Project Organization timestamp
- **Injections**: 2 command substitutions for project management tracking
- **Purpose**: Virtual jewelry placement with session-tracked organization

### 4. **ecommerce-conversion-optimizer**
- **Dynamic Context**: Analysis date, Current quarter, Benchmark period
- **Injections**: 3 command substitutions for quarterly performance analysis
- **Purpose**: Conversion optimization with quarterly benchmark context

### 5. **email-marketing-retention**
- **Dynamic Context**: Current date, Upcoming Israeli holidays (90 days), Seasonal context
- **Injections**: 3 command substitutions including holiday awareness and seasonal messaging
- **Purpose**: Email campaigns with cultural holiday and seasonal awareness

### 6. **landing-page-optimizer**
- **Dynamic Context**: Current date, A/B test tracking period, Month/season
- **Injections**: 3 command substitutions for testing windows and seasonal campaigns
- **Purpose**: Landing page optimization with A/B testing timing context

### 7. **meta-ads-jewelry-ecommerce**
- **Dynamic Context**: Reporting period, Current month, Seasonal ad planning
- **Injections**: 3 command substitutions for seasonal campaign planning
- **Purpose**: Meta ads strategy with seasonal planning context

### 8. **hebrew-luxury-copywriting**
- **Dynamic Context**: Current season with seasonal messaging guidance
- **Injections**: 1 command substitution for seasonal tone adjustment
- **Purpose**: Luxury Hebrew copywriting with seasonal relevance

### 9. **jewelry-photography-guide**
- **Dynamic Context**: Current time (for natural light recommendations), Current season
- **Injections**: 3 command substitutions including time-of-day and seasonal guidance
- **Purpose**: Photography guide with optimal lighting time and seasonal considerations

## Dynamic Context Features

Each skill includes a "Dynamic Context" section at the top with relevant `!command` injections:

```
## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Current Season**: !`month=$(date '+%-m'); if [ $month -ge 3 ] && [ $month -le 5 ]; ...`
```

These commands inject:
- Current dates and times
- Day-of-week information
- Week/quarter/season calculations
- Holiday awareness
- Optimal timing for activities (like natural light photography)
- Session/project tracking IDs

## File Structure

Each SKILL.md file contains:
1. YAML frontmatter (name, description)
2. Dynamic Context section with command injections
3. Original skill content (completely intact)
4. All original sections and guidance preserved

## Usage

These upgraded files maintain 100% compatibility with the original skill content while adding contextual awareness. The dynamic context sections:

- Update automatically when files are viewed/processed
- Provide real-time information relevant to the skill's domain
- Maintain skill's original purpose and content
- Add temporal and seasonal awareness
- Support version tracking and project organization

## Locations

All files are saved to:
```
/sessions/vigilant-eloquent-heisenberg/mnt/cowork/claude-skills-upgraded/[skill-name]/SKILL.md
```

Total: 9 upgraded SKILL.md files with 24 command injections providing dynamic context awareness.
