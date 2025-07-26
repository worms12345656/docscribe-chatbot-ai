from typing import Annotated

from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
import os
from langchain_openai import ChatOpenAI

from langchain_tavily import TavilySearch
from langgraph.prebuilt import ToolNode, tools_condition

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command, interrupt

from dotenv import load_dotenv
load_dotenv()

memory = InMemorySaver()


tool = TavilySearch(max_results=2)
tools = [tool]

config = {"configurable": {"thread_id": "1"}}

llm = ChatOpenAI(
    model="GPT-4o-mini",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    # if you prefer to pass api key in directly instaed of using env vars
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ["BASE_URL"],
    # organization="...",
    # other params...
).bind_tools(tools)


class State(TypedDict):
    # Messages have the type "list". The `add_messages` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]


def chatbot(state: State):
    return {"messages": [llm.invoke(state["messages"])]}


@tool
def human_assistance(query: str) -> str:
    """Request assistance from a human."""
    human_response = interrupt({"query": query})
    return human_response["data"]


graph_builder = StateGraph(State)


# The first argument is the unique node name
# The second argument is the function or object that will be called whenever
# the node is used.
graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=[tool])
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
graph_builder.add_edge(START, "chatbot")


graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge("chatbot", END)
graph = graph_builder.compile(checkpointer=memory)

# Save the graph image to a file
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


def stream_graph_updates(user_input: str):
    for event in graph.stream({"messages": [{"role": "user", "content": user_input}]}, config, stream_mode="values"):
        for value in event.values():
            print("Assistant:", value["messages"][-1].content)


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
