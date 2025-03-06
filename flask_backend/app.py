from flask import Flask, request, jsonify
import boto3
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from Node.js

# Initialize Amazon Bedrock client
bedrock = boto3.client(service_name="bedrock-runtime")

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt_data = data.get("prompt", "")

    if not prompt_data:
        return jsonify({"error": "No prompt provided"}), 400

    limited_prompt = f"{prompt_data}\n\nPlease generate a more in depth story based on the prompt and have it at most three paragraphs long."

    payload = {
        "prompt": limited_prompt,
        "temperature": 0.9
    }

    body = json.dumps(payload)
    model_id = "meta.llama3-3-70b-instruct-v1:0"

    try:
        response = bedrock.invoke_model(
            body=body,
            modelId=model_id,
            accept="application/json",
            contentType="application/json",
        )
        response_body = json.loads(response.get("body").read())

        response_text = response_body.get("generation", response_body.get("output", "Error generating response"))

        paragraphs = response_text.split("\n\n")
        response_text = "\n\n".join(paragraphs[:3])  # Limit to 3 paragraphs

    except Exception as e:
        response_text = f"Error: {str(e)}"

    return jsonify({"aiStory": response_text})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
