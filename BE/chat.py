from typing_extensions import TypedDict
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.runnables import RunnableBranch
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnablePassthrough
from typing import Dict
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import WebBaseLoader
import os
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import InMemorySaver
from langchain.tools import tool
from typing import Annotated
from langchain_text_splitters import CharacterTextSplitter
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import interrupt
from summarize import run_app


load_dotenv()
# Set environment variables early
os.environ['USER_AGENT'] = 'langgraph-summarize-agent'
os.environ["LANGSMITH_TRACING"] = "false"
os.environ["LANGSMITH_PROJECT"] = "summarize-demo"


@tool
def summarize_url(url):
    """Write a concise summary of the following url"""
    run_app(url)


tools = [summarize_url]

chat = ChatOpenAI(
    model="GPT-4o-mini",
    temperature=0.7,
    timeout=None,
    max_retries=2,
    # if you prefer to pass api key in directly instead of using env vars
    base_url=os.environ["OPENAI_API_BASE"],
    api_key=os.environ["OPENAI_API_KEY"],
    # organization="...",
    # other params...
).bind_tools(tools)


config = {"configurable": {"thread_id": "1"}}

memory = InMemorySaver()


class State(TypedDict):
    # Messages have the type "list". The `add_messages` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]


def chatbot(state: State):
    return {"messages": [chat.invoke(state["messages"])]}


graph_builder = StateGraph(State)

graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
graph_builder.add_edge(START, "chatbot")


graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge("chatbot", END)
graph = graph_builder.compile(checkpointer=memory)


def stream_graph_updates(user_input: str):
    for event in graph.stream({"messages": [{"role": "user", "content": user_input}]}, config, stream_mode="values"):
        # print([value[-1] for value in event.values()])
        for value in event.values():
            print("Assistant:", value[-1].content)


# try:
    #     # Get the graph as PNG bytes
    #     png_bytes = graph.get_graph().draw_mermaid_png()

    #     # Write to file
    #     with open("graph.png", "wb") as f:
    #         f.write(png_bytes)
    #     print("Graph image saved to 'graph.png'")
    # except Exception as e:
    #     print(f"Failed to save graph image: {e}")
    #     # This requires some extra dependencies and is optional
    #     pass

while True:
    try:
        user_input = input("User: ")
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Goodbye!")
            break
        stream_graph_updates(user_input)
    except Exception as e:
        print(f"Error: {e}")
        # fallback if input() is not available

        break
