#!/usr/bin/env python3
"""
Test script for the Voice-Enhanced RAG Classification System
This script demonstrates voice input capabilities and enhanced RAG classification.
"""

import asyncio
import sys
import os
import json
import base64

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from voice_enhanced_rag import handle_voice_enhanced_input, test_voice_enhanced_system


async def test_text_input():
    """Test the voice-enhanced system with text input."""
    print("📝 Testing Text Input Mode")
    print("=" * 40)
    
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
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{i}. Question: {question}")
        print("   Processing...")
        
        try:
            response = await handle_voice_enhanced_input(question, "text")
            print(f"   Response: {response[:200]}{'...' if len(response) > 200 else ''}")
        except Exception as e:
            print(f"   Error: {str(e)}")
        
        print("   " + "-" * 30)
    
    print("\n✅ Text input tests completed!")


async def test_voice_input_simulation():
    """Test voice input simulation (without actual audio)."""
    print("\n🎤 Testing Voice Input Simulation")
    print("=" * 40)
    print("Note: This simulates voice input processing without actual audio files.")
    
    # Simulate voice input by providing a base64 placeholder
    simulated_audio = base64.b64encode(b"simulated_audio_data").decode('utf-8')
    
    test_voice_questions = [
        "What is machine learning?",
        "How do I calculate the area of a circle?",
        "What does the document say about AI?"
    ]
    
    for i, question in enumerate(test_voice_questions, 1):
        print(f"\n{i}. Simulated Voice Question: {question}")
        print("   Processing voice input...")
        
        try:
            # Simulate voice processing
            print("   [Voice would be transcribed to:] " + question)
            response = await handle_voice_enhanced_input(question, "text")
            print(f"   Response: {response[:200]}{'...' if len(response) > 200 else ''}")
        except Exception as e:
            print(f"   Error: {str(e)}")
        
        print("   " + "-" * 30)
    
    print("\n✅ Voice input simulation completed!")


async def interactive_test():
    """Interactive test mode for manual input testing."""
    print("🎯 Interactive Voice-Enhanced RAG Test Mode")
    print("=" * 50)
    print("Type your questions and see how the system classifies them.")
    print("Type 'quit' to exit.")
    print("Type 'voice' to simulate voice input mode.\n")
    
    voice_mode = False
    
    while True:
        try:
            if voice_mode:
                user_input = input("🎤 Voice Mode - Question: ").strip()
            else:
                user_input = input("📝 Text Mode - Question: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if user_input.lower() == 'voice':
                voice_mode = not voice_mode
                mode = "Voice" if voice_mode else "Text"
                print(f"Switched to {mode} mode")
                continue
            
            if not user_input:
                continue
            
            print("🤖 Processing...")
            
            if voice_mode:
                # Simulate voice processing
                print(f"🎤 [Voice transcription: {user_input}]")
                response = await handle_voice_enhanced_input(user_input, "text")
            else:
                response = await handle_voice_enhanced_input(user_input, "text")
            
            print(f"Assistant: {response}\n")
            
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {str(e)}\n")


def main():
    """Main function to run voice-enhanced tests."""
    print("🎤 Voice-Enhanced RAG Classification System")
    print("Choose test mode:")
    print("1. Automated text input test")
    print("2. Voice input simulation test")
    print("3. Interactive test (manual input)")
    print("4. Run full system test")
    
    while True:
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == "1":
            asyncio.run(test_text_input())
            break
        elif choice == "2":
            asyncio.run(test_voice_input_simulation())
            break
        elif choice == "3":
            asyncio.run(interactive_test())
            break
        elif choice == "4":
            asyncio.run(test_voice_enhanced_system())
            break
        else:
            print("Invalid choice. Please enter 1-4.")


if __name__ == "__main__":
    main()
