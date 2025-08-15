from tts import text_to_speech
import logging
import PyPDF2
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_core.tools import create_retriever_tool, tool
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langgraph.checkpoint.memory import InMemorySaver
from typing import Literal
import os
import platform
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.tools.retriever import create_retriever_tool
from langgraph.graph import MessagesState, StateGraph, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain.schema import HumanMessage, AIMessage
from langchain.schema.messages import ToolMessage
from pydantic import BaseModel, Field
from typing import List, Literal
import asyncio
from langchain_core.documents import Document
from dotenv import load_dotenv
import websockets
import json
import base64
import wave
import numpy as np
import whisper
import tempfile
import io
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)
config = {"configurable": {"thread_id": "1"}}

# Initialize Whisper model for speech-to-text
try:
    logger.info("Loading Whisper model for speech-to-text...")
    whisper_model = whisper.load_model("base")  # Using base model for faster processing
    logger.info("Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Error loading Whisper model: {str(e)}")
    whisper_model = None

# Custom loader for PDF files using PyPDF2
def load_pdf(file_path: str) -> List[Document]:
    """Load a PDF file and return a list of Documents with metadata."""
    try:
        logger.info(f"Attempting to load PDF: {file_path}")
        with open(file_path, "rb") as file:
            pdf = PyPDF2.PdfReader(file)
            if len(pdf.pages) == 0:
                logger.warning(f"PDF {file_path} is empty")
                return []
            text = ""
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text() or ""
                text += page_text
                logger.debug(
                    f"Extracted text from page {page_num} of {file_path}: {page_text[:100]}...")
            if not text.strip():
                logger.warning(f"No text extracted from PDF: {file_path}")
                return []
            metadata = {"source": file_path,
                        "document_name": os.path.basename(file_path)}
            logger.info(f"Successfully loaded PDF: {file_path}")
            return [Document(page_content=text, metadata=metadata)]
    except Exception as e:
        logger.error(f"Error loading PDF {file_path}: {str(e)}")
        return []

# Custom loader for TXT files
def load_txt(file_path: str) -> List[Document]:
    """Load a text file and return a list of Documents with metadata."""
    try:
        logger.info(f"Attempting to load TXT: {file_path}")
        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read()
            if not text.strip():
                logger.warning(f"No text extracted from TXT: {file_path}")
                return []
            metadata = {"source": file_path,
                        "document_name": os.path.basename(file_path)}
            logger.info(f"Successfully loaded TXT: {file_path}")
            return [Document(page_content=text, metadata=metadata)]
    except Exception as e:
        logger.error(f"Error loading TXT {file_path}: {str(e)}")
        return []

embedding_client = OpenAIEmbeddings(
    base_url=os.environ.get(
        "OPENAI_API_BASE", "https://api.openai.com/v1"),
    model=os.environ.get("EMBEDDING_MODEL", "text-embedding-ada-002"),
    api_key=os.environ.get(
        "EMBEDDING_KEY", os.environ.get("OPENAI_API_KEY"))
)

# Load and process documents from directory
directory_path = "./documents"
docs_list = []
try:
    logger.info(f"Checking directory: {directory_path}")
    if not os.path.exists(directory_path):
        logger.error(f"Directory {directory_path} does not exist")
        raise FileNotFoundError(f"Directory {directory_path} does not exist")

    # List directory contents for debugging
    directory_contents = []
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.lower().endswith((".txt", ".pdf")):
                directory_contents.append(os.path.join(root, file))
    logger.info(
        f"Found {len(directory_contents)} files in directory: {directory_contents}")

    if not directory_contents:
        logger.warning(f"No .txt or .pdf files found in {directory_path}")
    else:
        logger.info(f"Loading documents from directory: {directory_path}")
        for file_path in directory_contents:
            if file_path.lower().endswith(".pdf"):
                docs_list.extend(load_pdf(file_path))
            elif file_path.lower().endswith(".txt"):
                docs_list.extend(load_txt(file_path))
            else:
                logger.warning(f"Skipping unsupported file: {file_path}")
        logger.info(f"Loaded {len(docs_list)} documents from {directory_path}")
except Exception as e:
    logger.error(f"Failed to load documents: {str(e)}")
    docs_list = []

