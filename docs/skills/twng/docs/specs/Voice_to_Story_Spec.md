# TWNG — Voice-to-Story Specification

> **Feature:** Voice Recording for Guitar Stories
> **Version:** 1.0
> **Priority:** P2

---

## Overview

### What is Voice-to-Story?
Instead of typing, users speak their guitar's story. TWNG transcribes it into text they can edit.

### User Value
- **Easier than typing:** Especially on mobile
- **More natural:** Stories flow better when spoken
- **Captures emotion:** Speaking brings out memories
- **Accessibility:** Helps users who struggle with typing

### Use Cases
- "How did you get this guitar?"
- "What does it mean to you?"
- "Any memorable moments with it?"
- Recording provenance/history for valuable guitars

---

## User Flow

### Flow: Record Story

```
┌─────────────────┐
│ 1. Tap "Add     │
│    Story"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Choose       │
│    "Record"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Recording    │
│    in progress  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Processing   │
│    "Transcribing│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Review &     │
│    edit text    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Save story   │
└─────────────────┘
```

---

## Screen Specifications

### Screen 1: Story Entry Options

```
┌─────────────────────────────────────────────┐
│  ← Back                                     │
│─────────────────────────────────────────────│
│                                             │
│   Add a Story                               │
│   ───────────                               │
│                                             │
│   Every guitar has a story.                 │
│   What's this one's?                        │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   🎤 Record                         │   │
│   │   ─────────                         │   │
│   │   Speak your story — we'll          │   │
│   │   transcribe it for you.            │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   ✏️ Type                           │   │
│   │   ─────────                         │   │
│   │   Write your story yourself.        │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   💡 Prompts to get you started:            │
│   • How did you get this guitar?            │
│   • What does it mean to you?               │
│   • Any memorable gigs or moments?          │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Screen 2: Recording

```
┌─────────────────────────────────────────────┐
│  ✕ Cancel                                   │
│─────────────────────────────────────────────│
│                                             │
│                                             │
│                                             │
│                 🎤                           │
│              ╭─────╮                        │
│              │ ●●● │  ← Audio waveform      │
│              ╰─────╯                        │
│                                             │
│              Recording...                   │
│                                             │
│               02:34                         │
│                                             │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   💡 Tell the story of this guitar.         │
│      How did you get it?                    │
│      What memories do you have?             │
│                                             │
│                                             │
│              ┌─────────┐                    │
│              │  ⏹ Stop │                    │
│              └─────────┘                    │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Recording states:**
- Waveform animation shows audio level
- Timer counts up
- Max recording: 5 minutes
- Warning at 4:30 ("30 seconds remaining")

---

### Screen 3: Processing

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│                                             │
│              ◐ ◓ ◑ ◒                        │
│                                             │
│         Transcribing your story...          │
│                                             │
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Screen 4: Review & Edit

```
┌─────────────────────────────────────────────┐
│  ← Back                          [Save]     │
│─────────────────────────────────────────────│
│                                             │
│   Review Your Story                         │
│   ─────────────────                         │
│                                             │
│   🎧 [▶ Play recording]  2:34               │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   Transcription:                            │
│   ┌─────────────────────────────────────┐   │
│   │ I got this guitar in 1998 from my  │   │
│   │ uncle. He played it in a band in   │   │
│   │ the seventies, touring around the  │   │
│   │ midwest. When he passed away, my   │   │
│   │ aunt gave it to me knowing I'd     │   │
│   │ take care of it.                   │   │
│   │                                     │   │
│   │ It's not worth much money, but     │   │
│   │ it's priceless to me. Every time   │   │
│   │ I play it, I think of him.         │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│   ✏️ Tap to edit                            │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   ☐ Keep audio recording attached           │
│     (others can listen if shared)           │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │           Save Story                │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   [🎤 Re-record]                            │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Screen 5: Editing Mode

```
┌─────────────────────────────────────────────┐
│  Cancel                          [Done]     │
│─────────────────────────────────────────────│
│                                             │
│   Edit Story                                │
│   ──────────                                │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ I got this guitar in 1998 from my  │   │
│   │ uncle. He played it in a band in   │   │
│   │ the seventies, touring around the  │   │
│   │ Midwest.█                          │   │
│   │                                     │   │
│   │ When he passed away, my aunt gave  │   │
│   │ it to me knowing I'd take care of  │   │
│   │ it.                                │   │
│   │                                     │   │
│   │ It's not worth much money, but     │   │
│   │ it's priceless to me. Every time   │   │
│   │ I play it, I think of him.         │   │
│   │                                     │   │
│   │                                     │   │
│   │                                     │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Character count: 342                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Technical Implementation

