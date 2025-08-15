#!/usr/bin/env python3
"""
Test script for the Enhanced RAG Classification System
This script demonstrates how the system classifies different types of questions
and routes them to appropriate response strategies.
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from socket_rag_enhanced import handle_user_input_enhanced


async def test_question_classification():
    """Test the enhanced classification system with various question types."""
    
    # Test questions covering different classification categories
    test_cases = [
        {
            "category": "RAG_REQUIRED",
            "questions": [
                "What does the document say about machine learning?",
                "According to the PDF, what are the main findings?",
                "What's in the text file about artificial intelligence?",
                "Can you tell me what the document mentions about data science?",
                "What does the uploaded file say about neural networks?"
            ]
        },
        {
            "category": "GENERAL_AI", 
            "questions": [
                "What is artificial intelligence?",
                "How do I calculate the area of a circle?",
                "Explain quantum physics in simple terms",
                "What is the capital of France?",
                "How does photosynthesis work?"
            ]
        },
        {
            "category": "HYBRID",
            "questions": [
                "Compare the document's approach with industry standards",
                "What are the implications of this document's findings?",
                "How does this document's methodology compare to best practices?",
                "What are the broader implications of the document's conclusions?"
            ]
        },
        {
            "category": "CLARIFICATION_NEEDED",
            "questions": [
                "Tell me about it",
                "What do you think?",
                "Can you help me with this?",
                "I need some information",
                "What about that thing?"
            ]
        }
    ]
    
    print("🧠 Enhanced RAG Classification System Test")
    print("=" * 60)
    print("This test demonstrates how the system classifies questions and routes them appropriately.\n")
    
    for test_case in test_cases:
        category = test_case["category"]
        questions = test_case["questions"]
        
        print(f"📋 Testing {category} Questions:")
        print("-" * 40)
        
        for i, question in enumerate(questions, 1):
            print(f"\n{i}. Question: {question}")
            print("   Processing...")
            
            try:
                response = await handle_user_input_enhanced(question)
                print(f"   Response: {response[:200]}{'...' if len(response) > 200 else ''}")
            except Exception as e:
                print(f"   Error: {str(e)}")
            
            print("   " + "-" * 30)
        
        print(f"\n✅ Completed {category} tests\n")
    
    print("🎉 All tests completed!")
    print("\nKey Improvements:")
    print("• Better question intent classification")
    print("• Confidence scoring for decisions")
    print("• Appropriate routing to RAG, General AI, or Hybrid responses")
    print("• Clarification requests for ambiguous questions")


async def interactive_test():
    """Interactive test mode for manual question testing."""
    print("🎯 Interactive Enhanced RAG Test Mode")
    print("=" * 40)
    print("Type your questions and see how the system classifies them.")
    print("Type 'quit' to exit.\n")
    
    while True:
        try:
            question = input("You: ").strip()
            
            if question.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if not question:
                continue
            
            print("🤖 Processing...")
            response = await handle_user_input_enhanced(question)
            print(f"Assistant: {response}\n")
            
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {str(e)}\n")


def main():
    """Main function to run tests."""
    print("Enhanced RAG Classification System")
    print("Choose test mode:")
    print("1. Automated test with predefined questions")
    print("2. Interactive test (manual input)")
    
    while True:
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == "1":
            asyncio.run(test_question_classification())
            break
        elif choice == "2":
            asyncio.run(interactive_test())
            break
        else:
            print("Invalid choice. Please enter 1 or 2.")


if __name__ == "__main__":
    main()
