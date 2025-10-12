# 🤖 AI Chatbot - Green Hydrogen Assistant

## 🌟 Overview

Your Green Hydrogen Platform now includes an **intelligent AI chatbot** that helps users with hydrogen-related questions. The chatbot appears on every page (except login) and uses **Groq API** (primary) or **OpenAI API** (fallback) for fast, accurate responses.

---

## ✨ Features

### 1. **Beautiful Floating Chat Interface**
- **Floating Button**: Appears bottom-right on all pages
- **Animated Pulse**: Green badge indicates "online" status
- **Glassmorphic Design**: Matches your platform's aesthetic
- **Smooth Animations**: Scales on hover, slides in/out

### 2. **Smart AI Responses**
- **Specialized Knowledge**: Expert in hydrogen production, storage, transportation
- **Context-Aware**: Understands your platform's domain
- **Fast Responses**: Uses Groq's Mixtral model (fastest in class)
- **Fallback Support**: Switches to OpenAI if Groq fails

### 3. **User Experience**
- **Quick Questions**: Pre-defined buttons for common queries
- **Chat History**: Maintains conversation context
- **Timestamps**: Shows when each message was sent
- **Typing Indicator**: Shows when AI is "thinking"
- **Error Handling**: Graceful fallbacks if API fails

---

## 🎨 UI Components

### Chat Window Includes:
1. **Header**
   - Bot avatar with gradient background
   - "H2 AI Assistant" title
   - Online/offline badge
   - Close button

2. **Message Area**
   - User messages (purple gradient, right-aligned)
   - AI messages (white background, left-aligned)
   - Avatars for both users and bot
   - Scrollable message history

3. **Quick Questions** (on first load)
   - "How does PEM electrolysis work?"
   - "What are the storage options?"
   - "Safety guidelines for H2 transport"
   - "Cost per kg of green hydrogen"

4. **Input Area**
   - Text input field
   - Send button (gradient blue/cyan)
   - Supports Enter key to send
   - Disabled during loading

---

## 🔧 Technical Details

### API Integration

**File**: `app/api/chat/route.ts`

The chatbot uses a smart fallback system:

```typescript
1. Try Groq API (fastest, uses Mixtral-8x7b)
   ↓ (if fails)
2. Try OpenAI API (reliable, uses GPT-3.5-turbo)
   ↓ (if fails)
3. Return error message
```

### System Prompt

The AI is configured with this specialized prompt:

```
You are an expert AI assistant specializing in green hydrogen technology and renewable energy systems. You help users understand:

- Hydrogen production methods (PEM, Alkaline, SOEC electrolysis)
- Storage solutions (compressed, liquid, underground, metal hydride)
- Transportation logistics (pipelines, tube trailers, tankers)
- Renewable energy integration (solar, wind, hydro)
- Safety protocols and regulations
- Economic analysis and cost optimization
- Environmental benefits and carbon offset calculations
- System efficiency and performance metrics
```

### Environment Variables Required

Make sure these are in your `.env.local`:

```bash
# Groq API (Primary - Fastest)
GROQ_API_KEY=your_groq_api_key_here

# OpenAI API (Fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Hugging Face (not currently used but available)
HUGGINGFACE_TOKEN=your_huggingface_token_here
```

---

## 📱 Usage

### For Users

1. **Open Chat**: Click the floating blue/cyan button (bottom-right)
2. **Ask Questions**: Type your question about hydrogen technology
3. **Quick Start**: Click a quick question button for instant queries
4. **Get Answers**: AI responds in 1-3 seconds (with Groq)
5. **Continue Conversation**: Ask follow-up questions
6. **Close**: Click X button or click outside

### Example Conversations

**User**: "How does PEM electrolysis work?"

**AI**: "PEM (Proton Exchange Membrane) electrolysis splits water into hydrogen and oxygen using an electric current. Here's how it works:

1. **Water Input**: Pure water enters the cell
2. **Anode Side**: Water molecules split into oxygen, protons (H+), and electrons
3. **Membrane**: Protons pass through the PEM to the cathode
4. **Cathode Side**: Protons combine with electrons to form hydrogen gas
5. **Output**: High-purity hydrogen (99.99%+) and oxygen

**Key Benefits**:
- Fast response to variable power (renewable integration)
- Compact design
- High purity hydrogen
- 60-80% efficiency

PEM electrolyzers are ideal for green hydrogen production with solar/wind power!"

---

## 🎯 Chatbot Capabilities

The AI can help with:

