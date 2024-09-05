from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import anthropic

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API"))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json['message']
    difficulty = request.json.get('difficulty', '')
    
    if not difficulty:
        return jsonify({'response': "Please choose a difficulty level: A1 or A2"})
    
    if difficulty not in ['A1', 'A2']:
        return jsonify({'response': "Invalid difficulty level. Please choose A1 or A2."})
    
    # Prepare the system message for Claude
    system_message = f"""You are a French language tutor. The student's proficiency level is {difficulty}. 
    Engage in a conversation in French, keeping the language appropriate for their level. 
    Correct any grammatical errors they make, but keep the corrections simple and encouraging. 
    If the user's input is not in French or is unrelated to French learning, guide them back to practicing French politely in English.
    Respond in this format:
    French response: [Your response in French]
    Correction (if any): [Any corrections to the student's French]
    Explanation: [Brief explanation of the correction or encouragement in English]
    """
    
    # Call Claude API using Messages with correct system parameter usage
    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=300,
        system=system_message,
        messages=[
            {"role": "user", "content": user_input}
        ]
    )
    
    return jsonify({'response': response.content[0].text})

if __name__ == '__main__':
    app.run(debug=True)