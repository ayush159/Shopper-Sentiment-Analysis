#!/bin/env python3

from selenium import webdriver
from PIL import Image
from io import BytesIO
import boto3
import time
import datetime
import math, operator
from functools import reduce


s3 = boto3.client('s3',region_name='', aws_access_key_id='',
                  aws_secret_access_key='')


bucketName = "ssaretail-instore-demo-source"


chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('headless')
chrome_options.add_argument('no-sandbox')
driver = webdriver.Chrome(executable_path='/home/ec2-user/chromedriver',chrome_options=chrome_options)
driver.get('https://www.insecam.org/en/view/5185/')
driver.execute_script("window.scrollTo(0, 500);")

count = 0
dayofweek = datetime.datetime.today().weekday()

screenshot = driver.get_screenshot_as_png()
image_obj = Image.open(BytesIO(screenshot))
image1 = image_obj.crop((133, 38, 1263, 730))
image1.save('Screenshots/Img' + str(count) +'_' + str(dayofweek) + '.png')
Key = 'Screenshots/Img' + str(count) +'_' + str(dayofweek) + '.png'
outPutname = 'Img' + str(count) +'_' + str(dayofweek) + '.jpeg'
print('Captured first image.')
s3.upload_file(Key,bucketName,outPutname)
print('Uploaded image ',count)
image1.show()
count += 1
try:
    while True:
        time.sleep(5)
        screenshot = driver.get_screenshot_as_png()
        image_obj = Image.open(BytesIO(screenshot))
        image2 = image_obj.crop((133, 38, 1263, 730))
        h1 = image1.histogram()
        h2 = image2.histogram()
        rms = math.sqrt(reduce(operator.add, map(lambda a,b: (a-b)**2, h1, h2))/len(h1))
        print('RMSE:',rms)
        if rms > 250:
            image1.save('Screenshots/Img'+ str(count) +'_' + str(dayofweek) +'.png')
            Key = 'Screenshots/Img' + str(count) +'_' + str(dayofweek) + '.png'
            outPutname = 'Img' + str(count) +'_' + str(dayofweek) + '.jpeg'
            s3.upload_file(Key, bucketName, outPutname)
            print('Uploaded image ',count)
            image1 = image2
            count += 1
        now = datetime.datetime.now()
        today7pm = now.replace(hour=23, minute=54, second=0, microsecond=0)
        if today7pm < now:
            print('Shop is closing.')
            break
    driver.quit()
except:
    print('Shutting down...')
    driver.quit()