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
load_dotenv()


# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)
config = {"configurable": {"thread_id": "1"}}

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
        embedding_function=OpenAIEmbeddings(
            base_url=os.environ.get(
                "OPENAI_API_BASE", "https://api.openai.com/v1"),
            model=os.environ.get("EMBEDDING_MODEL", "text-embedding-ada-002"),
            api_key=os.environ.get(
                "EMBEDDING_KEY", os.environ.get("OPENAI_API_KEY"))
        )
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
    "Search and return information from documents (PDF and TXT) stored in the directory, including document name metadata.",
)


@tool
def tts(text):
    """Generate speech file form your input text"""
    text_to_speech(text)
    logger.info(f"Done generating")
    return "Your speech is ready to use"


@tool
def upload_pdf(text):
    """Reading the upload pdf and store it into vector database for searching"""
    load_pdf(text)
    return "Successfully loaded PDF"


tools = [tts, upload_pdf, retriever_tool]
tool_lookup = {tool.name: tool for tool in tools}


# Initialize the response model
response_model = ChatOpenAI(
    model="GPT-4o-mini",
    temperature=0.7,
    timeout=None,
    max_retries=2,
    base_url=os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1"),
    api_key=os.environ.get("OPENAI_API_KEY")
).bind_tools(tools)

# Define prompts
GRADE_PROMPT = (
    "You are a grader assessing relevance of a retrieved document to a user question. \n "
    "Here is the retrieved document: \n\n {context} \n\n"
    "Here is the user question: {question} \n"
    "If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant. \n"
    "Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."
)

REWRITE_PROMPT = (
    "Look at the input and try to reason about the underlying semantic intent / meaning.\n"
    "Here is the initial question:"
    "\n ------- \n"
    "{question}"
    "\n ------- \n"
    "Formulate an improved question:"
)

GENERATE_PROMPT = (
    "You are an assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer the question. "
    "Include the document name from metadata if available. "
    "If you don't know the answer, just say that you don't know. "
    "Use three sentences maximum and keep the answer concise.\n"
    "Question: {question} \n"
    "Context: {context}"
)

# Define grading model


class GradeDocuments(BaseModel):
    """Grade documents using a binary score for relevance check."""
    binary_score: str = Field(
        description="Relevance score: 'yes' if relevant, or 'no' if not relevant"
    )


grader_model = ChatOpenAI(
    model="GPT-4o-mini",
    temperature=0.7,
    timeout=None,
    max_retries=2,
    base_url=os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1"),
    api_key=os.environ.get("OPENAI_API_KEY")
)

# Define graph nodes


def generate_query_or_respond(state: MessagesState):
    """Call the model to generate a response or retrieve information based on the current state."""
    logger.info("Generating query or response")
    try:
        response = response_model.invoke(state["messages"])
        logger.debug(f"Generated response: {response.content[:100]}...")
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"Error in generate_query_or_respond: {str(e)}")
        raise


def grade_documents(state: MessagesState) -> Literal["generate_answer", "rewrite_question"]:
    """Determine whether the retrieved documents are relevant to the question."""
    logger.info("Grading documents for relevance")
    try:
        if state['messages'][-1].tool_call_id:
            return "generate_answer"
        question = state["messages"][0].content
        context = state["messages"][-1].content
        logger.info(f"Grading context: {context}")
        logger.info(f"Grading question: {question}")
        prompt = GRADE_PROMPT.format(question=question, context=context)
        response = grader_model.with_structured_output(GradeDocuments).invoke(
            [{"role": "user", "content": prompt}]
        )
        logger.debug(f"Grading result: {response.binary_score}")
        return "generate_answer" if response.binary_score == "yes" else "rewrite_question"
    except Exception as e:
        logger.error(f"Error in grade_documents: {str(e)}")
        raise