# Add metadata with document name
for doc in docs_list:
    doc.metadata["document_name"] = os.path.basename(
        doc.metadata.get("source", "unknown"))
    logger.debug(
        f"Added metadata for document: {doc.metadata['document_name']}")

# Split documents
try:
    logger.info("Splitting documents into chunks")
    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=100, chunk_overlap=50
    )
    doc_splits = text_splitter.split_documents(docs_list)
    logger.info(f"Created {len(doc_splits)} document chunks")
except Exception as e:
    logger.error(f"Error splitting documents: {str(e)}")
    doc_splits = []

# Set up persistent Chroma vector store
try:
    logger.info("Initializing Chroma vector store")
    vectorstore = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embedding_client
    )
    logger.info("Chroma vector store initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Chroma vector store: {str(e)}")
    raise

# Check for existing documents and insert only new ones
try:
    logger.info("Checking for existing documents in ChromaDB")
    existing_docs = vectorstore.get()
    existing_names = {doc["document_name"]
                      for doc in existing_docs["metadatas"] if doc.get("document_name")}
    logger.info(
        f"Found {len(existing_names)} existing documents in ChromaDB: {existing_names}")

    new_docs = [
        doc for doc in doc_splits if doc.metadata["document_name"] not in existing_names]
    logger.info(f"Identified {len(new_docs)} new document chunks to embed")

    if new_docs:
        logger.info("Adding new documents to ChromaDB")
        vectorstore.add_documents(new_docs)
        vectorstore.persist()
        logger.info(
            f"Successfully added {len(new_docs)} new document chunks to ChromaDB")
    else:
        logger.info("No new documents to add")
except Exception as e:
    logger.error(f"Error managing documents in ChromaDB: {str(e)}")
    raise

retriever = vectorstore.as_retriever()

# Create retriever tool
retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_documents",
    description="Search and return information from documents (PDF and TXT) stored in the directory, including document name metadata.",
)

@tool
def tts(text):
    """Generate speech file form your input text"""
    text_to_speech(text)
    logger.info(f"Done generating")
    return "Your speech is ready to use"

@tool
def speech_to_text(audio_data_base64: str):
    """Convert speech audio to text using Whisper"""
    try:
        logger.info("Converting speech to text...")
        
        # Decode base64 audio data
        audio_data = base64.b64decode(audio_data_base64)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        # Transcribe using Whisper
        if whisper_model:
            result = whisper_model.transcribe(temp_file_path)
            transcription = result["text"].strip()
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            
            logger.info(f"Transcription: {transcription}")
            return transcription
        else:
            return "Speech-to-text model not available"
            
    except Exception as e:
        logger.error(f"Error in speech-to-text: {str(e)}")
        return f"Error transcribing speech: {str(e)}"

tools = [tts, retriever_tool, speech_to_text]
tool_lookup = {tool.name: tool for tool in tools}

# Initialize the response model
response_model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    timeout=None,
    max_retries=2,
    base_url=os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1"),
    api_key=os.environ.get("OPENAI_API_KEY")
).bind_tools(tools)

# Enhanced classification model
classifier_model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,  # Lower temperature for more consistent classification
    timeout=None,
    max_retries=2,
    base_url=os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1"),
    api_key=os.environ.get("OPENAI_API_KEY")
)

# Enhanced classification model
class QuestionClassification(BaseModel):
    """Enhanced question classification with confidence scoring."""
    intent: str = Field(
        description="Question intent: RAG_REQUIRED, GENERAL_AI, HYBRID, CLARIFICATION_NEEDED"
    )
    confidence: float = Field(
        description="Confidence score from 0.0 to 1.0"
    )
    reasoning: str = Field(
        description="Brief explanation of the classification decision"
    )
    requires_documents: bool = Field(
        description="Whether the question requires document retrieval"
    )
    suggested_action: str = Field(
        description="Recommended action: USE_RAG, USE_GENERAL_AI, USE_HYBRID, ASK_CLARIFICATION"
    )

