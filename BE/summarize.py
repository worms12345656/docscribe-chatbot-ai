from langgraph.graph import END, START, StateGraph
from langgraph.constants import Send
from langchain_core.documents import Document
from langchain.chains.combine_documents.reduce import (
    collapse_docs,
    split_list_of_docs,
)
from typing import Annotated, List, Literal, TypedDict
import operator
from langchain_text_splitters import CharacterTextSplitter
from langchain import hub
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.llm import LLMChain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import WebBaseLoader
import dotenv
import os
dotenv.load_dotenv()

# Set environment variables early
os.environ['USER_AGENT'] = 'langgraph-summarize-agent'
os.environ["LANGSMITH_TRACING"] = "false"
os.environ["LANGSMITH_PROJECT"] = "summarize-demo"


token_max = 1000

map_prompt = hub.pull("rlm/map-prompt")
# Also available via the hub: `hub.pull("rlm/reduce-prompt")`
reduce_template = """
The following is a set of summaries:
{docs}
Take these and distill it into a final, consolidated summary
of the main themes.
"""

reduce_prompt = ChatPromptTemplate([("human", reduce_template)])

llm = ChatOpenAI(

    model="GPT-4o-mini",
    temperature=0.7,
    timeout=None,
    max_retries=2,
    # if you prefer to pass api key in directly instaed of using env vars
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ["OPENAI_API_BASE"],
    # organization="...",
    # other params...
)


# Define prompt
prompt = ChatPromptTemplate.from_messages(
    [("system", "Write a concise summary of the following:\\n\\n{context}")]
)


# Instantiate chain
chain = create_stuff_documents_chain(llm, prompt)


def length_function(documents: List[Document]) -> int:
    """Get number of tokens for input contents."""
    return sum(llm.get_num_tokens(doc.page_content) for doc in documents)


# This will be the overall state of the main graph.
# It will contain the input document contents, corresponding
# summaries, and a final summary.
class OverallState(TypedDict):
    # Notice here we use the operator.add
    # This is because we want combine all the summaries we generate
    # from individual nodes back into one list - this is essentially
    # the "reduce" part
    contents: List[str]
    summaries: Annotated[list, operator.add]
    collapsed_summaries: List[Document]
    final_summary: str


# This will be the state of the node that we will "map" all
# documents to in order to generate summaries
class SummaryState(TypedDict):
    content: str


# Here we generate a summary, given a document
def generate_summary(state: SummaryState):
    prompt = map_prompt.invoke(state["content"])
    response = llm.invoke(prompt)
    return {"summaries": [response.content]}


# Here we define the logic to map out over the documents
# We will use this an edge in the graph
def map_summaries(state: OverallState):
    # We will return a list of `Send` objects
    # Each `Send` object consists of the name of a node in the graph
    # as well as the state to send to that node
    return [
        Send("generate_summary", {"content": content}) for content in state["contents"]
    ]


def collect_summaries(state: OverallState):
    return {
        "collapsed_summaries": [Document(summary) for summary in state["summaries"]]
    }


def _reduce(input: dict) -> str:
    prompt = reduce_prompt.invoke(input)
    response = llm.invoke(prompt)
    return response.content


# Add node to collapse summaries
def collapse_summaries(state: OverallState):
    doc_lists = split_list_of_docs(
        state["collapsed_summaries"], length_function, token_max
    )
    results = []
    for doc_list in doc_lists:
        results.append(collapse_docs(doc_list, _reduce))

    return {"collapsed_summaries": results}


# This represents a conditional edge in the graph that determines
# if we should collapse the summaries or not
def should_collapse(
    state: OverallState,
) -> Literal["collapse_summaries", "generate_final_summary"]:
    num_tokens = length_function(state["collapsed_summaries"])
    if num_tokens > token_max:
        return "collapse_summaries"
    else:
        return "generate_final_summary"


# Here we will generate the final summary
def generate_final_summary(state: OverallState):
    response = _reduce(state["collapsed_summaries"])
    return {"final_summary": response}


# Construct the graph
# Nodes:
graph = StateGraph(OverallState)
graph.add_node("generate_summary", generate_summary)  # same as before
graph.add_node("collect_summaries", collect_summaries)
graph.add_node("collapse_summaries", collapse_summaries)
graph.add_node("generate_final_summary", generate_final_summary)

# Edges:
graph.add_conditional_edges(START, map_summaries, ["generate_summary"])
graph.add_edge("generate_summary", "collect_summaries")
graph.add_conditional_edges("collect_summaries", should_collapse)
graph.add_conditional_edges("collapse_summaries", should_collapse)
graph.add_edge("generate_final_summary", END)

app = graph.compile()

# Save the graph image to a file
# try:
#     # Get the graph as PNG bytes
#     png_bytes = app.get_graph().draw_mermaid_png()

#     # Write to file
#     with open("graph.png", "wb") as f:
#         f.write(png_bytes)
#     print("Graph image saved to 'graph.png'")
# except Exception as e:
#     print(f"Failed to save graph image: {e}")
#     # This requires some extra dependencies and is optional
#     pass


def run_app(url):

    # Invoke chain
    loader = WebBaseLoader(url)
    docs = loader.load()
    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=1000, chunk_overlap=0
    )
    split_docs = text_splitter.split_documents(docs)
    print(f"Generated {len(split_docs)} documents.")
    print("Generating summary...")
    for token in chain.stream({"context": docs}):
        print(token, end="")
    print("\n\nSummary complete!")


# run_app()
