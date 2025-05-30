import base64
from datetime import date
from os import path

from jinja2 import BaseLoader, Environment

from app.ds_config import TPL_PATH, IMG_PATH

def render_transcript(student_name):
    """Get base64 transcript
    Parameters:
        student_name (str): student full name.
    Returns:
        base64 transcript.
    """
    with open(path.join(TPL_PATH, 'transcript.html'), 'r') as file:
        transcript = file.read()
    # Get base64 logo representation to paste it into the html
    with open(path.join(IMG_PATH, 'logo.png'), 'rb') as file:
        img_base64_src = base64.b64encode(file.read()).decode('utf-8')
    transcript = Environment(loader=BaseLoader).from_string(transcript)\
        .render(
            img_base64_src=img_base64_src,
            student_name=student_name,
            date_today=date.today().strftime('%B %d, %Y')

    )
    return transcript