### Speech-to-Text Service

Options:
1. **Web Speech API** (browser native, free, limited)
2. **OpenAI Whisper** (accurate, multi-language)
3. **Google Speech-to-Text** (reliable, paid)
4. **Deepgram** (fast, affordable)

**Recommended:** OpenAI Whisper
- Excellent accuracy
- Handles multiple languages (Hebrew + English)
- Good with music terminology

### API Endpoint

```
POST /api/v1/voice/transcribe

Request:
{
  "audio": "base64_encoded_audio",
  "format": "webm",  // or "mp3", "wav"
  "language_hint": "en"  // or "he", "auto"
}

Response:
{
  "success": true,
  "transcription": "I got this guitar in 1998...",
  "language_detected": "en",
  "confidence": 0.95,
  "duration_seconds": 154,
  "audio_url": "https://..."  // if keeping audio
}
```

### Audio Recording (Frontend)

```typescript
// Using MediaRecorder API
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const result = await transcribeAudio(blob);
    setTranscription(result.transcription);
  };

  mediaRecorder.start();
  setRecording(true);
};
```

---

## Database Schema

```sql
-- Stories table
CREATE TABLE guitar_stories (
  id UUID PRIMARY KEY,
  guitar_id UUID NOT NULL REFERENCES guitars(id),

  -- Content
  text_content TEXT NOT NULL,
  audio_url TEXT,  -- S3/storage URL if audio kept
  audio_duration INTEGER,  -- seconds

  -- Metadata
  input_method VARCHAR(10),  -- 'voice', 'typed'
  language VARCHAR(5),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Edge Cases

### Permission Denied

```
┌─────────────────────────────────────────────┐
│                                             │
│   🎤 Microphone access needed               │
│                                             │
│   To record your story, TWNG needs          │
│   permission to use your microphone.        │
│                                             │
│   [Allow microphone]                        │
│                                             │
│   Or: [Type your story instead]             │
│                                             │
└─────────────────────────────────────────────┘
```

### Transcription Failed

```
┌─────────────────────────────────────────────┐
│                                             │
│   ⚠️ Couldn't transcribe                    │
│                                             │
│   We had trouble converting your            │
│   recording to text.                        │
│                                             │
│   [🎧 Listen & type manually]               │
│   [🎤 Try recording again]                  │
│                                             │
└─────────────────────────────────────────────┘
```

### Recording Too Short

```
Min recording: 3 seconds

If shorter:
┌─────────────────────────────────────────────┐
│                                             │
│   Recording too short                       │
│                                             │
│   Please record at least a few sentences.   │
│                                             │
│   [Try again]                               │
│                                             │
└─────────────────────────────────────────────┘
```

### Recording Too Long

```
Max recording: 5 minutes

At 4:30:
"30 seconds remaining"

At 5:00:
Auto-stop recording, proceed to transcription
```

---

## Language Support

### Auto-Detection
System detects language from audio and transcribes accordingly.

### Supported Languages (Phase 1)
- English
- Hebrew

### Mixed Language
Common in Israel — handles Hebrew with English guitar terms:
> "קניתי את הגיטרה הזו ב-Guitar Center בלוס אנג'לס"

---

## Audio Storage Options

### Option A: Text Only (Default)
- Transcribe, save text, discard audio
- Lowest storage cost
- Privacy-friendly

### Option B: Keep Audio (Opt-in)
- Store audio alongside text
- Others can listen to the story
- Richer experience
- Higher storage cost

User chooses:
> ☐ Keep audio recording attached
>   (others can listen if shared)

---

## Accessibility

- Works with screen readers
- Keyboard navigation
- Visual feedback for audio levels
- Text alternative always available
- Captions for playback

---

## Analytics Events

| Event | When | Data |
|-------|------|------|
| `voice_recording_started` | User starts recording | - |
| `voice_recording_completed` | Recording stopped | duration |
| `voice_recording_cancelled` | User cancels | duration |
| `transcription_completed` | Text returned | confidence, language |
| `transcription_edited` | User edits text | edit_distance |
| `story_saved` | Story saved | input_method, has_audio |

---

## Story Prompts (Inspiration)

Shown before/during recording:

- How did you get this guitar?
- What does it mean to you?
- Any memorable gigs or moments?
- Who owned it before you?
- What's your favorite thing about it?

---

## Future Enhancements

1. **AI story enhancement** — Clean up transcription, suggest additions
2. **Interview mode** — TWNG asks questions, user answers
3. **Multi-part stories** — Chapters for long histories
4. **Video stories** — Record video, not just audio
5. **Story sharing** — Share story as social content

---

*"Every guitar has a story. Tell yours."*