def rewrite_question(state: MessagesState):
    """Rewrite the original user question."""
    logger.info("Rewriting question")
    try:
        question = state["messages"][0].content
        prompt = REWRITE_PROMPT.format(question=question)
        response = response_model.invoke([{"role": "user", "content": prompt}])
        logger.debug(f"Rewritten question: {response.content}")
        return {"messages": [{"role": "user", "content": response.content}]}
    except Exception as e:
        logger.error(f"Error in rewrite_question: {str(e)}")
        raise


def generate_answer(state: MessagesState):
    """Generate an answer based on retrieved context."""
    logger.info("Generating answer")
    try:
        question = state["messages"][0].content
        context = state["messages"][-1].content
        prompt = GENERATE_PROMPT.format(question=question, context=context)
        response = response_model.invoke([{"role": "user", "content": prompt}])
        if response.tool_calls:
            for tool_call in response.tool_calls:
                # Call the actual tool
                # Return result back to model
                second_response = response_model.invoke([
                    HumanMessage(content=prompt),
                    AIMessage(tool_calls=[tool_call], content=''),
                    ToolMessage(
                        tool_call_id=tool_call["id"], content=state["messages"][-1].content)
                ])
                logger.info(f"response: {second_response}")
                return {"messages": [second_response]}
        logger.debug(f"Generated answer: {response.content[:100]}...")
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"Error in generate_answer: {str(e)}")
        raise


# Set up the workflow
workflow = StateGraph(MessagesState)
workflow.add_node(generate_query_or_respond)
workflow.add_node(rewrite_question)
workflow.add_node(generate_answer)

workflow.add_edge(START, "generate_query_or_respond")
# workflow.add_conditional_edges(
#     "generate_query_or_respond",
#     tools_condition,
#     {"tools": "retrieve", END: END},
# )
workflow.add_conditional_edges(
    "generate_query_or_respond",
    tools_condition,
    {"tools": "tools", END: END}
)
tool_node = ToolNode(tools=tools)
workflow.add_node("tools", tool_node)
# workflow.add_conditional_edges("retrieve", grade_documents)
workflow.add_edge("generate_answer", END)
workflow.add_edge("rewrite_question", "generate_query_or_respond")
workflow.add_conditional_edges("tools", grade_documents)
# Compile the graph
try:

    logger.info("Compiling workflow graph")
    checkpointer = InMemorySaver()
    graph = workflow.compile(checkpointer=checkpointer)
    logger.info("Workflow graph compiled successfully")

except Exception as e:
    logger.error(f"Error compiling workflow graph: {str(e)}")
    raise

# Async function to handle user input and stream responses


async def handle_user_input():
    logger.info("Starting chatbot")
    print("Chatbot: Hi! I'm ready to answer questions about documents (PDF and TXT) in the directory. What's your question?")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ['exit', 'quit']:
            logger.info("Exiting chatbot")
            print("Chatbot: Goodbye!")
            break
        logger.info(f"Received user input: {user_input}")
        try:
            async for chunk in graph.astream({"messages": [{"role": "user", "content": user_input}]}, config):
                for node, update in chunk.items():
                    if node == "generate_answer":
                        logger.info("Outputting generated answer")
                        print(f"Chatbot: {update['messages'][-1].content}")
                    elif node == "generate_query_or_respond" and not update["messages"][-1].tool_calls:
                        logger.info("Outputting direct response")
                        print(f"Chatbot: {update['messages'][-1].content}")
        except Exception as e:
            logger.error(f"Error processing user input: {str(e)}")
            print("Chatbot: An error occurred. Please try again.")

# Run the chatbot
if __name__ == "__main__":
    logger.info("Starting main execution")
    try:
        if platform.system() == "Emscripten":
            logger.info("Running in Emscripten environment")
            asyncio.ensure_future(handle_user_input())
        else:
            logger.info("Running in standard environment")
            asyncio.run(handle_user_input())
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        raise


try:
    # Get the graph as PNG bytes
    png_bytes = graph.get_graph().draw_mermaid_png()

    # Write to file
    with open("graph.png", "wb") as f:
        f.write(png_bytes)
    print("Graph image saved to 'graph.png'")
except Exception as e:
    print(f"Failed to save graph image: {e}")
    # This requires some extra dependencies and is optional
    pass
