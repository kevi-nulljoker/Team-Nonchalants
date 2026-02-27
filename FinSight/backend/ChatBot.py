import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request

try:
    from groq import Groq
except Exception:
    Groq = None

try:
    from flask_cors import CORS
except Exception:
    CORS = None

# Always load env from backend/.env regardless of current working directory.
load_dotenv(dotenv_path=Path(__file__).with_name('.env'))

app = Flask(__name__)

if CORS is not None:
    CORS(app)
else:
    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
        return response


def local_finance_reply(user_message: str) -> str:
    text = user_message.lower()

    if 'budget' in text or 'salary' in text:
        return (
            'Direct answer: Use a simple 50/30/20 budget split and review it weekly.\n\n'
            'Key points:\n'
            '1. Keep essentials around 50% (rent, food, bills, EMI minimums).\n'
            '2. Keep wants around 30% and cap discretionary spending categories.\n'
            '3. Save/invest at least 20% into emergency fund and SIPs.\n\n'
            'Next steps:\n'
            '- Track last 30 days of spending by category.\n'
            '- Set a fixed monthly transfer to savings on salary day.'
        )

    if 'sip' in text or 'invest' in text:
        return (
            'Direct answer: Start a monthly SIP amount you can sustain for years, not weeks.\n\n'
            'Key points:\n'
            '1. Begin with diversified funds and increase SIP gradually.\n'
            '2. Keep emergency savings before taking high-risk bets.\n'
            '3. Stay consistent through market ups and downs.\n\n'
            'Next steps:\n'
            '- Decide a fixed SIP date each month.\n'
            '- Review fund performance quarterly, not daily.'
        )

    if 'debt' in text or 'loan' in text or 'emi' in text:
        return (
            'Direct answer: Prioritize high-interest debt first while continuing minimum payments on all loans.\n\n'
            'Key points:\n'
            '1. List all debts by interest rate and outstanding balance.\n'
            '2. Reduce discretionary spending and redirect that cash to debt payoff.\n'
            '3. Avoid taking new debt until EMI load is manageable.\n\n'
            'Next steps:\n'
            '- Build a monthly payoff plan with exact amounts.\n'
            '- Automate EMI payments to avoid penalties.'
        )

    return (
        'Direct answer: I can help with budgeting, expenses, debt, and investing decisions.\n\n'
        'Key points:\n'
        '1. Share your monthly income and major expense categories.\n'
        '2. Mention your current savings/debt status.\n'
        '3. Tell me your financial goal and timeline.\n\n'
        'Next steps:\n'
        '- Ask one specific money question.\n'
        '- I will give a clear action plan.'
    )


GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip()
client = Groq(api_key=GROQ_API_KEY) if (Groq is not None and GROQ_API_KEY) else None


@app.get('/')
def home():
    return jsonify(
        {
            'status': 'ok',
            'message': 'FinSight chatbot API is running.',
            'chat_endpoint': '/chat',
            'model_enabled': client is not None,
        }
    )


@app.post('/chat')
def chat():
    data = request.get_json(silent=True) or {}
    user_message = str(data.get('message', '')).strip()

    if not user_message:
        return jsonify({'reply': 'Please enter a message so I can help.'}), 400

    # Always keep backend responsive even if model/key/dependency is unavailable.
    if client is None:
        return jsonify({'reply': local_finance_reply(user_message), 'source': 'local_fallback'})

    try:
        completion = client.chat.completions.create(
            model='llama-3.1-8b-instant',
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are a helpful financial assistant. '
                        'Always respond politely and professionally. '
                        'Your responses must be clean, structured, and easy to scan like ChatGPT. '
                        'Use this exact response structure in plain text:\n'
                        'Direct answer: <1-2 sentence answer>\n'
                        'Key points:\n'
                        '1. <point one>\n'
                        '2. <point two>\n'
                        '3. <point three>\n'
                        'Next steps:\n'
                        '- <practical action 1>\n'
                        '- <practical action 2>\n'
                        'Rules: keep it concise, avoid long paragraphs, avoid jargon unless requested, '
                        "and tailor details to the user's question."
                    ),
                },
                {'role': 'user', 'content': user_message},
            ],
            temperature=0.3,
            max_tokens=350,
        )

        reply = (completion.choices[0].message.content or '').strip()
        if not reply:
            raise RuntimeError('Empty reply from model')

        return jsonify({'reply': reply, 'source': 'groq'})
    except Exception:
        return jsonify({'reply': local_finance_reply(user_message), 'source': 'local_fallback'})


if __name__ == '__main__':
    port = int(os.getenv('CHATBOT_PORT', '8001'))
    app.run(host='0.0.0.0', port=port, debug=True)