# Enhanced prompts for better classification
QUESTION_CLASSIFICATION_PROMPT = """
You are an expert at classifying user questions to determine the best response strategy.

Analyze this question: "{question}"

Classify the question into one of these categories:

1. RAG_REQUIRED: Questions that specifically ask about content in uploaded documents
   - Examples: "What does the document say about...", "According to the PDF...", "What's in the text file about..."
   - Keywords: document, file, pdf, text, content, according to, in the document

2. GENERAL_AI: Questions that don't require document knowledge
   - Examples: "What is machine learning?", "How do I calculate...", "Explain quantum physics"
   - Keywords: what is, how to, explain, calculate, define, general knowledge

3. HYBRID: Questions that could benefit from both document info and general knowledge
   - Examples: "Compare this document's approach with industry standards", "What are the implications of this document's findings?"
   - Keywords: compare, implications, industry standards, best practices

4. CLARIFICATION_NEEDED: Ambiguous questions requiring user input
   - Examples: "Tell me about it", "What do you think?", vague references
   - Keywords: it, this, that, what do you think, tell me about

Provide a confidence score (0.0-1.0) and clear reasoning for your decision.
"""

# Enhanced prompts for different response types
RAG_PROMPT = """
You are an assistant specialized in answering questions about uploaded documents.
Use the following pieces of retrieved context to answer the question.
Include the document name from metadata when relevant.
If you don't know the answer, just say that you don't know.
Keep the answer concise and focused on the document content.

Question: {question}
Context: {context}

Answer based on the document content:
"""

GENERAL_AI_PROMPT = """
You are a helpful AI assistant. Answer the following question using your general knowledge.
Provide accurate, helpful information in a conversational tone.

Question: {question}

Answer:
"""

HYBRID_PROMPT = """
You are an assistant that combines document knowledge with general expertise.
Use the retrieved document context AND your general knowledge to provide a comprehensive answer.
Clearly distinguish between document-specific information and general knowledge.

Question: {question}
Document Context: {context}

Provide a comprehensive answer that combines both sources:
"""

CLARIFICATION_PROMPT = """
The question is unclear and needs clarification. Help the user rephrase their question to get a better answer.

Original Question: {question}

Suggest a clarification or ask follow-up questions to better understand what they're looking for.
"""

# Define graph nodes with enhanced classification

def classify_question_intent(state: MessagesState):
    """Enhanced question classification to determine response strategy."""
    logger.info("Classifying question intent")
    try:
        question = state["messages"][-1].content
        
        # Use the classifier model to determine intent
        prompt = QUESTION_CLASSIFICATION_PROMPT.format(question=question)
        response = classifier_model.with_structured_output(QuestionClassification).invoke(
            [{"role": "user", "content": prompt}]
        )
        
        logger.info(f"Question classification: {response.intent} (confidence: {response.confidence})")
        logger.info(f"Reasoning: {response.reasoning}")
        
        # Store classification in state for later use
        classification_data = {
            "intent": response.intent,
            "confidence": response.confidence,
            "reasoning": response.reasoning,
            "requires_documents": response.requires_documents,
            "suggested_action": response.suggested_action
        }
        
        # Add classification metadata to the message
        classified_message = {
            "role": "user", 
            "content": question,
            "metadata": {"classification": classification_data}
        }
        
        return {"messages": [classified_message]}
        
    except Exception as e:
        logger.error(f"Error in classify_question_intent: {str(e)}")
        # Fallback to RAG_REQUIRED if classification fails
        fallback_message = {
            "role": "user", 
            "content": question,
            "metadata": {
                "classification": {
                    "intent": "RAG_REQUIRED",
                    "confidence": 0.5,
                    "reasoning": "Classification failed, defaulting to RAG",
                    "requires_documents": True,
                    "suggested_action": "USE_RAG"
                }
            }
        }
        return {"messages": [fallback_message]}

def route_question(state: MessagesState) -> Literal["use_rag", "use_general_ai", "use_hybrid", "ask_clarification"]:
    """Route question based on classification."""
    logger.info("Routing question based on classification")
    try:
        # Get classification from message metadata
        message = state["messages"][-1]
        classification = message.metadata.get("classification", {})
        suggested_action = classification.get("suggested_action", "USE_RAG")
        confidence = classification.get("confidence", 0.5)
        
        # If confidence is low, ask for clarification
        if confidence < 0.3:
            logger.info("Low confidence classification, asking for clarification")
            return "ask_clarification"
        
        # Route based on suggested action
        if suggested_action == "USE_RAG":
            return "use_rag"
        elif suggested_action == "USE_GENERAL_AI":
            return "use_general_ai"
        elif suggested_action == "USE_HYBRID":
            return "use_hybrid"
        else:
            return "ask_clarification"
            
    except Exception as e:
        logger.error(f"Error in route_question: {str(e)}")
        return "use_rag"  # Default to RAG

