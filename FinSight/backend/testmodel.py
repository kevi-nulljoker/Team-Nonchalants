import os
import shutil
import subprocess
import sys

def rerun_with_python_if_available() -> bool:
    alt_python = shutil.which("python")
    if not alt_python:
        return False
    try:
        if os.path.realpath(alt_python) == os.path.realpath(sys.executable):
            return False
    except OSError:
        return False
    print(f"Retrying with interpreter: {alt_python}")
    result = subprocess.run([alt_python, __file__, *sys.argv[1:]], check=False)
    sys.exit(result.returncode)

try:
    import joblib
except ModuleNotFoundError:
    if not rerun_with_python_if_available():
        print("Missing dependency: joblib")
        print(f"Install it with: {sys.executable} -m pip install joblib scikit-learn")
        sys.exit(1)

try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "expense_classifier (1).pkl")
    model = joblib.load(model_path)
except ModuleNotFoundError:
    if not rerun_with_python_if_available():
        print("Missing dependency while loading model (likely scikit-learn).")
        print(f"Install it with: {sys.executable} -m pip install scikit-learn")
        sys.exit(1)

text = "Swiggy order payment INR 450"
prediction = model.predict([text])[0]
prob = model.predict_proba([text])[0]
confidence = max(prob)
print("Prediction:", prediction)
print("Confidence:", round(confidence, 2))