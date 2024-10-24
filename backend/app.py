import cv2
import os
import time
from flask import Flask, Response, render_template

app = Flask(__name__)

camera = cv2.VideoCapture(0)
save_path = 'backend/static/images'
os.makedirs(save_path, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frames')

def generate_frames():
    while True:
        success, frame = camera.read()

        if not success:
            break

        # 프레임을 지정된 경로에 JPEG 파일로 저장
        filename = os.path.join(save_path, f'frame_{time.time()}.jpg')
        cv2.imwrite(filename, frame)
        
        # 프레임을 HTTP 응답으로 스트리밍
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frames\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
        
        # 파일 삭제
        os.remove(filename)
        time.sleep(1/60)

if __name__ == '__main__':
    app.run(debug=True)