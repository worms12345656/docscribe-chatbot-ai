# Enhanced RAG Classification System

## Overview

This enhanced version of the RAG (Retrieval-Augmented Generation) system provides intelligent question classification to determine when to use document-based responses vs general AI knowledge.

## Key Improvements

### 🧠 **Smart Question Classification**
- **RAG_REQUIRED**: Questions about specific documents
- **GENERAL_AI**: General knowledge questions
- **HYBRID**: Questions benefiting from both document and general knowledge
- **CLARIFICATION_NEEDED**: Ambiguous questions requiring user input

### 📊 **Confidence Scoring**
- Each classification includes a confidence score (0.0-1.0)
- Low confidence triggers clarification requests
- Transparent reasoning for classification decisions

### 🎯 **Optimized Response Routing**
- Questions are automatically routed to the best response strategy
- Reduced irrelevant document searches
- More accurate and contextual responses

## Architecture

```
User Question → Classification → Routing → Response Generation
     ↓              ↓              ↓              ↓
  Input        Intent Analysis   Path Selection  Final Answer
```

### Classification Categories

| Category | Description | Examples | Keywords |
|----------|-------------|----------|----------|
| **RAG_REQUIRED** | Document-specific questions | "What does the PDF say about...", "According to the document..." | document, file, pdf, text, content, according to |
| **GENERAL_AI** | General knowledge questions | "What is machine learning?", "How do I calculate..." | what is, how to, explain, calculate, define |
| **HYBRID** | Questions needing both sources | "Compare this approach with industry standards" | compare, implications, industry standards, best practices |
| **CLARIFICATION_NEEDED** | Ambiguous questions | "Tell me about it", "What do you think?" | it, this, that, what do you think |

## Files Structure

```
BE/
├── socket_rag_enhanced.py      # Enhanced RAG system with classification
├── main_enhanced.py            # Enhanced WebSocket server
├── test_enhanced_rag.py        # Test script for the system
├── README_ENHANCED_RAG.md      # This documentation
└── socket_rag.py              # Original system (for comparison)
```

## Usage

### 1. **Start the Enhanced WebSocket Server**
```bash
cd BE
python main_enhanced.py
```

### 2. **Test the Classification System**
```bash
python test_enhanced_rag.py
```

Choose between:
- **Automated test**: Predefined questions to demonstrate all categories
- **Interactive test**: Manual question input for testing

### 3. **Integration with Frontend**
Update your frontend WebSocket connection to use the enhanced server:
```javascript
const ws = new WebSocket('ws://localhost:8765');
```

## Example Classifications

### RAG_REQUIRED Questions
```
Input: "What does the document say about machine learning?"
Classification: RAG_REQUIRED (confidence: 0.92)
Reasoning: Question specifically asks about document content
Action: Search documents and provide document-based answer
```

### GENERAL_AI Questions
```
Input: "What is artificial intelligence?"
Classification: GENERAL_AI (confidence: 0.95)
Reasoning: General knowledge question, no document reference
Action: Provide general AI response without document search
```

### HYBRID Questions
```
Input: "Compare the document's approach with industry standards"
Classification: HYBRID (confidence: 0.88)
Reasoning: Requires both document info and general knowledge
Action: Combine document content with general expertise
```

### CLARIFICATION_NEEDED Questions
```
Input: "Tell me about it"
Classification: CLARIFICATION_NEEDED (confidence: 0.15)
Reasoning: Ambiguous reference, unclear what "it" refers to
Action: Ask user for clarification
```

## Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-ada-002
```

### Classification Thresholds
You can adjust these in `socket_rag_enhanced.py`:

```python
# Confidence threshold for clarification requests
if confidence < 0.3:  # Adjust this value
    return "ask_clarification"

# Similarity thresholds for document retrieval
if similarity > 0.5:  # RAG threshold
    relevant_docs.append(doc)

if similarity > 0.4:  # Hybrid threshold
    relevant_docs.append(doc)
```

## Performance Benefits

### 🚀 **Faster Responses**
- General AI questions skip document search
- Reduced API calls to embedding services
- Lower latency for common question types

### 🎯 **Better Accuracy**
- More relevant responses for document questions
- Appropriate knowledge sources for each question type
- Reduced "hallucination" from irrelevant document content

### 💡 **Improved User Experience**
- Clear indication of response sources
- Better handling of ambiguous questions
- More natural conversation flow

## Testing

### Automated Test Suite
The test script includes comprehensive test cases:

```bash
python test_enhanced_rag.py
# Choose option 1 for automated testing
```

### Manual Testing
```bash
python test_enhanced_rag.py
# Choose option 2 for interactive testing
```

### WebSocket Testing
```bash
# Start the server
python main_enhanced.py

# In another terminal, use a WebSocket client
# Or test with your frontend application
```

## Troubleshooting

### Common Issues

1. **Classification Errors**
   - Check OpenAI API key and base URL
   - Verify model availability
   - Check network connectivity

2. **Document Retrieval Issues**
   - Ensure documents exist in `./documents/` directory
   - Check ChromaDB initialization
   - Verify embedding model access

3. **WebSocket Connection Issues**
   - Check if port 8765 is available
   - Verify firewall settings
   - Ensure proper WebSocket client implementation

### Debug Mode
Enable detailed logging by modifying the logging level:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Migration from Original System

### Backward Compatibility
The enhanced system maintains compatibility with existing document processing:
- Same document loading mechanisms
- Same ChromaDB storage
- Same WebSocket protocol

### Migration Steps
1. **Backup original files**
2. **Replace `main.py` with `main_enhanced.py`**
3. **Update frontend to use enhanced server**
4. **Test with existing documents**

## Future Enhancements

### Planned Features
- **Multi-language support** for classification
- **Custom classification rules** for domain-specific questions
- **Learning from user feedback** to improve classification
- **Advanced confidence scoring** with multiple factors

### Extensibility
The modular design allows easy addition of:
- New classification categories
- Custom routing logic
- Specialized response generators
- Integration with external knowledge bases

## Support

For issues or questions about the enhanced RAG system:
1. Check the troubleshooting section
2. Review the test examples
3. Examine the classification logic in the code
4. Test with different question types

---

**Note**: This enhanced system is designed to work alongside your existing frontend. The WebSocket protocol remains the same, so minimal frontend changes are required.
