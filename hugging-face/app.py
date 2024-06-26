import gradio as gr # Create an interactive interface
from ultralytics import YOLO # Load a YOLOv8 model
import cv2 # Manipulate images
import base64 # Decode binary data encoded in Base64
import numpy as np # Turn binary data into a Numpy array

# Machine Learning Model
model = YOLO('best.pt')

# Text Font
font = cv2.FONT_HERSHEY_SIMPLEX

# Colors
colors = {0:(255,0,0), 1:(0,0,255), 2:(0,255,0)}

# Classes
classes = {0:'text', 1:'input', 2:'media'}

# Create Labeled Images
def labeled_image(img, boxes):
  h, w, _ = img.shape
  for i in range(len(boxes[0])):
    cv2.rectangle(img, (int(boxes[1][i][0]*w), int(boxes[1][i][1]*h)), (int(boxes[1][i][2]*w), int(boxes[1][i][3]*h)), color=colors[boxes[0][i]], thickness=min(w,h)//1000+1)
    size = max(1, min((int(boxes[1][i][2]*h)-int(boxes[1][i][0]*h))//24, (int(boxes[1][i][3]*h)-int(boxes[1][i][1]*h))//24))
    (t_w, t_h), _ = cv2.getTextSize(str(i), font, size, max(2, int(size)))
    cv2.putText(img, str(i), ((int(boxes[1][i][2]*w)+int(boxes[1][i][0]*w))//2-t_w//2, (int(boxes[1][i][3]*h)-((int(boxes[1][i][3]*h)-int(boxes[1][i][1]*h))-t_h)//2)), font, size, colors[boxes[0][i]], max(2, int(size)))
  return img

# Preprocess Detections
def preprocess(img, boxes):
  i = 0
  while i < len(boxes[0]):
    j = 0
    while j < len(boxes[0]):
      if not ((boxes[1][i][0] == boxes[1][j][0]) and (boxes[1][i][1] == boxes[1][j][1]) and (boxes[1][i][2] == boxes[1][j][2]) and (boxes[1][i][3] == boxes[1][j][3])):
        if (boxes[0][i] == boxes[0][j]) and not ((boxes[1][j][0] > boxes[1][i][2]) or (boxes[1][i][0] > boxes[1][j][2]) or (boxes[1][j][1] > boxes[1][i][3]) or (boxes[1][i][1] > boxes[1][j][3])):
          boxes[1][i] = [min(boxes[1][i][0], boxes[1][j][0]), min(boxes[1][i][1], boxes[1][j][1]), max(boxes[1][i][2], boxes[1][j][2]), max(boxes[1][i][3], boxes[1][j][3])]
          boxes[0].pop(j)
          boxes[1].pop(j)
          j -= 1
          if i > j:
            i -= 1
      j += 1
    i += 1
  return boxes

# Component Prediction Function
def cp_function(img, b=True):
  if b == True:
    img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
  prediction = model.predict(img, classes=[0,1,2], verbose=False)
  boxes = preprocess(img, [prediction[0].boxes.cls.int().tolist(), prediction[0].boxes.xyxyn.tolist()])
  if b == True:
    return labeled_image(img, boxes)[:, :, ::-1]
  else:
    return boxes

# Component Comparison Function
def cc_function(mu, ss):
  mu = cv2.cvtColor(np.array(mu), cv2.COLOR_RGB2BGR)
  ss = cv2.cvtColor(np.array(ss), cv2.COLOR_RGB2BGR)
  mu_boxes = cp_function(mu, False)
  ss_boxes = cp_function(ss, False)
  h, w, _ = mu.shape
  if mu.size > ss.size:
    h = ss.shape[0]
    w = ss.shape[1]
  mu_gray = cv2.resize(cv2.cvtColor(mu, cv2.COLOR_BGR2GRAY), (w,h))
  ss_gray = cv2.resize(cv2.cvtColor(ss, cv2.COLOR_BGR2GRAY), (w,h))
  detections = [[], [], f'PeekAI detected {mu_boxes[0].count(0)} text, {mu_boxes[0].count(1)} input and {mu_boxes[0].count(2)} media elements in your mock-up\nThe following changes need to be made to your code:\n']
  len_o_f = len(detections[2])
  existing_elements = []
  for x1, y1, x2, y2 in mu_boxes[1]:
    template = mu_gray[int(y1*mu_gray.shape[0]):int(y2*mu_gray.shape[0]), int(x1*mu_gray.shape[1]):int(x2*mu_gray.shape[1])]
    res = cv2.matchTemplate(template, ss_gray, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(res)
    if max_val < 0.35:
      detections[0].append(2)
      detections[1].append([x1, y1, x2, y2])
      detections[2] += f' • Add a {int((x2-x1)*ss.shape[1])} by {int((y2-y1)*ss.shape[0])} pixel {classes[mu_boxes[0][mu_boxes[1].index([x1, y1, x2, y2])]]} element at position {len(detections[0])-1}\n'
    else:
      existing_elements.append([max_loc[0]/w, max_loc[1]/h, max_loc[0]/w+(x2-x1), max_loc[1]/h+(y2-y1)])
      x_d = x1 - max_loc[0]/w
      y_d = max_loc[1]/h - y1
      x_t = 0
      y_t = 0
      flag = False
      feedback = f' • Move the {classes[mu_boxes[0][mu_boxes[1].index([x1, y1, x2, y2])]]} element at position {len(detections[0])}'
      len_f = len(feedback)
      if y_d > 0.01 or y_d < -0.01:
        y_t = y_d
        flag = True
        if y_d > 0:
          feedback += f' {int(abs(y_d*ss.shape[0]))} pixels upward'
        else:
          feedback += f' {int(abs(y_d*ss.shape[0]))} pixels downward'
      if x_d > 0.01 or x_d < -0.01:
        x_t = x_d
        if flag == True:
          feedback += ' and'
        if x_d > 0:
          feedback += f' {int(abs(x_d*ss.shape[1]))} pixels to the right'
        else:
          feedback += f' {int(abs(x_d*ss.shape[1]))} pixels to the left'
      if len(feedback) != len_f:
        feedback += '\n'
        detections[0].append(0)
        detections[1].append([max_loc[0]/w, max_loc[1]/h, max_loc[0]/w+(x2-x1), max_loc[1]/h+(y2-y1)])
        detections[2] += feedback
        existing_elements.append([max_loc[0]/w+x_t, max_loc[1]/h+y_t, max_loc[0]/w+(x2-x1)+x_t, max_loc[1]/h+(y2-y1)+y_t])
  delete_dic = [[], [], []]
  for x1, y1, x2, y2 in ss_boxes[1]:
    overlap = 0
    for xd1, yd1, xd2, yd2 in existing_elements:
      w_overlap = min(x2, xd2) - max(x1, xd1)
      h_overlap = min(y2, yd2) - max(y1, yd1)
      if w_overlap > 0 and h_overlap > 0:
        overlap = max(overlap, max((w_overlap*h_overlap)/((x2-x1)*(y2-y1)), (w_overlap*h_overlap)/((xd2-xd1)*(yd2-yd1))))
    if not(overlap > 0.5):
        detections[0].append(1)
        detections[1].append([x1, y1, x2, y2])
        delete_dic[ss_boxes[0][ss_boxes[1].index([x1, y1, x2, y2])]].append(len(detections[0])-1)
  for i in range(len(delete_dic)):
    if len(delete_dic[i]) > 0:
      if len(delete_dic[i]) == 1:
        detections[2] += f' • Delete the {classes[i]} element at position {delete_dic[i][0]}\n'
      else:
        detections[2] += f' • Delete the {classes[i]} elements at positions'
        for j in range(len(delete_dic[i])):
          if j < len(delete_dic[i])-2:
            detections[2] += f' {delete_dic[i][j]},'
          elif j == len(delete_dic[i])-2:
            detections[2] += f' {delete_dic[i][j]}'
          else:
            detections[2] += f' and {delete_dic[i][j]}\n'
  detections[2] = detections[2][:-1]
  if len(detections[2]) == len_o_f-1:
    text = detections[2][16:-68]
    detections[2] = f'Your code matches with all {text} detected in your mock-up!'
    ss = mu
  return labeled_image(ss, detections)[:, :, ::-1], detections[2]

# API Endpoint Function
def api_function(mu, ss):
  mu = cv2.cvtColor(cv2.imdecode(np.frombuffer(base64.b64decode(mu), dtype=np.uint8), cv2.IMREAD_COLOR), cv2.COLOR_RGB2BGR)
  ss = cv2.cvtColor(cv2.imdecode(np.frombuffer(base64.b64decode(ss), dtype=np.uint8), cv2.IMREAD_COLOR), cv2.COLOR_RGB2BGR)
  return cc_function(mu, ss)

# Component Prediction Interface
cp_interface = gr.Interface(
    fn=cp_function,
    inputs=gr.Image(label='Website Screenshot'),
    outputs=gr.Image(label='Detected Components'),
    api_name=False
)

# Component Comparison Interface
cc_interface = gr.Interface(
    fn=cc_function,
    inputs=[gr.Image(label='Mockup'), gr.Image(label='Screenshot')],
    outputs=[gr.Image(label='Diagram'), gr.Textbox(label='Feedback')],
    api_name=False
)

# Base64 Component Comparison Interface
api_interface = gr.Interface(
    fn=api_function,
    inputs=[gr.Textbox(label='Mockup'), gr.Textbox(label='Screenshot')],
    outputs=[gr.Image(label='Diagram'), gr.Textbox(label='Feedback')]
)

# Launch Tabbed Interface
gr.TabbedInterface(
    interface_list=[cp_interface, cc_interface, api_interface],
    tab_names=['Component Prediction', 'Component Comparison', ''],
    title='Peek AI'
).queue().launch()