### ✅ Production Questions
- Electrolyzer types comparison
- Efficiency calculations
- Energy requirements
- Water consumption
- Catalyst materials

### ✅ Storage Questions
- Storage method comparison
- Pressure/temperature requirements
- Safety considerations
- Capacity calculations
- Cost analysis

### ✅ Transportation Questions
- Pipeline vs trailer vs tanker
- Distance optimization
- Energy costs
- Pressure loss calculations
- Safety protocols

### ✅ Integration Questions
- Renewable energy coupling
- Grid integration
- Load balancing
- System design
- Economic viability

### ✅ Safety & Regulations
- Safety standards
- Handling procedures
- Emergency protocols
- Compliance requirements
- Best practices

---

## 🔒 Privacy & Security

1. **No Data Storage**: Conversations are not stored permanently
2. **Session Only**: Chat history exists only in browser session
3. **API Security**: Keys stored securely in environment variables
4. **No User Tracking**: We don't track individual conversations
5. **HTTPS Only**: All API calls use secure connections

---

## ⚙️ Configuration

### Customize Chat Appearance

Edit `components/AIChat.tsx`:

```typescript
// Change chat window size
className="w-[400px] h-[600px]"  // Make wider/taller

// Change floating button position
className="fixed bottom-6 right-6"  // Move to different corner

// Change colors
className="bg-gradient-to-r from-blue-600 to-cyan-600"  // Your gradient
```

### Customize System Prompt

Edit `app/api/chat/route.ts`:

```typescript
const SYSTEM_PROMPT = `Your custom prompt here...`;
```

### Add More Quick Questions

Edit `components/AIChat.tsx`:

```typescript
const quickQuestions = [
  "Your question 1",
  "Your question 2",
  "Your question 3",
  "Your question 4"
];
```

---

## 🚀 Performance

### Speed Comparison

| API Provider | Model | Avg Response Time |
|--------------|-------|-------------------|
| **Groq** | Mixtral-8x7b | **1-2 seconds** ⚡ |
| OpenAI | GPT-3.5-turbo | 3-5 seconds |
| OpenAI | GPT-4 | 8-12 seconds |

**Groq is ~3x faster** than OpenAI while maintaining quality!

### Token Limits

- **Groq**: 32,768 tokens context window
- **OpenAI**: 4,096 tokens (GPT-3.5) / 8,192 tokens (GPT-4)
- **Current Setting**: 500 max tokens per response

---

## 🐛 Troubleshooting

### Problem: "AI service unavailable"
**Solution**: Check that `GROQ_API_KEY` or `OPENAI_API_KEY` is set in `.env.local`

### Problem: Chat doesn't appear
**Solution**: Make sure you're not on `/login` page (chat is hidden there)

### Problem: Slow responses
**Solution**: 
1. Check if Groq API is working (should be 1-2 sec)
2. If falling back to OpenAI, responses take 3-5 sec
3. Check your internet connection

### Problem: API errors
**Solution**:
1. Verify API keys are correct
2. Check API quotas/limits
3. Look at browser console for detailed errors
4. Check `app/api/chat/route.ts` logs

---

## 💡 Advanced Usage

### Custom API Providers

Want to use Hugging Face instead? Edit `app/api/chat/route.ts`:

```typescript
// Add Hugging Face integration
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

if (HUGGINGFACE_TOKEN) {
  const response = await fetch('https://api-inference.huggingface.co/models/YOUR_MODEL', {
    headers: {
      'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: messages[messages.length - 1].content
    })
  });
  // ... handle response
}
```

### Add Voice Input

Install speech recognition:
```bash
npm install react-speech-recognition
```

Add to `AIChat.tsx`:
```typescript
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Add microphone button
<button onClick={SpeechRecognition.startListening}>
  🎤
</button>
```

---

## 📊 Analytics Ideas

Track chatbot usage (optional):

```typescript
// In handleSend function
await fetch('/api/analytics/chat', {
  method: 'POST',
  body: JSON.stringify({
    question: userMessage.content,
    timestamp: new Date()
  })
});
```

---

## 🎓 Learning Resources

- [Groq Documentation](https://console.groq.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## 🎉 Summary

You now have a **production-ready AI chatbot** that:
- ✅ Appears on all pages (except login)
- ✅ Uses Groq API for ultra-fast responses
- ✅ Falls back to OpenAI if needed
- ✅ Specializes in hydrogen technology
- ✅ Matches your beautiful UI design
- ✅ Handles errors gracefully
- ✅ Supports conversation history
- ✅ Includes quick question shortcuts

**Users can now get instant expert help on your platform! 🚀**