def generate_rag_response(state: MessagesState):
    """Generate response using RAG (document retrieval)."""
    logger.info("Generating RAG response")
    try:
        question = state["messages"][-1].content
        
        # Retrieve relevant documents
        results = vectorstore.similarity_search_with_score(question, k=3)
        relevant_docs = []
        
        for doc, score in results:
            similarity = 1 - score
            if similarity > 0.5:  # Lower threshold for more inclusive retrieval
                relevant_docs.append(doc)
        
        if relevant_docs:
            context = "\n".join([f"[{doc.metadata.get('document_name', 'Unknown')}]: {doc.page_content}" 
                               for doc in relevant_docs])
            prompt = RAG_PROMPT.format(question=question, context=context)
        else:
            prompt = f"Question: {question}\n\nNo relevant documents found. Please provide a general answer."
        
        response = response_model.invoke([{"role": "user", "content": prompt}])
        return {"messages": [response]}
        
    except Exception as e:
        logger.error(f"Error in generate_rag_response: {str(e)}")
        raise

def generate_general_ai_response(state: MessagesState):
    """Generate response using general AI knowledge."""
    logger.info("Generating general AI response")
    try:
        question = state["messages"][-1].content
        prompt = GENERAL_AI_PROMPT.format(question=question)
        
        response = response_model.invoke([{"role": "user", "content": prompt}])
        return {"messages": [response]}
        
    except Exception as e:
        logger.error(f"Error in generate_general_ai_response: {str(e)}")
        raise

def generate_hybrid_response(state: MessagesState):
    """Generate response combining RAG and general AI."""
    logger.info("Generating hybrid response")
    try:
        question = state["messages"][-1].content
        
        # Retrieve documents
        results = vectorstore.similarity_search_with_score(question, k=2)
        relevant_docs = []
        
        for doc, score in results:
            similarity = 1 - score
            if similarity > 0.4:  # Even lower threshold for hybrid
                relevant_docs.append(doc)
        
        context = "\n".join([f"[{doc.metadata.get('document_name', 'Unknown')}]: {doc.page_content}" 
                           for doc in relevant_docs]) if relevant_docs else "No specific document context available."
        
        prompt = HYBRID_PROMPT.format(question=question, context=context)
        response = response_model.invoke([{"role": "user", "content": prompt}])
        return {"messages": [response]}
        
    except Exception as e:
        logger.error(f"Error in generate_hybrid_response: {str(e)}")
        raise

def ask_clarification(state: MessagesState):
    """Ask user for clarification when question is unclear."""
    logger.info("Asking for clarification")
    try:
        question = state["messages"][-1].content
        prompt = CLARIFICATION_PROMPT.format(question=question)
        
        response = response_model.invoke([{"role": "user", "content": prompt}])
        return {"messages": [response]}
        
    except Exception as e:
        logger.error(f"Error in ask_clarification: {str(e)}")
        raise

# Set up the enhanced workflow
workflow = StateGraph(MessagesState)

# Add nodes
workflow.add_node("classify_question_intent", classify_question_intent)
workflow.add_node("generate_rag_response", generate_rag_response)
workflow.add_node("generate_general_ai_response", generate_general_ai_response)
workflow.add_node("generate_hybrid_response", generate_hybrid_response)
workflow.add_node("ask_clarification", ask_clarification)

# Add edges
workflow.add_edge(START, "classify_question_intent")
workflow.add_conditional_edges(
    "classify_question_intent",
    route_question,
    {
        "use_rag": "generate_rag_response",
        "use_general_ai": "generate_general_ai_response", 
        "use_hybrid": "generate_hybrid_response",
        "ask_clarification": "ask_clarification"
    }
)

# End edges
workflow.add_edge("generate_rag_response", END)
workflow.add_edge("generate_general_ai_response", END)
workflow.add_edge("generate_hybrid_response", END)
workflow.add_edge("ask_clarification", END)

