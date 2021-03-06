import io
from flask import Flask, render_template, request, jsonify, url_for

import backend.detectors as detectors
from backend.predict import predict_breed
from backend.model_functions import load_class_names

application = Flask(__name__)

@application.route('/')
def index():
    return render_template('index.html')

@application.route('/dog_detector')
def dog_detector():
    return render_template('dog_classifier.html')

@application.route('/sentiment')
def sentiment_analysis():
    return render_template('sentiment_analysis.html')

@application.route('/pavilion')
def project_pavilion():
    return render_template('pavilion.html')

@application.route('/built_this')
def built_this():
    return render_template('built_this.html')

@application.route('/upload', methods=['POST'])
def upload_file():
    # loading icon to wait for the image to be loaded
    if 'file' not in request.files:
        resp = jsonify({'message' : 'No file in the request'})
        return resp

    file = request.files['file']

    # process image
    img_bytes = file.read()
    # run image throuh model
    is_dog = detectors.dog_detector(io.BytesIO(img_bytes))
    probs, classes = predict_breed(io.BytesIO(img_bytes))
    class_names = load_class_names()

    # add model output to JSON files
    if is_dog == True:
        is_detected = [{"is_dog": True},
                       {"is_human": False}]
        dog_breeds = [{"breed": class_names[classes[0]], "prob": probs[0]},
                      {"breed": class_names[classes[1]], "prob": probs[1]},
                      {"breed": class_names[classes[2]], "prob": probs[2]},
                      {"breed": class_names[classes[3]], "prob": probs[3]},
                      {"breed": class_names[classes[4]], "prob": probs[4]}]

    else:
        # no dog detected so check for human faces
        faces = detectors.face_detector_haar(io.BytesIO(img_bytes))
        if faces == True:
            is_detected = [{"is_dog": False},
                           {"is_human": True}]
            dog_breeds = [{"breed": class_names[classes[0]], "prob": probs[0]},
                          {"breed": class_names[classes[1]], "prob": probs[1]},
                          {"breed": class_names[classes[2]], "prob": probs[2]},
                          {"breed": class_names[classes[3]], "prob": probs[3]},
                          {"breed": class_names[classes[4]], "prob": probs[4]}]

        else:
            is_detected = [{"is_dog": False},
                           {"is_human": False}]
            dog_breeds = [{"breed": class_names[classes[0]], "prob": probs[0]},
                          {"breed": class_names[classes[1]], "prob": probs[1]},
                          {"breed": class_names[classes[2]], "prob": probs[2]},
                          {"breed": class_names[classes[3]], "prob": probs[3]},
                          {"breed": class_names[classes[4]], "prob": probs[4]}]

    resp = jsonify({"is_detected": is_detected,
                    "dog_breeds": dog_breeds})
    return resp

if __name__ == "__main__":
    application.run(debug=True)