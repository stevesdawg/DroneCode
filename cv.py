from __future__ import print_function
import argparse
import datetime
import imutils
import cv2

import numpy as np
import urllib2 as urlo
import json

def url_to_img(url):
     data = urlo.urlopen(url).read()
     img = np.asarray(bytearray(data), dtype = 'uint8')
     img = cv2.imdecode(img, cv2.IMREAD_COLOR)
     return img

# for i in xrange(100000000):
#     cv2.imshow('img', url_to_img('http://localhost:8080/'))
#     cv2.waitKey(1)

# construct the argument parse and parse the arguments

winStride = (8, 8)
padding = (16, 16)
meanShift = False
scale = 1.05

while True:

    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())


    image = url_to_img('http://localhost:8080/')
    image = imutils.resize(image, width=min(400, image.shape[1]))

    start = datetime.datetime.now()
    (rects, weights) = hog.detectMultiScale(image, winStride=winStride,
        padding=padding, scale=1.05, useMeanshiftGrouping=meanShift)


    boxheight = -1
    boxwidth = -1
    offsetx = -1
    offsety = -1

    for (x, y, w, h) in rects:
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
        boxheight = float(h)
        boxwidth = float(w)
        offsetx = float(x)
        offsety = float(y)

    print (rects)
    data = {
        'boxheight': str(boxheight),
        'boxwidth': str(boxwidth),
        'boxcenterx': str((offsetx + boxwidth)/2),
        'boxcentery': str((offsety + boxheight)/2)
    }

    print(data)

    jsonString = json.dumps(data)
    print(jsonString)
    req = urlo.Request('http://localhost:8080/', jsonString, {'Content-Type': 'application/json'})
    f = urlo.urlopen(req)
    f.close()

    # show the output image
    cv2.imshow("Detections", image)
    cv2.waitKey(1)