# Compile the graph
try:
    logger.info("Compiling enhanced workflow graph")
    checkpointer = InMemorySaver()
    graph = workflow.compile(checkpointer=checkpointer)
    logger.info("Enhanced workflow graph compiled successfully")
except Exception as e:
    logger.error(f"Error compiling enhanced workflow graph: {str(e)}")
    raise

# Save the graph image
try:
    png_bytes = graph.get_graph().draw_mermaid_png()
    with open("voice_enhanced_graph.png", "wb") as f:
        f.write(png_bytes)
    print("Voice enhanced graph image saved to 'voice_enhanced_graph.png'")
except Exception as e:
    print(f"Failed to save voice enhanced graph image: {e}")

# Enhanced async function to handle user input (text or voice)
async def handle_voice_enhanced_input(user_input, input_type="text"):
    """Enhanced user input handler with voice support."""
    logger.info(f"Starting voice-enhanced chatbot with {input_type} input")
    
    if input_type == "voice":
        # Handle voice input
        if user_input.lower() in ['exit', 'quit']:
            logger.info("Exiting voice-enhanced chatbot")
            return "Goodbye!"
        
        try:
            # Convert speech to text first
            transcription = speech_to_text(user_input)
            if transcription.startswith("Error"):
                return f"Voice recognition error: {transcription}"
            
            logger.info(f"Voice transcription: {transcription}")
            user_input = transcription
        
        except Exception as e:
            logger.error(f"Error processing voice input: {str(e)}")
            return "Error processing voice input. Please try again."
    
    # Process the text (either original or transcribed)
    if user_input.lower() in ['exit', 'quit']:
        logger.info("Exiting voice-enhanced chatbot")
        return "Goodbye!"
    
    try:
        async for chunk in graph.astream({"messages": [{"role": "user", "content": user_input}]}, config):
            for node, update in chunk.items():
                if node in ["generate_rag_response", "generate_general_ai_response", "generate_hybrid_response", "ask_clarification"]:
                    logger.info(f"Outputting response from {node}")
                    return f"{update['messages'][-1].content}"
                    
    except Exception as e:
        logger.error(f"Error processing user input: {str(e)}")
        return "An error occurred. Please try again."

# Voice processing utilities
def process_audio_chunk(audio_chunk_base64):
    """Process audio chunk and return transcription."""
    try:
        transcription = speech_to_text(audio_chunk_base64)
        return {"success": True, "transcription": transcription}
    except Exception as e:
        logger.error(f"Error processing audio chunk: {str(e)}")
        return {"success": False, "error": str(e)}

# Test function for the voice-enhanced system
async def test_voice_enhanced_system():
    """Test the voice-enhanced classification system."""
    test_questions = [
        "What does the document say about machine learning?",
        "What is artificial intelligence?",
        "How do I calculate the area of a circle?",
        "Compare the document's approach with industry standards",
        "Tell me about it",
        "What happened in the document?",
        "Explain quantum physics",
        "What are the key findings in the PDF?"
    ]
    
    print("🎤 Testing Voice-Enhanced RAG Classification System")
    print("=" * 60)
    print("This test demonstrates the enhanced system with voice input support.\n")
    
    for i, question in enumerate(test_questions, 1):
        print(f"{i}. Question: {question}")
        print("   Processing...")
        
        try:
            response = await handle_voice_enhanced_input(question, "text")
            print(f"   Response: {response[:200]}{'...' if len(response) > 200 else ''}")
        except Exception as e:
            print(f"   Error: {str(e)}")
        
        print("   " + "-" * 30)
    
    print("🎉 Voice-enhanced tests completed!")
    print("\nVoice Features Added:")
    print("• Speech-to-text using Whisper")
    print("• Audio processing capabilities")
    print("• Voice input integration")
    print("• Enhanced RAG classification")

# Run the voice-enhanced chatbot
if __name__ == "__main__":
    logger.info("Starting voice-enhanced main execution")
    try:
        if platform.system() == "Emscripten":
            logger.info("Running in Emscripten environment")
            asyncio.ensure_future(test_voice_enhanced_system())
        else:
            logger.info("Running in standard environment")
            asyncio.run(test_voice_enhanced_system())
    except Exception as e:
        logger.error(f"Error in voice-enhanced main execution: {str(e)}")
        raise
