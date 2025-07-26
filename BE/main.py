from langchain_community.document_loaders import WebBaseLoader
from dotenv import load_dotenv
import os
from openai import OpenAI
from tenacity import retry, wait_random_exponential, stop_after_attempt
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.llm import LLMChain
from langchain_core.prompts import ChatPromptTemplate

# Get variable from env
load_dotenv()

# Setup for Azure ChatOpenAI
# client = OpenAI(
#     base_url=os.getenv("AZURE_OPENAI_ENDPOINT"),
#     api_key=os.getenv("AZURE_OPENAI_API_KEY")
# )

# model = "GPT-4o-mini"


@retry(wait=wait_random_exponential(min=5, max=60), stop=stop_after_attempt(4))
def generate_response(customer_review):

    few_shot_examples = [
        {"role": "user", "content": "Analyze this review : The food is delicious"},
        {"role": "assistant",
            "content": "Evaluate : Customer really like  the food. Ranking: Good"},
        {"role": "user", "content": "Analyze this review : You have to pay fee for basic need like tissue"},
        {"role": "assistant", "content": "Evaluate : Customer complain about the fee of basic things. Ranking: Bad"},
        {"role": "user", "content": "Analyze this review : The main dishes is great but the chips is very soft"},
        {"role": "assistant", "content": "Evaluate : Customer like the food but not satisfied about the chip. Ranking: Neutral"}
    ]

    conversation = [
        {"role": "system", "content": "You are a skillful and professional assistant specialized to analyze customer's review"}]

    chain_of_thought_prompt = f"""Analyze this customer review delimited by triple backticks following the previous format and then explain step-to-step how you can give that respone
```{customer_review}```"""

    conversation.extend(few_shot_examples)
    conversation.append({
        "role": "user", "content": chain_of_thought_prompt
    })

    response = client.chat.completions.create(
        model=model,
        messages=conversation,
        temperature=0.5,
    )

    with open("example_1.txt", "w") as wf:
        wf.write("Conversation: \n")
        for messages in conversation:
            wf.write(f"""{messages["role"]} : {messages["content"]} \n""")
        wf.write(f"""assistant: {response.choices[0].message.content}""")


customer_review = "This place is big but furniture inside is very boring"


loader = WebBaseLoader("https://github.com/fastapi/fastapi")
docs = loader.load()

print(docs)

# generate_response(customer_review)
